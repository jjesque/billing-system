import React, { createContext, useContext } from 'react'
import { Client, Account, Databases, Storage, Functions } from 'appwrite'

const AppwriteContext = createContext()

export const useAppwrite = () => {
  const context = useContext(AppwriteContext)
  if (!context) {
    throw new Error('useAppwrite must be used within an AppwriteProvider')
  }
  return context
}

export const AppwriteProvider = ({ children }) => {
  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

  const account = new Account(client)
  const databases = new Databases(client)
  const storage = new Storage(client)
  const functions = new Functions(client)

  const value = {
    client,
    account,
    databases,
    storage,
    functions,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID
  }

  return (
    <AppwriteContext.Provider value={value}>
      {children}
    </AppwriteContext.Provider>
  )
}