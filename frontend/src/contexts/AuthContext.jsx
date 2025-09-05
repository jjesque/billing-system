"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { account } from "../lib/appwrite"
import { ID } from "appwrite"



const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const me = await account.get()
      setUser(me)
    } catch (error) {
      if (error?.code !== 401) console.error("checkAuth error:", error.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log("Login attempt:", email, password)

      await account.createEmailPasswordSession(email, password) // ✅ pass as parameters

      const session = await account.get()
      setUser(session)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }


  const logout = async () => {
    try {
      await account.deleteSession("current")
      setUser(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

const register = async (email, password, name) => {
  try {
    // ✅ Pass ID.unique() as the first parameter
    await account.create(ID.unique(), email, password, name);

    // Log in the user immediately
    return await login(email, password);
  } catch (error) {
    return { success: false, error: error.message };
  }
};






  const value = { user, loading, login, logout, register, checkAuth }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
