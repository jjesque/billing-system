const { Client, Databases, Storage } = require("node-appwrite")
const nodemailer = require("nodemailer")

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || "http://appwrite/v1")
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)

// Email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Log invoice operation
 */
async function logInvoiceOperation(operation, invoiceId, status, details = {}) {
  try {
    await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "unique()",
      {
        operation,
        invoiceId,
        status,
        timestamp: new Date().toISOString(),
        details: JSON.stringify(details),
      },
    )
  } catch (error) {
    console.error("Failed to log operation:", error)
  }
}

/**
 * Send invoice email
 */
async function sendInvoiceEmail(invoiceData, pdfBuffer) {
  const emailTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Invoice Resent from ${process.env.COMPANY_NAME || "Your Company"}</h2>
          
          <p>Dear ${invoiceData.clientName},</p>
          
          <p>As requested, we are resending your invoice <strong>${invoiceData.invoiceNumber}</strong> for the amount of <strong>${invoiceData.currency} ${invoiceData.finalTotal.toFixed(2)}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Invoice Details:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Invoice Number: ${invoiceData.invoiceNumber}</li>
              <li>Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}</li>
              <li>Total Amount: ${invoiceData.currency} ${invoiceData.finalTotal.toFixed(2)}</li>
            </ul>
          </div>
          
          ${invoiceData.notes ? `<p><strong>Notes:</strong> ${invoiceData.notes}</p>` : ""}
          
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          ${process.env.COMPANY_NAME || "Your Company"}<br>
          ${process.env.COMPANY_EMAIL || "billing@company.com"}</p>
        </div>
      </body>
    </html>
  `

  const emailRecipients = JSON.parse(invoiceData.emailRecipients)

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME || "Your Company"}" <${process.env.SMTP_USER}>`,
    to: emailRecipients.join(", "),
    subject: `[RESENT] Invoice ${invoiceData.invoiceNumber} from ${process.env.COMPANY_NAME || "Your Company"}`,
    html: emailTemplate,
    attachments: [
      {
        filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  }

  return await transporter.sendMail(mailOptions)
}

/**
 * Main function handler
 */
module.exports = async ({ req, res, log, error }) => {
  try {
    const { invoiceId, emailRecipients } = JSON.parse(req.body || "{}")

    if (!invoiceId) {
      return res.json({ success: false, error: "Invoice ID is required" }, 400)
    }

    log(`Resending invoice: ${invoiceId}`)

    // Get invoice data
    const invoice = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      invoiceId,
    )

    // Get PDF file
    const pdfBuffer = await storage.getFileDownload(process.env.APPWRITE_STORAGE_BUCKET_ID, invoice.pdfFileId)

    // Use provided email recipients or fall back to original
    const recipients = emailRecipients || JSON.parse(invoice.emailRecipients)

    // Update invoice data with new recipients if provided
    const invoiceData = {
      ...invoice,
      emailRecipients: JSON.stringify(recipients),
    }

    // Send email
    await sendInvoiceEmail(invoiceData, pdfBuffer)

    // Log successful resend
    await logInvoiceOperation("invoice_resent", invoiceId, "success", {
      recipients,
      originalRecipients: JSON.parse(invoice.emailRecipients),
    })

    log("Invoice resent successfully")

    return res.json({
      success: true,
      message: "Invoice resent successfully",
      recipients,
    })
  } catch (err) {
    error("Failed to resend invoice:", err)

    if (req.body) {
      const { invoiceId } = JSON.parse(req.body)
      await logInvoiceOperation("invoice_resent", invoiceId, "failed", {
        error: err.message,
      })
    }

    return res.json(
      {
        success: false,
        error: err.message,
      },
      500,
    )
  }
}
