const sendEmail =
  require("../utils/sendEmail");


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(
  value
) {

  return String(
    value || ""
  )
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


/* ============================================================
   FORMAT CONTENT TYPE
============================================================ */

function formatContentType(
  value
) {

  return String(
    value || "Update"
  )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );

}


/* ============================================================
   BUILD TEXT VERSION
============================================================ */

function buildTextVersion({
  title,
  summary,
  url,
  contentType,
}) {

  const type =
    formatContentType(
      contentType
    );


  return `
CONTINENTAL FOUNDERS

Talent is everywhere. Access is not.

${type}

${title}

${summary || ""}

Read more:
${url}

You are receiving this email because you subscribed to Continental Founders updates.
`.trim();

}


/* ============================================================
   BUILD HTML EMAIL
============================================================ */

function buildNewsletterEmail({
  title,
  summary,
  url,
  imageUrl,
  contentType,
}) {

  const safeTitle =
    escapeHtml(
      title
    );


  const safeSummary =
    escapeHtml(
      summary
    );


  const safeUrl =
    escapeHtml(
      url
    );


  const safeImage =
    imageUrl
      ? escapeHtml(
          imageUrl
        )
      : "";


  const label =
    escapeHtml(
      formatContentType(
        contentType
      ).toUpperCase()
    );


  const year =
    new Date()
      .getFullYear();


  return `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ${safeTitle}
  </title>

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#f2f4f6;
    font-family:Arial,Helvetica,sans-serif;
    color:#14283b;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="
      width:100%;
      background:#f2f4f6;
      padding:32px 14px;
    "
  >

    <tr>

      <td align="center">

        <table
          width="620"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="
            width:100%;
            max-width:620px;
            background:#ffffff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(7,24,43,0.08);
          "
        >

          <!-- ================================================
               HEADER
          ================================================= -->

          <tr>

            <td
              style="
                background:#07182b;
                padding:28px 34px;
              "
            >

              <div
                style="
                  color:#d7aa4b;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:2px;
                "
              >
                CONTINENTAL FOUNDERS
              </div>


              <div
                style="
                  color:#ffffff;
                  font-size:13px;
                  margin-top:8px;
                "
              >
                Talent is everywhere. Access is not.
              </div>

            </td>

          </tr>


          <!-- ================================================
               FEATURED IMAGE
          ================================================= -->

          ${
            safeImage
              ? `
          <tr>

            <td>

              <img
                src="${safeImage}"
                alt=""
                width="620"
                style="
                  display:block;
                  width:100%;
                  max-width:620px;
                  max-height:340px;
                  object-fit:cover;
                "
              />

            </td>

          </tr>
          `
              : ""
          }


          <!-- ================================================
               CONTENT
          ================================================= -->

          <tr>

            <td
              style="
                padding:36px 34px;
              "
            >

              <div
                style="
                  margin-bottom:12px;
                  color:#b78a2f;
                  font-size:11px;
                  font-weight:700;
                  letter-spacing:1.6px;
                "
              >
                ${label}
              </div>


              <h1
                style="
                  margin:0 0 16px;
                  color:#0b2239;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:30px;
                  line-height:1.25;
                "
              >
                ${safeTitle}
              </h1>


              ${
                safeSummary
                  ? `
              <p
                style="
                  margin:0 0 28px;
                  color:#556778;
                  font-size:15px;
                  line-height:1.8;
                "
              >
                ${safeSummary}
              </p>
              `
                  : ""
              }


              <a
                href="${safeUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:inline-block;
                  padding:14px 22px;
                  background:#d8aa49;
                  color:#07182b;
                  text-decoration:none;
                  border-radius:6px;
                  font-size:14px;
                  font-weight:700;
                "
              >
                Read More
              </a>

            </td>

          </tr>


          <!-- ================================================
               FOOTER
          ================================================= -->

          <tr>

            <td
              style="
                padding:24px 34px;
                background:#f6f7f8;
                border-top:1px solid #e6eaed;
                color:#768592;
                font-size:12px;
                line-height:1.7;
              "
            >

              You are receiving this email because
              you subscribed to Continental Founders updates.

              <br />

              © ${year}
              Continental Founders™.
              All rights reserved.

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
`;

}


/* ============================================================
   SEND NEWSLETTER CAMPAIGN
============================================================ */

async function sendNewsletterCampaign({
  recipients,
  subject,
  title,
  summary,
  url,
  imageUrl,
  contentType,
}) {

  const recipientList =
    Array.isArray(
      recipients
    )
      ? recipients
          .map(
            (
              recipient
            ) =>
              String(
                recipient ||
                ""
              )
                .trim()
                .toLowerCase()
          )
          .filter(Boolean)
      : [];


  /* ----------------------------------------------------------
     REMOVE DUPLICATE EMAIL ADDRESSES
  ---------------------------------------------------------- */

  const uniqueRecipients =
    [
      ...new Set(
        recipientList
      ),
    ];


  if (
    uniqueRecipients.length ===
    0
  ) {

    return {

      sentCount:
        0,

      failedCount:
        0,

      skippedCount:
        0,

      totalRecipients:
        0,

    };

  }


  const html =
    buildNewsletterEmail({

      title,

      summary,

      url,

      imageUrl,

      contentType,

    });


  const text =
    buildTextVersion({

      title,

      summary,

      url,

      contentType,

    });


  let sentCount =
    0;


  let failedCount =
    0;


  let skippedCount =
    0;


  /* ==========================================================
     SEND INDIVIDUALLY

     Never place every subscriber in one visible "To" field.
  ========================================================== */

  for (
    const recipient
    of uniqueRecipients
  ) {

    try {

      const result =
        await sendEmail({

          to:
            recipient,

          subject,

          html,

          text,

        });


      if (
        result?.success ===
        true
      ) {

        sentCount +=
          1;

        continue;

      }


      if (
        result?.skipped ===
        true
      ) {

        skippedCount +=
          1;

        console.warn(
          `Newsletter email skipped for ${recipient}.`
        );

        continue;

      }


      failedCount +=
        1;

    } catch (
      error
    ) {

      failedCount +=
        1;


      console.error(
        `Newsletter email failed for ${recipient}:`,
        error?.message ||
        error
      );

    }

  }


  return {

    sentCount,

    failedCount,

    skippedCount,

    totalRecipients:
      uniqueRecipients.length,

  };

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

  sendNewsletterCampaign,

};