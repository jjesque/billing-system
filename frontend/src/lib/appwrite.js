import { Client, Account, Databases, Storage, Functions } from "appwrite"

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "68b505f00008ca966964")

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

export const config = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID, // 68b50b76001825e091b4
  collectionsId: {
    invoices: import.meta.env.VITE_APPWRITE_INVOICES_COLLECTION_ID, // 68bd4e85001a32b4372
    clients: import.meta.env.VITE_APPWRITE_CLIENTS_COLLECTION_ID,
    logs: import.meta.env.VITE_APPWRITE_LOGS_COLLECTION_ID,
  },
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID,
  functionsId: {
    generateInvoice: import.meta.env.VITE_APPWRITE_GENERATE_INVOICE_FUNCTION_ID,
    resendInvoice: import.meta.env.VITE_APPWRITE_RESEND_INVOICE_FUNCTION_ID,
    getLogs: import.meta.env.VITE_APPWRITE_GET_LOGS_FUNCTION_ID,
  },
}
console.log("Invoices Collection ID:", import.meta.env.VITE_APPWRITE_INVOICES_COLLECTION_ID)


console.log("[v0] Appwrite Config:", {
  endpoint: client.config.endpoint,
  project: client.config.project,
  databaseId: config.databaseId,
  collections: config.collectionsId,
})

export { client }
