const { z } = require("zod");

const supabase = require("../config/supabase");
const sendEmail = require("../utils/sendEmail");


// ============================================================
// CONTACT VALIDATION
// Matches your current React Contact.jsx form
// ============================================================

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100),

  organization: z
    .string()
    .min(2, "Organization is required.")
    .max(150),

  email: z
    .string()
    .email("Please enter a valid email address."),

  country: z
    .string()
    .max(100)
    .optional()
    .default(""),

  partnership: z
    .string()
    .min(1, "Please select what you are exploring.")
    .max(160),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000),
});


// ============================================================
// CREATE CONTACT / PARTNERSHIP INQUIRY
// POST /api/contact
// ============================================================

async function createContact(req, res) {
  try {
    const data = contactSchema.parse(req.body);

    const {
      data: contact,
      error,
    } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: data.name.trim(),

          organization:
            data.organization.trim(),

          email:
            data.email
              .trim()
              .toLowerCase(),

          country:
            data.country?.trim() || null,

          partnership:
            data.partnership.trim(),

          message:
            data.message.trim(),

          status: "new",
        },
      ])
      .select()
      .single();


    if (error) {
      console.error(
        "Supabase contact insert failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save your inquiry. Please try again.",
      });
    }


    // ========================================================
    // EMAIL NOTIFICATION
    // ========================================================

    sendEmail({
      subject:
        `New Continental Founders inquiry: ${data.partnership}`,

      replyTo:
        data.email,

      html: `
        <h2>New Partnership Inquiry</h2>

        <p>
          <strong>Name:</strong>
          ${escapeHtml(data.name)}
        </p>

        <p>
          <strong>Organization:</strong>
          ${escapeHtml(data.organization)}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(data.email)}
        </p>

        <p>
          <strong>Country / Region:</strong>
          ${escapeHtml(
            data.country || "Not provided"
          )}
        </p>

        <p>
          <strong>Partnership Interest:</strong>
          ${escapeHtml(data.partnership)}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <p>
          ${escapeHtml(data.message)
            .replace(/\n/g, "<br>")}
        </p>
      `,
    }).catch((error) => {
      console.error(
        "Email notification failed:",
        error.message
      );
    });


    return res.status(201).json({
      success: true,

      message:
        "Thank you. Your partnership inquiry has been received.",

      id:
        contact.id,

      contact,
    });

  } catch (error) {

    // ========================================================
    // ZOD VALIDATION ERROR
    // ========================================================

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,

        message:
          "Please check the information you entered.",

        errors:
          error.issues,
      });
    }


    console.error(
      "Create contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while submitting your inquiry.",
    });
  }
}


// ============================================================
// LIST CONTACTS
// GET /api/contact
// ADMIN
// ============================================================

async function listContacts(req, res) {
  try {
    const {
      status,
      page = 1,
      limit = 20,
    } = req.query;


    const pageNum =
      Math.max(
        Number(page) || 1,
        1
      );


    const limitNum =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );


    const from =
      (pageNum - 1) *
      limitNum;


    const to =
      from +
      limitNum -
      1;


    let query =
      supabase
        .from("contact_messages")
        .select(
          "*",
          {
            count: "exact",
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .range(
          from,
          to
        );


    if (status) {
      query =
        query.eq(
          "status",
          status
        );
    }


    const {
      data: items,
      count,
      error,
    } =
      await query;


    if (error) {
      console.error(
        "Supabase contact list error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve contacts.",
      });
    }


    return res.json({
      success: true,

      items:
        items || [],

      pagination: {
        page:
          pageNum,

        limit:
          limitNum,

        total:
          count || 0,

        pages:
          Math.ceil(
            (count || 0) /
            limitNum
          ),
      },
    });

  } catch (error) {

    console.error(
      "List contacts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve contacts.",
    });
  }
}


// ============================================================
// UPDATE CONTACT STATUS
// PATCH /api/contact/:id/status
// ============================================================

async function updateContactStatus(req, res) {
  try {
    const schema =
      z.object({
        status:
          z.enum([
            "new",
            "read",
            "replied",
            "closed",
          ]),
      });


    const {
      status,
    } =
      schema.parse(
        req.body
      );


    const {
      data: item,
      error,
    } =
      await supabase
        .from(
          "contact_messages"
        )
        .update({
          status,
        })
        .eq(
          "id",
          req.params.id
        )
        .select()
        .maybeSingle();


    if (error) {
      console.error(
        "Supabase status update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update contact status.",
      });
    }


    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Contact not found.",
      });
    }


    return res.json({
      success: true,
      item,
    });

  } catch (error) {

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contact status.",
        errors:
          error.issues,
      });
    }


    console.error(
      "Update contact error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update contact status.",
    });
  }
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value = "") {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createContact,
  listContacts,
  updateContactStatus,
};