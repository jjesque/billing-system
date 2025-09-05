"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { databases, config, functions } from "../lib/appwrite"
import { Query } from "appwrite"
import { format } from "date-fns"
import { Eye, Send, Search, Filter, Plus, FileText, Calendar, DollarSign, User, Mail, Clock, CheckCircle, AlertCircle, XCircle, RotateCcw } from "lucide-react"
import toast from "react-hot-toast"

const InvoiceList = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [resendingId, setResendingId] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const itemsPerPage = 20

  // Fade in animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const {
    data: invoicesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["invoices", currentPage, searchTerm, statusFilter],
    queryFn: async () => {
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(itemsPerPage),
        Query.offset((currentPage - 1) * itemsPerPage),
      ]

      if (statusFilter !== "all") {
        queries.push(Query.equal("status", statusFilter))
      }

      if (searchTerm) {
        queries.push(Query.search("clientName", searchTerm))
      }

      const response = await databases.listDocuments(config.databaseId, config.collectionsId.invoices, queries)
      return response
    },
  })

  const handleResendInvoice = async (invoiceId) => {
    setResendingId(invoiceId)
    try {
      const response = await functions.createExecution(config.functionsId.resendInvoice, JSON.stringify({ invoiceId }))

      const result = JSON.parse(response.responseBody)
      if (result.success) {
        toast.success("Invoice resent successfully!")
        refetch()
      } else {
        toast.error(result.error || "Failed to resend invoice")
      }
    } catch (error) {
      toast.error("Failed to resend invoice")
    } finally {
      setResendingId(null)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'overdue':
        return <XCircle className="h-4 w-4" />
      case 'sent':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "C$",
      PHP: "₱"
    }
    return symbols[currency] || "$"
  }

  const totalPages = Math.ceil((invoicesData?.total || 0) / itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-36 animate-pulse"></div>
            </div>
            
            {/* Filters Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex gap-4">
                <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-48 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 transition-all duration-1000 ease-out ${
      isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ease-out delay-200 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Invoice Management
          </h1>
          <p className="text-xl text-gray-600 mb-6">Track and manage all your invoices</p>
          
          <div className="flex justify-center">
            <Link 
              to="/generate" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Invoice
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* Filters Card */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-1000 ease-out delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <Search className="h-6 w-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Search & Filter</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by client name or invoice number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)} 
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="generated">Generated</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice List Card */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-1000 ease-out delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">
                    Invoices {invoicesData?.total ? `(${invoicesData.total})` : ''}
                  </h2>
                </div>
                {invoicesData?.total > 0 && (
                  <div className="text-blue-100 text-sm">
                    Showing {Math.min(itemsPerPage, invoicesData.total)} of {invoicesData.total}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {invoicesData?.documents && invoicesData.documents.length > 0 ? (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Invoice</th>
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Client</th>
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Amount</th>
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Status</th>
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Due Date</th>
                            <th className="text-left py-4 px-2 text-sm font-semibold text-gray-700">Created</th>
                            <th className="text-right py-4 px-2 text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {invoicesData.documents.map((invoice, index) => (
                            <tr 
                              key={invoice.$id} 
                              className={`hover:bg-gray-50 transition-colors duration-200 ${
                                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                              }`}
                              style={{ transitionDelay: `${500 + index * 50}ms` }}
                            >
                              <td className="py-4 px-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {invoice.invoiceNumber || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      #{invoice.$id.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {invoice.clientName || "Unknown Client"}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {invoice.clientEmail || "No email"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {getCurrencySymbol(invoice.currency || "USD")}
                                    {(invoice.finalTotal || invoice.amount || 0).toFixed(2)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status || "pending")}`}>
                                  {getStatusIcon(invoice.status || "pending")}
                                  <span className="capitalize">{invoice.status || "pending"}</span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd, yyyy") : "No due date"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    {format(new Date(invoice.$createdAt), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center justify-end space-x-2">
                                  <Link 
                                    to={`/invoices/${invoice.$id}`} 
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                    title="View Invoice"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleResendInvoice(invoice.$id)}
                                    disabled={resendingId === invoice.$id}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                    title="Resend Invoice"
                                  >
                                    {resendingId === invoice.$id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {invoicesData.documents.map((invoice, index) => (
                      <div 
                        key={invoice.$id} 
                        className={`bg-gray-50 rounded-xl p-4 border border-gray-200 transition-all duration-1000 ease-out ${
                          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: `${500 + index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {invoice.invoiceNumber || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                #{invoice.$id.slice(-8)}
                              </div>
                            </div>
                          </div>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(invoice.status || "pending")}`}>
                            {getStatusIcon(invoice.status || "pending")}
                            <span className="capitalize">{invoice.status || "pending"}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{invoice.clientName || "Unknown Client"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {getCurrencySymbol(invoice.currency || "USD")}
                                {(invoice.finalTotal || invoice.amount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Due: {invoice.dueDate ? format(new Date(invoice.dueDate), "MMM dd") : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {format(new Date(invoice.$createdAt), "MMM dd")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
                          <Link 
                            to={`/invoices/${invoice.$id}`} 
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleResendInvoice(invoice.$id)}
                            disabled={resendingId === invoice.$id}
                            className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 disabled:opacity-50 text-sm font-medium"
                          >
                            {resendingId === invoice.$id ? "Sending..." : "Resend"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 font-medium disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 font-medium disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, invoicesData?.total || 0)}
                            </span>{" "}
                            of <span className="font-medium">{invoicesData?.total || 0}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-l-xl px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                            >
                              Previous
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                              const page = i + 1
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                    currentPage === page
                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600"
                                      : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            })}
                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center rounded-r-xl px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria to find what you're looking for."
                      : "Get started by creating your first professional invoice."}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Link 
                      to="/generate" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Invoice
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          {invoicesData?.documents && invoicesData.documents.length > 0 && (
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-1000 ease-out delay-600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">Total Invoices</p>
                    <p className="text-2xl font-bold text-emerald-900">{invoicesData.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">This Month</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {invoicesData.documents.filter(inv => {
                        const created = new Date(inv.$createdAt)
                        const now = new Date()
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {invoicesData.documents.filter(inv => !inv.status || inv.status === 'generated' || inv.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Paid</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {invoicesData.documents.filter(inv => inv.status === 'paid').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pro Tips Card */}
          <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 transition-all duration-1000 ease-out delay-700 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h4 className="font-semibold text-indigo-900 mb-4 flex items-center">
              <RotateCcw className="h-5 w-5 mr-2 text-indigo-600" />
              Quick Actions & Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-sm text-indigo-800">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                  <div>
                    <p className="font-medium mb-1">Status Updates</p>
                    <p className="text-indigo-700">Click on invoices to update their payment status</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-indigo-800">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                  <div>
                    <p className="font-medium mb-1">Quick Resend</p>
                    <p className="text-indigo-700">Use the send button to resend invoices to clients</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-indigo-800">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                  <div>
                    <p className="font-medium mb-1">Search Tips</p>
                    <p className="text-indigo-700">Search by client name or invoice number for quick access</p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-indigo-800">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 mt-2"></div>
                  <div>
                    <p className="font-medium mb-1">Filter by Status</p>
                    <p className="text-indigo-700">Use status filters to focus on specific invoice types</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceList