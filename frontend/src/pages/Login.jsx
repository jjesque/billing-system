"use client"

import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"

const Login = () => {
  const { user, login, register } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let result
      if (isRegistering) {
        result = await register(data.email, data.password, data.name)
      } else {
        result = await login(data.email, data.password)
      }

      if (result.success) {
        toast.success(isRegistering ? "Account created successfully!" : "Welcome back!")
        reset()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {isRegistering ? "Create your account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering ? "Start managing your invoices today" : "Access your billing dashboard"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  {...registerField("name", { required: "Name is required" })}
                  type="text"
                  className="input"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                {...registerField("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                {...registerField("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                type="password"
                className="input"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRegistering ? "Creating Account..." : "Signing In..."}
                </div>
              ) : isRegistering ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                reset()
              }}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
