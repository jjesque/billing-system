"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Save, Mail, Building, Palette, Shield } from "lucide-react"
import toast from "react-hot-toast"

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company")
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: {
        name: "Your Company Name",
        address: "123 Business St, City, Country",
        email: "billing@yourcompany.com",
        phone: "+1-555-0123",
        website: "https://yourcompany.com",
        taxId: "TAX-123456789",
      },
      email: {
        smtpHost: "smtp.gmail.com",
        smtpPort: "587",
        smtpSecure: false,
        smtpUser: "",
        smtpPass: "",
        fromName: "Your Company Name",
        fromEmail: "",
      },
      invoice: {
        defaultCurrency: "USD",
        defaultDueDays: 30,
        invoicePrefix: "INV",
        taxRates: {
          standard: 21,
          reduced: 9,
          zero: 0,
        },
      },
      security: {
        hmacSecret: "",
        jwtSecret: "",
        requireSignature: true,
      },
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // In a real app, this would save to your backend
      console.log("Settings saved:", data)
      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: "company", name: "Company", icon: Building },
    { id: "email", name: "Email", icon: Mail },
    { id: "invoice", name: "Invoice", icon: Palette },
    { id: "security", name: "Security", icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your billing system configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Settings */}
            {activeTab === "company" && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company Name *</label>
                    <input
                      {...register("company.name", { required: "Company name is required" })}
                      className="input"
                      placeholder="Your Company Name"
                    />
                    {errors.company?.name && <p className="mt-1 text-sm text-red-600">{errors.company.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input
                      {...register("company.email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className="input"
                      placeholder="billing@yourcompany.com"
                    />
                    {errors.company?.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register("company.phone")} className="input" placeholder="+1-555-0123" />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      {...register("company.website")}
                      type="url"
                      className="input"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address *</label>
                    <textarea
                      {...register("company.address", { required: "Address is required" })}
                      className="input"
                      rows={3}
                      placeholder="123 Business St, City, Country"
                    />
                    {errors.company?.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.address.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Tax ID</label>
                    <input {...register("company.taxId")} className="input" placeholder="TAX-123456789" />
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">SMTP Host *</label>
                      <input
                        {...register("email.smtpHost", { required: "SMTP host is required" })}
                        className="input"
                        placeholder="smtp.gmail.com"
                      />
                      {errors.email?.smtpHost && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.smtpHost.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">SMTP Port *</label>
                      <input
                        {...register("email.smtpPort", { required: "SMTP port is required" })}
                        type="number"
                        className="input"
                        placeholder="587"
                      />
                      {errors.email?.smtpPort && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.smtpPort.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">SMTP Username *</label>
                      <input
                        {...register("email.smtpUser", { required: "SMTP username is required" })}
                        className="input"
                        placeholder="your-email@gmail.com"
                      />
                      {errors.email?.smtpUser && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.smtpUser.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">SMTP Password *</label>
                      <input
                        {...register("email.smtpPass", { required: "SMTP password is required" })}
                        type="password"
                        className="input"
                        placeholder="your-app-password"
                      />
                      {errors.email?.smtpPass && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.smtpPass.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input {...register("email.smtpSecure")} type="checkbox" className="mr-2" />
                    <label className="text-sm text-gray-700">Use secure connection (TLS)</label>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Email Template Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">From Name</label>
                        <input {...register("email.fromName")} className="input" placeholder="Your Company Name" />
                      </div>
                      <div>
                        <label className="label">From Email</label>
                        <input
                          {...register("email.fromEmail")}
                          type="email"
                          className="input"
                          placeholder="noreply@yourcompany.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Settings */}
            {activeTab === "invoice" && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Configuration</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Default Currency</label>
                      <select {...register("invoice.defaultCurrency")} className="input">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Default Due Days</label>
                      <input
                        {...register("invoice.defaultDueDays", { valueAsNumber: true })}
                        type="number"
                        className="input"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="label">Invoice Prefix</label>
                      <input {...register("invoice.invoicePrefix")} className="input" placeholder="INV" />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Tax Rates (%)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Standard Rate</label>
                        <input
                          {...register("invoice.taxRates.standard", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="21"
                        />
                      </div>
                      <div>
                        <label className="label">Reduced Rate</label>
                        <input
                          {...register("invoice.taxRates.reduced", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="9"
                        />
                      </div>
                      <div>
                        <label className="label">Zero Rate</label>
                        <input
                          {...register("invoice.taxRates.zero", { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          className="input"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <Shield className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          These settings control API security. Keep your secrets secure and never share them publicly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="label">HMAC Secret Key</label>
                      <input
                        {...register("security.hmacSecret")}
                        type="password"
                        className="input"
                        placeholder="Enter a strong secret key for HMAC signing"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Used to sign API requests for security. Generate a random 32+ character string.
                      </p>
                    </div>
                    <div>
                      <label className="label">JWT Secret Key</label>
                      <input
                        {...register("security.jwtSecret")}
                        type="password"
                        className="input"
                        placeholder="Enter a strong secret key for JWT tokens"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Used for JWT token signing. Should be different from HMAC secret.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input {...register("security.requireSignature")} type="checkbox" className="mr-2" />
                    <label className="text-sm text-gray-700">Require HMAC signature for API requests</label>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
