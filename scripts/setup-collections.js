const { Client, Databases, Storage } = require("node-appwrite")
require("dotenv").config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)

async function setupCollections() {
  try {
    console.log("🗄️ Setting up database collections...")

    // Clients Collection Attributes
    console.log("📋 Setting up Clients collection attributes...")
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CLIENTS_COLLECTION_ID,
      "name",
      255,
      true,
    )
    await databases.createEmailAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CLIENTS_COLLECTION_ID,
      "email",
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CLIENTS_COLLECTION_ID,
      "address",
      1000,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CLIENTS_COLLECTION_ID,
      "taxId",
      100,
      false,
    )

    // Invoices Collection Attributes
    console.log("📋 Setting up Invoices collection attributes...")
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "invoiceNumber",
      50,
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "sourceSystem",
      100,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "sourceId",
      100,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "clientName",
      255,
      true,
    )
    await databases.createEmailAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "clientEmail",
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "clientAddress",
      1000,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "clientTaxId",
      100,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "items",
      10000,
      true,
    )
    await databases.createFloatAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "subtotal",
      true,
    )
    await databases.createFloatAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "markupTotal",
      false,
    )
    await databases.createFloatAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "discountTotal",
      false,
    )
    await databases.createFloatAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "totalTax",
      true,
    )
    await databases.createFloatAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "finalTotal",
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "currency",
      10,
      true,
    )
    await databases.createDatetimeAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "dueDate",
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "notes",
      2000,
      false,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "emailRecipients",
      1000,
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "pdfFileId",
      100,
      true,
    )
    await databases.createEnumAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "status",
      ["generated", "sent", "paid", "overdue", "cancelled"],
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "metadata",
      5000,
      false,
    )

    // Invoice Logs Collection Attributes
    console.log("📋 Setting up Invoice Logs collection attributes...")
    await databases.createEnumAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "operation",
      ["invoice_generated", "email_sent", "invoice_resent", "invoice_viewed", "invoice_paid"],
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "invoiceId",
      100,
      true,
    )
    await databases.createEnumAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "status",
      ["success", "failed", "pending"],
      true,
    )
    await databases.createDatetimeAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "timestamp",
      true,
    )
    await databases.createStringAttribute(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "details",
      5000,
      false,
    )

    console.log("⏳ Waiting for attributes to be available...")
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Create indexes
    console.log("🔍 Creating database indexes...")

    // Invoices indexes
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "invoiceNumber",
      "key",
      ["invoiceNumber"],
    )
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "clientEmail",
      "key",
      ["clientEmail"],
    )
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "status",
      "key",
      ["status"],
    )
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "dueDate",
      "key",
      ["dueDate"],
    )

    // Logs indexes
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "invoiceId",
      "key",
      ["invoiceId"],
    )
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "operation",
      "key",
      ["operation"],
    )
    await databases.createIndex(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "timestamp",
      "key",
      ["timestamp"],
    )

    console.log("✅ Database collections setup completed!")
  } catch (error) {
    console.error("❌ Collection setup failed:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  setupCollections()
}

module.exports = { setupCollections }
