const { Client, Databases, Storage, Functions, Users } = require("node-appwrite")
require("dotenv").config()

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY)

const databases = new Databases(client)
const storage = new Storage(client)
const functions = new Functions(client)
const users = new Users(client)

async function setupAppwrite() {
  try {
    console.log("🚀 Setting up Appwrite backend...")

    // Create database
    console.log("📊 Creating database...")
    await databases.create(process.env.APPWRITE_DATABASE_ID, "Billing Database")

    // Create collections
    console.log("📋 Creating collections...")

    // Clients collection
    await databases.createCollection(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_CLIENTS_COLLECTION_ID,
      "Clients",
    )

    // Invoices collection
    await databases.createCollection(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_INVOICES_COLLECTION_ID,
      "Invoices",
    )

    // Invoice logs collection
    await databases.createCollection(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      "Invoice Logs",
    )

    // Create storage bucket
    console.log("🗄️ Creating storage bucket...")
    await storage.createBucket(
      process.env.APPWRITE_STORAGE_BUCKET_ID,
      "Invoice PDFs",
      ['read("any")'],
      ['create("users")'],
      ['update("users")'],
      ['delete("users")'],
      true,
      false,
      30000000, // 30MB max file size
      ["pdf"],
      "gzip",
      true,
    )

    console.log("✅ Appwrite backend setup completed successfully!")
    console.log("📝 Next steps:")
    console.log("1. Deploy the Appwrite functions")
    console.log("2. Configure collection attributes and indexes")
    console.log("3. Set up user roles and permissions")
  } catch (error) {
    console.error("❌ Setup failed:", error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  setupAppwrite()
}

module.exports = { setupAppwrite }
