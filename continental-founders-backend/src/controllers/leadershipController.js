const { z } =
  require("zod");

const supabase =
  require("../config/supabase");


// ============================================================
// VALIDATION
// ============================================================

const leadershipSchema =
  z.object({

    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Leader name is required."
        )
        .max(
          180,
          "Leader name is too long."
        ),


    position:
      z
        .string()
        .trim()
        .min(
          2,
          "Position is required."
        )
        .max(
          180,
          "Position is too long."
        ),


    email:
      z
        .union([
          z
            .string()
            .trim()
            .email(
              "Enter a valid email address."
            ),

          z.literal(""),
        ])
        .optional()
        .default(""),


    image:
      z
        .string()
        .trim()
        .max(
          1000,
          "Image URL is too long."
        )
        .optional()
        .default(""),


    bio:
      z
        .string()
        .trim()
        .max(
          10000,
          "Biography is too long."
        )
        .optional()
        .default(""),


    status:
      z
        .enum([
          "active",
          "draft",
          "inactive",
        ])
        .optional()
        .default(
          "active"
        ),


    display_order:
      z
        .coerce
        .number()
        .int()
        .min(0)
        .max(10000)
        .optional()
        .default(0),

  });


// ============================================================
// UPDATE VALIDATION
// ============================================================

const leadershipUpdateSchema =
  leadershipSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(
          data
        ).length > 0,

      {
        message:
          "At least one field must be provided.",
      }
    );


// ============================================================
// FORMAT VALIDATION ERROR
// ============================================================

function getValidationMessage(
  error
) {
  return (
    error?.issues?.[0]?.message ||
    "Invalid leadership data."
  );
}


// ============================================================
// GET PUBLIC LEADERSHIP
//
// GET /api/leadership
//
// Only active leadership profiles are exposed publicly.
// ============================================================

async function getLeadership(
  req,
  res
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .select(
        `
          id,
          name,
          position,
          email,
          image,
          bio,
          status,
          display_order,
          created_at,
          updated_at
        `
      )
      .eq(
        "status",
        "active"
      )
      .order(
        "display_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );


  if (error) {
    console.error(
      "[LEADERSHIP] Unable to load public leadership:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to load leadership profiles.",
      });
  }


  return res
    .status(200)
    .json({
      success:
        true,

      leaders:
        data || [],
    });
}


// ============================================================
// GET ADMIN LEADERSHIP
//
// GET /api/leadership/admin
//
// Includes active, draft and inactive profiles.
// ============================================================

async function getAdminLeadership(
  req,
  res
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .select(
        `
          id,
          name,
          position,
          email,
          image,
          bio,
          status,
          display_order,
          created_at,
          updated_at
        `
      )
      .order(
        "display_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );


  if (error) {
    console.error(
      "[LEADERSHIP] Unable to load admin leadership:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to load leadership profiles.",
      });
  }


  return res
    .status(200)
    .json({
      success:
        true,

      leaders:
        data || [],
    });
}


// ============================================================
// GET ONE LEADER
//
// GET /api/leadership/:id
// ============================================================

async function getLeader(
  req,
  res
) {
  const {
    id,
  } =
    req.params;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .select(
        `
          id,
          name,
          position,
          email,
          image,
          bio,
          status,
          display_order,
          created_at,
          updated_at
        `
      )
      .eq(
        "id",
        id
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();


  if (error) {
    console.error(
      "[LEADERSHIP] Unable to load profile:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to load leadership profile.",
      });
  }


  if (!data) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          "Leadership profile not found.",
      });
  }


  return res
    .status(200)
    .json({
      success:
        true,

      leader:
        data,
    });
}


// ============================================================
// CREATE LEADER
//
// POST /api/leadership
// ADMIN ONLY
// ============================================================

async function createLeader(
  req,
  res
) {
  const parsed =
    leadershipSchema.safeParse(
      req.body
    );


  if (!parsed.success) {
    return res
      .status(400)
      .json({
        success:
          false,

        message:
          getValidationMessage(
            parsed.error
          ),

        errors:
          parsed.error.flatten(),
      });
  }


  const payload = {
    name:
      parsed.data.name,

    position:
      parsed.data.position,

    email:
      parsed.data.email ||
      null,

    image:
      parsed.data.image ||
      null,

    bio:
      parsed.data.bio ||
      null,

    status:
      parsed.data.status,

    display_order:
      parsed.data.display_order,
  };


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .insert(
        payload
      )
      .select()
      .single();


  if (error) {
    console.error(
      "[LEADERSHIP] Create failed:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to create leadership profile.",
      });
  }


  return res
    .status(201)
    .json({
      success:
        true,

      message:
        "Leadership profile created successfully.",

      leader:
        data,
    });
}


// ============================================================
// UPDATE LEADER
//
// PATCH /api/leadership/:id
// ADMIN ONLY
// ============================================================

async function updateLeader(
  req,
  res
) {
  const {
    id,
  } =
    req.params;


  const parsed =
    leadershipUpdateSchema.safeParse(
      req.body
    );


  if (!parsed.success) {
    return res
      .status(400)
      .json({
        success:
          false,

        message:
          getValidationMessage(
            parsed.error
          ),

        errors:
          parsed.error.flatten(),
      });
  }


  const payload = {
    ...parsed.data,
  };


  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "email"
    ) &&
    !payload.email
  ) {
    payload.email =
      null;
  }


  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "image"
    ) &&
    !payload.image
  ) {
    payload.image =
      null;
  }


  if (
    Object.prototype.hasOwnProperty.call(
      payload,
      "bio"
    ) &&
    !payload.bio
  ) {
    payload.bio =
      null;
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .update(
        payload
      )
      .eq(
        "id",
        id
      )
      .select()
      .maybeSingle();


  if (error) {
    console.error(
      "[LEADERSHIP] Update failed:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to update leadership profile.",
      });
  }


  if (!data) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          "Leadership profile not found.",
      });
  }


  return res
    .status(200)
    .json({
      success:
        true,

      message:
        "Leadership profile updated successfully.",

      leader:
        data,
    });
}


// ============================================================
// DELETE LEADER
//
// DELETE /api/leadership/:id
// ADMIN ONLY
// ============================================================

async function deleteLeader(
  req,
  res
) {
  const {
    id,
  } =
    req.params;


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "leadership"
      )
      .delete()
      .eq(
        "id",
        id
      )
      .select(
        "id, name"
      )
      .maybeSingle();


  if (error) {
    console.error(
      "[LEADERSHIP] Delete failed:",
      error
    );

    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to delete leadership profile.",
      });
  }


  if (!data) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          "Leadership profile not found.",
      });
  }


  return res
    .status(200)
    .json({
      success:
        true,

      message:
        "Leadership profile deleted successfully.",

      deleted:
        {
          id:
            data.id,

          name:
            data.name,
        },
    });
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getLeadership,
  getAdminLeadership,
  getLeader,
  createLeader,
  updateLeader,
  deleteLeader,
};