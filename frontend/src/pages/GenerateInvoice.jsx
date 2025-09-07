"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { functions, config } from "../lib/appwrite"
import {
  Plus,
  Trash2,
  Download,
  FileText,
  User,
  Mail,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  FileCheck,
  Sparkles,
  Upload,
  FileSpreadsheet,
} from "lucide-react"
import toast from "react-hot-toast"

import "../style/GenerateInvoice.css"

const GenerateInvoice = () => {
  const [generating, setGenerating] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fade in animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      client: {
        name: "",
        email: "",
        address: "",
        taxId: "",
      },
      items: [
        {
          description: "",
          qty: 1,
          unitPrice: 0,
          taxCategory: "standard",
        },
      ],
      markups: [],
      discounts: [],
      currency: "USD",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
      metadata: {
        projectCode: "",
      },
    },
  })

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  })

  const {
    fields: markupFields,
    append: appendMarkup,
    remove: removeMarkup,
  } = useFieldArray({
    control,
    name: "markups",
  })

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control,
    name: "discounts",
  })

  const watchedItems = watch("items")
  const watchedMarkups = watch("markups")
  const watchedDiscounts = watch("discounts")
  const watchedCurrency = watch("currency")

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      PHP: "₱",
    }
    return symbols[currency] || "$"
  }

  // CSV Upload Handler
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }

    setUploading(true)
    try {
      const text = await file.text()
      const Papa = await import("papaparse")

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          try {
            const data = results.data

            if (data.length === 0) {
              toast.error("CSV file is empty")
              return
            }

            // Prepare the form data structure
            const formData = {
              client: {
                name: "",
                email: "",
                address: "",
                taxId: "",
              },
              items: [],
              markups: [],
              discounts: [],
              currency: "USD",
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              notes: "",
              metadata: {
                projectCode: "",
              },
            }

            // Extract client info from first row (if available)
            const firstRow = data[0]
            const clientFields = {
              client_name: "name",
              clientname: "name",
              name: "name",
              company: "name",
              client_email: "email",
              clientemail: "email",
              email: "email",
              client_address: "address",
              clientaddress: "address",
              address: "address",
              client_tax_id: "taxId",
              clienttaxid: "taxId",
              tax_id: "taxId",
              taxid: "taxId",
              tin: "taxId",
            }

            Object.entries(firstRow).forEach(([key, value]) => {
              const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "")
              const clientField = clientFields[normalizedKey]
              if (clientField && value && value.toString().trim()) {
                formData.client[clientField] = value.toString().trim()
              }
            })

            // Extract invoice-level data
            const invoiceFields = {
              currency: "currency",
              due_date: "dueDate",
              duedate: "dueDate",
              notes: "notes",
              project_code: "projectCode",
              projectcode: "projectCode",
            }

            Object.entries(firstRow).forEach(([key, value]) => {
              const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "")
              const invoiceField = invoiceFields[normalizedKey]

              if (invoiceField && value && value.toString().trim()) {
                if (invoiceField === "projectCode") {
                  formData.metadata.projectCode = value.toString().trim()
                } else if (invoiceField === "dueDate") {
                  // Try to parse the date
                  const dateValue = new Date(value.toString().trim())
                  if (!isNaN(dateValue.getTime())) {
                    formData.dueDate = dateValue.toISOString().split("T")[0]
                  }
                } else if (invoiceField === "currency") {
                  const currencyValue = value.toString().trim().toUpperCase()
                  if (["USD", "EUR", "GBP", "CAD", "PHP"].includes(currencyValue)) {
                    formData.currency = currencyValue
                  }
                } else {
                  formData[invoiceField] = value.toString().trim()
                }
              }
            })

            // Extract items
            data.forEach((row) => {
              const itemFields = {
                description: "description",
                item_description: "description",
                itemdescription: "description",
                product: "description",
                service: "description",
                qty: "qty",
                quantity: "qty",
                amount: "qty",
                unit_price: "unitPrice",
                unitprice: "unitPrice",
                price: "unitPrice",
                rate: "unitPrice",
                tax_category: "taxCategory",
                taxcategory: "taxCategory",
                tax: "taxCategory",
                vat: "taxCategory",
              }

              const item = {
                description: "",
                qty: 1,
                unitPrice: 0,
                taxCategory: "standard",
              }

              let hasValidItem = false

              Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "")
                const itemField = itemFields[normalizedKey]

                if (itemField && value && value.toString().trim()) {
                  if (itemField === "description") {
                    item.description = value.toString().trim()
                    hasValidItem = true
                  } else if (itemField === "qty") {
                    const qtyValue = Number.parseFloat(value.toString().trim())
                    if (!isNaN(qtyValue) && qtyValue > 0) {
                      item.qty = qtyValue
                    }
                  } else if (itemField === "unitPrice") {
                    const priceValue = Number.parseFloat(value.toString().trim())
                    if (!isNaN(priceValue) && priceValue >= 0) {
                      item.unitPrice = priceValue
                    }
                  } else if (itemField === "taxCategory") {
                    const taxValue = value.toString().trim().toLowerCase()
                    if (taxValue.includes("standard") || taxValue.includes("21")) {
                      item.taxCategory = "standard"
                    } else if (taxValue.includes("reduced") || taxValue.includes("9")) {
                      item.taxCategory = "reduced"
                    } else if (taxValue.includes("zero") || taxValue.includes("0")) {
                      item.taxCategory = "zero"
                    }
                  }
                }
              })

              if (hasValidItem && item.description) {
                formData.items.push(item)
              }
            })

            // Extract markups and discounts (looking for specific patterns)
            data.forEach((row) => {
              Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "")
                const numValue = Number.parseFloat(value?.toString().trim() || "0")

                if (!isNaN(numValue) && numValue > 0) {
                  if (
                    normalizedKey.includes("markup") ||
                    normalizedKey.includes("additionalcharge") ||
                    normalizedKey.includes("surcharge")
                  ) {
                    const isPercentage = value.toString().includes("%") || normalizedKey.includes("percentage")
                    formData.markups.push({
                      type: isPercentage ? "percentage" : "amount",
                      value: numValue,
                    })
                  } else if (normalizedKey.includes("discount")) {
                    const isPercentage = value.toString().includes("%") || normalizedKey.includes("percentage")
                    formData.discounts.push({
                      type: isPercentage ? "percentage" : "amount",
                      value: numValue,
                    })
                  }
                }
              })
            })

            // If no items were found, show an error
            if (formData.items.length === 0) {
              toast.error(
                "No valid items found in CSV. Please ensure you have columns like 'description', 'qty', 'unit_price'",
              )
              return
            }

            // Reset form with parsed data
            reset(formData)
            toast.success(
              `CSV uploaded successfully! Found ${formData.items.length} item(s)${formData.client.name ? ` for ${formData.client.name}` : ""}`,
            )
          } catch (error) {
            console.error("Error parsing CSV:", error)
            toast.error("Error parsing CSV file. Please check the format.")
          }
        },
        error: (error) => {
          console.error("Papa Parse error:", error)
          toast.error("Error reading CSV file")
        },
      })
    } catch (error) {
      console.error("File reading error:", error)
      toast.error("Error reading file")
    } finally {
      setUploading(false)
      // Reset the file input
      event.target.value = ""
    }
  }

  // Calculate totals for preview
  const calculatePreviewTotals = () => {
    const TAX_RATES = {
      standard: 0.21,
      reduced: 0.09,
      zero: 0.0,
    }

    let subtotal = 0
    let totalTax = 0

    watchedItems?.forEach((item) => {
      if (item.qty && item.unitPrice) {
        const lineTotal = item.qty * item.unitPrice
        const taxRate = TAX_RATES[item.taxCategory] || TAX_RATES.standard
        subtotal += lineTotal
        totalTax += lineTotal * taxRate
      }
    })

    let markupTotal = 0
    watchedMarkups?.forEach((markup) => {
      if (markup.value) {
        if (markup.type === "percentage") {
          markupTotal += subtotal * (markup.value / 100)
        } else if (markup.type === "amount") {
          markupTotal += Number(markup.value)
        }
      }
    })

    let discountTotal = 0
    watchedDiscounts?.forEach((discount) => {
      if (discount.value) {
        if (discount.type === "percentage") {
          discountTotal += subtotal * (discount.value / 100)
        } else if (discount.type === "amount") {
          discountTotal += Number(discount.value)
        }
      }
    })

    const adjustedSubtotal = subtotal + markupTotal - discountTotal
    const finalTotal = adjustedSubtotal + totalTax

    return {
      subtotal,
      markupTotal,
      discountTotal,
      totalTax,
      finalTotal,
    }
  }

  const totals = calculatePreviewTotals()

  const onSubmit = async (data) => {
    setGenerating(true)
    try {
      const totals = calculatePreviewTotals()

      const invoiceData = {
        ...data,
        total: totals.finalTotal,
        currency: data.currency,
        invoiceNumber: `INV-${Date.now()}`, // unique invoice number
      }

      const response = await functions.createExecution(
        config.functionsId.generateInvoice,
        JSON.stringify(invoiceData)
      )

      const result = response.responseBody ? JSON.parse(response.responseBody) : {}

      console.log("Execution object:", response)
      console.log("Invoice Function Output:", result)

      if (result.success && result.file) {
        setGeneratedInvoice({
          ...result,
          currency: data.currency,
          finalTotal: totals.finalTotal,
        })

        // ✅ Open invoice PDF in a new tab
        const { fileUrl } = result.file
        window.open(fileUrl, "_blank")

        toast.success("Invoice generated and opened in a new tab!")
        reset()
      } else {
        toast.error(result.error || "Failed to generate invoice")
      }
    } catch (error) {
      toast.error("Failed to generate invoice")
      console.error("Invoice generation error:", error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadAgain = () => {
    if (generatedInvoice?.file?.fileUrl) {
      const { fileUrl } = generatedInvoice.file
      window.open(fileUrl, "_blank")
      toast.success("Invoice opened again in a new tab!")
    }
  }



  const loadSampleData = () => {
    reset({
      client: {
        name: "Acme Corporation",
        email: "finance@acme.example",
        address: "123 Business Avenue, Metro Manila, Philippines",
        taxId: "TAX-987654321",
      },
      items: [
        {
          description: "Web Development Services",
          qty: 40,
          unitPrice: 1250.0,
          taxCategory: "standard",
        },
        {
          description: "Monthly Hosting & Maintenance",
          qty: 3,
          unitPrice: 2500.0,
          taxCategory: "reduced",
        },
      ],
      markups: [
        {
          type: "percentage",
          value: 5,
        },
      ],
      discounts: [
        {
          type: "amount",
          value: 2000.0,
        },
      ],
      currency: "PHP",
      dueDate: "2025-10-15",
      notes: "Thank you for choosing our services. Payment terms: Net 30 days.",
      metadata: {
        projectCode: "PROJ-2025-001",
      },
    })
    toast.success("Sample data loaded successfully!")
  }

  // Function to format large numbers with proper abbreviations
  const formatAmount = (amount, currency) => {
    const symbol = getCurrencySymbol(currency)

    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`
    }
    return `${symbol}${amount.toFixed(2)}`
  }

  return (
    <div className={`generate-invoice-container ${isLoaded ? "loaded" : "loading"}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className={`text-center mb-12 header-section ${isLoaded ? "loaded" : "loading"}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <FileCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text-primary mb-2">Invoice Generator</h1>
          <p className="text-xl text-gray-600 mb-6">Create professional invoices in seconds</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={loadSampleData}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg button-hover font-medium"
            >
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
              Try Sample Data
            </button>

            {/* CSV Upload */}
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <button
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 button-hover font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="loading-spinner rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CSV Format Help */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">CSV Format Guide</h4>
                <p className="text-sm text-blue-700 mb-2">Your CSV can include these columns (case-insensitive):</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>
                    <strong>Client:</strong> client_name, email, address, tax_id
                  </p>
                  <p>
                    <strong>Items:</strong> description, qty, unit_price, tax_category
                  </p>
                  <p>
                    <strong>Invoice:</strong> currency, due_date, notes, project_code
                  </p>
                  <p>
                    <strong>Adjustments:</strong> markup, discount (with % symbol for percentages)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {generatedInvoice && (
          <div
            className={`mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm success-banner ${isLoaded ? "loaded" : "loading"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-900 mb-1">Invoice Created Successfully!</h3>
                  <p className="text-green-700">
                    Invoice <span className="font-medium">#{generatedInvoice.invoiceNumber}</span> for{" "}
                    <span className="font-medium">
                      {getCurrencySymbol(generatedInvoice.currency)}
                      {generatedInvoice.finalTotal.toFixed(2)}
                    </span>{" "}
                    has been downloaded.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadAgain}
                className="px-6 py-3 bg-white text-green-700 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md button-hover font-medium"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Download Again
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Form Area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Client Information Card */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden client-card ${isLoaded ? "loaded" : "loading"}`}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Client Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Client Name *
                    </label>
                    <input
                      {...register("client.name", { required: "Client name is required" })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter client or company name"
                    />
                    {errors.client?.name && <p className="text-sm text-red-600 mt-1">{errors.client.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Email Address
                    </label>
                    <input
                      {...register("client.email", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="client@company.com"
                    />
                    {errors.client?.email && <p className="text-sm text-red-600 mt-1">{errors.client.email.message}</p>}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      Address
                    </label>
                    <textarea
                      {...register("client.address")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      placeholder="Complete business address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      Tax ID / Business Registration
                    </label>
                    <input
                      {...register("client.taxId")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Tax identification number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items Card */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-card ${isLoaded ? "loaded" : "loading"}`}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Invoice Items</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendItem({
                        description: "",
                        qty: 1,
                        unitPrice: 0,
                        taxCategory: "standard",
                      })
                    }
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {itemFields.map((field, index) => (
                    <div key={field.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Description *</label>
                          <input
                            {...register(`items.${index}.description`, { required: "Description is required" })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="What are you charging for?"
                          />
                          {errors.items?.[index]?.description && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].description.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity *</label>
                          <input
                            {...register(`items.${index}.qty`, {
                              required: "Quantity is required",
                              min: { value: 0.01, message: "Must be positive" },
                              valueAsNumber: true,
                            })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="1"
                          />
                          {errors.items?.[index]?.qty && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].qty.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Unit Price *</label>
                          <input
                            {...register(`items.${index}.unitPrice`, {
                              required: "Unit price is required",
                              min: { value: 0, message: "Must be positive" },
                              valueAsNumber: true,
                            })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="0.00"
                          />
                          {errors.items?.[index]?.unitPrice && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].unitPrice.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tax Rate</label>
                          <select
                            {...register(`items.${index}.taxCategory`)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="standard">Standard (21%)</option>
                            <option value="reduced">Reduced (9%)</option>
                            <option value="zero">Zero (0%)</option>
                          </select>
                        </div>

                        <div className="md:col-span-1 flex items-end justify-center">
                          {itemFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Remove item"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adjustments Row */}
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 adjustments-section ${isLoaded ? "loaded" : "loading"}`}
            >
              {/* Markups */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Additional Charges</h3>
                    <button
                      type="button"
                      onClick={() => appendMarkup({ type: "percentage", value: 0 })}
                      className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {markupFields.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No additional charges</p>
                    ) : (
                      markupFields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-3">
                          <select
                            {...register(`markups.${index}.type`)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Fixed Amount</option>
                          </select>
                          <input
                            {...register(`markups.${index}.value`, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => removeMarkup(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Discounts */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Discounts</h3>
                    <button
                      type="button"
                      onClick={() => appendDiscount({ type: "percentage", value: 0 })}
                      className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {discountFields.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No discounts applied</p>
                    ) : (
                      discountFields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-3">
                          <select
                            {...register(`discounts.${index}.type`)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="amount">Fixed Amount</option>
                          </select>
                          <input
                            {...register(`discounts.${index}.value`, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => removeDiscount(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden details-card ${isLoaded ? "loaded" : "loading"}`}
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Invoice Details</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      Currency *
                    </label>
                    <select
                      {...register("currency", { required: "Currency is required" })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="USD">🇺🇸 USD - US Dollar</option>
                      <option value="EUR">🇪🇺 EUR - Euro</option>
                      <option value="GBP">🇬🇧 GBP - British Pound</option>
                      <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                      <option value="PHP">🇵🇭 PHP - Philippine Peso</option>
                    </select>
                    {errors.currency && <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      Due Date *
                    </label>
                    <input
                      {...register("dueDate", { required: "Due date is required" })}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Hash className="h-4 w-4 mr-2 text-gray-500" />
                      Project Code
                    </label>
                    <input
                      {...register("metadata.projectCode")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="Optional project reference"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      Notes & Terms
                    </label>
                    <textarea
                      {...register("notes")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={3}
                      placeholder="Payment terms, thank you message, or any additional notes"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Preview Sidebar */}
          <div className="xl:col-span-1">
            <div className={`sticky top-8 preview-sidebar ${isLoaded ? "loaded" : "loading"}`}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 px-6 py-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Invoice Preview</h3>
                  <p className="text-blue-100 text-sm">Live calculation</p>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Subtotal</span>
                      <span className="font-semibold text-gray-900 text-right break-words">
                        {getCurrencySymbol(watchedCurrency)}
                        {totals.subtotal.toFixed(2)}
                      </span>
                    </div>

                    {totals.markupTotal > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Additional Charges</span>
                        <span className="font-semibold text-green-600 text-right break-words">
                          +{getCurrencySymbol(watchedCurrency)}
                          {totals.markupTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {totals.discountTotal > 0 && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Discount</span>
                        <span className="font-semibold text-red-600 text-right break-words">
                          -{getCurrencySymbol(watchedCurrency)}
                          {totals.discountTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Tax</span>
                      <span className="font-semibold text-gray-900 text-right break-words">
                        {getCurrencySymbol(watchedCurrency)}
                        {totals.totalTax.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-4 mt-4">
                      <span className="text-lg font-bold text-gray-900 mb-2">Total Amount</span>
                      <div className="flex items-baseline">
                        <span
                          className={`font-bold gradient-text-total break-all leading-tight ${
                            totals.finalTotal >= 100000
                              ? "amount-text-xl"
                              : totals.finalTotal >= 10000
                                ? "amount-text-2xl"
                                : "amount-text-2xl"
                          }`}
                          title={`${getCurrencySymbol(watchedCurrency)}${totals.finalTotal.toFixed(2)}`}
                        >
                          {totals.finalTotal >= 100000
                            ? formatAmount(totals.finalTotal, watchedCurrency)
                            : `${getCurrencySymbol(watchedCurrency)}${totals.finalTotal.toFixed(2)}`}
                        </span>
                      </div>
                      {totals.finalTotal >= 100000 && (
                        <span className="text-xs text-gray-500 mt-1">
                          Full: {getCurrencySymbol(watchedCurrency)}
                          {totals.finalTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generating}
                    onClick={handleSubmit(onSubmit)}
                    className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed button-hover shadow-lg hover:shadow-xl"
                  >
                    {generating ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        <span>Generating Invoice...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Download className="h-5 w-5 mr-3" />
                        <span>Generate & Download</span>
                      </div>
                    )}
                  </button>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Professional PDF will be generated
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Automatic download starts
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Form resets for next invoice
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div
                className={`mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 tips-section ${isLoaded ? "loaded" : "loading"}`}
              >
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                  Pro Tips
                </h4>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2"></div>
                    Use descriptive item names for clarity
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2"></div>
                    Include payment terms in notes
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2"></div>
                    Set due date 30 days ahead typically
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3 mt-2"></div>
                    CSV upload instantly fills all fields
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateInvoice
