"use client"

import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { databases, storage, config, functions } from "../lib/appwrite"
import { format } from "date-fns"
import { ArrowLeft, Download, Send, Eye } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

const InvoiceViewer = () => {
  const { id } = useParams()
  const [resending, setResending] = useState(false)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const response = await databases.getDocument(config.databaseId, config.collectionsId.invoices, id)
      return response
    },
  })

  const handleDownloadPDF = async () => {
    try {
      const fileUrl = storage.getFileDownload(config.storageId, invoice.pdfFileId)
      window.open(fileUrl, "_blank")
    } catch (error) {
      toast.error("Failed to download PDF")
    }
  }

  const handleResendInvoice = async () => {
    setResending(true)
    try {
      const response = await functions.createExecution(
        config.functionsId.resendInvoice,
        JSON.stringify({ invoiceId: id }),
      )

      const result = JSON.parse(response.responseBody)
      if (result.success) {
        toast.success("Invoice resent successfully!")
      } else {
        toast.error(result.error || "Failed to resend invoice")
      }
    } catch (error) {
      toast.error("Failed to resend invoice")
    } finally {
      setResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="card">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
        <p className="mt-2 text-gray-600">The invoice you're looking for doesn't exist.</p>
        <Link to="/invoices" className="mt-4 btn btn-primary">
          Back to Invoices
        </Link>
      </div>
    )
  }

  const items = JSON.parse(invoice.items || "[]")
  const emailRecipients = JSON.parse(invoice.emailRecipients || "[]")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/invoices" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600">Invoice Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleDownloadPDF} className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button onClick={handleResendInvoice} disabled={resending} className="btn btn-primary">
            {resending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Resend
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Invoice Number</label>
                <p className="text-sm text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <label className="label">Status</label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "sent"
                        ? "bg-yellow-100 text-yellow-800"
                        : invoice.status === "overdue"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
              <div>
                <label className="label">Created Date</label>
                <p className="text-sm text-gray-900">{format(new Date(invoice.$createdAt), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <label className="label">Due Date</label>
                <p className="text-sm text-gray-900">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</p>
              </div>
              <div>
                <label className="label">Currency</label>
                <p className="text-sm text-gray-900">{invoice.currency}</p>
              </div>
              <div>
                <label className="label">Total Amount</label>
                <p className="text-lg font-semibold text-gray-900">
                  {invoice.currency} {invoice.finalTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Client Name</label>
                <p className="text-sm text-gray-900">{invoice.clientName}</p>
              </div>
              <div>
                <label className="label">Email</label>
                <p className="text-sm text-gray-900">{invoice.clientEmail}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <p className="text-sm text-gray-900">{invoice.clientAddress || "N/A"}</p>
              </div>
              {invoice.clientTaxId && (
                <div>
                  <label className="label">Tax ID</label>
                  <p className="text-sm text-gray-900">{invoice.clientTaxId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.qty}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {invoice.currency} {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{(item.taxRate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-4 text-sm text-gray-900 text-right">
                        {invoice.currency} {item.lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {invoice.currency} {invoice.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {invoice.markupTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Markup:</span>
                      <span>
                        {invoice.currency} {invoice.markupTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>
                        -{invoice.currency} {invoice.discountTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>
                      {invoice.currency} {invoice.totalTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {invoice.currency} {invoice.finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PDF Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Preview</h3>
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">PDF preview not available</p>
                <button onClick={handleDownloadPDF} className="mt-2 text-primary-600 hover:text-primary-700 text-sm">
                  Download to view
                </button>
              </div>
            </div>
          </div>

          {/* Email Recipients */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Recipients</h3>
            <div className="space-y-2">
              {emailRecipients.map((email, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source System */}
          {invoice.sourceSystem && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="label">Source System</label>
                  <p className="text-sm text-gray-900">{invoice.sourceSystem}</p>
                </div>
                {invoice.sourceId && (
                  <div>
                    <label className="label">Source ID</label>
                    <p className="text-sm text-gray-900">{invoice.sourceId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceViewer
