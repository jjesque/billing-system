import { Client, Account, Databases, Storage, Functions } from "appwrite"

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "billing-system")

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

export const config = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || "billing-db",
  collectionsId: {
    invoices: import.meta.env.VITE_APPWRITE_INVOICES_COLLECTION_ID || "invoices",
    logs: import.meta.env.VITE_APPWRITE_LOGS_COLLECTION_ID || "invoice-logs",
    clients: import.meta.env.VITE_APPWRITE_CLIENTS_COLLECTION_ID || "clients",
  },
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || "invoice-pdfs",
  functionsId: {
    generateInvoice: import.meta.env.VITE_APPWRITE_GENERATE_INVOICE_FUNCTION_ID || "generate-invoice",
    resendInvoice: import.meta.env.VITE_APPWRITE_RESEND_INVOICE_FUNCTION_ID || "resend-invoice",
    getLogs: import.meta.env.VITE_APPWRITE_GET_LOGS_FUNCTION_ID || "get-logs",
  },
}

console.log("[v0] Appwrite Config:", {
  endpoint: client.config.endpoint,
  project: client.config.project,
  databaseId: config.databaseId,
  collections: config.collectionsId,
})

export { client }
