"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { functions, config } from "../lib/appwrite"
import { format } from "date-fns"
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

const LogsViewer = () => {
  const [filters, setFilters] = useState({
    operation: "all",
    status: "all",
    invoiceId: "",
    startDate: "",
    endDate: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const {
    data: logsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logs", currentPage, filters],
    queryFn: async () => {
      // Map operation to action as per backend
      const actionMap = {
        invoice_generated: "created",
        email_sent: "sent",
        invoice_resent: "resent",
        invoice_paid: "paid",
        failed: "failed",
      };

      const payload = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.operation !== "all" && { action: actionMap[filters.operation] }),
        ...(filters.invoiceId && { invoiceId: filters.invoiceId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };




      const response = await functions.createExecution(config.functionsId.getLogs, JSON.stringify(payload))
      const result = JSON.parse(response.responseBody)

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch logs")
      }

      return result
    },
  })

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getOperationColor = (operation) => {
    switch (operation) {
      case "invoice_generated":
        return "bg-blue-100 text-blue-800"
      case "email_sent":
        return "bg-green-100 text-green-800"
      case "invoice_resent":
        return "bg-yellow-100 text-yellow-800"
      case "invoice_viewed":
        return "bg-purple-100 text-purple-800"
      case "invoice_paid":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalPages = Math.ceil((logsData?.total || 0) / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Logs</h1>
          <p className="text-gray-600">Track all invoice operations and activities</p>
        </div>
        <button onClick={() => refetch()} className="btn btn-secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="label">Operation</label>
            <select
              value={filters.operation}
              onChange={(e) => handleFilterChange("operation", e.target.value)}
              className="input"
            >
              <option value="all">All Operations</option>
              <option value="invoice_generated">Invoice Generated</option>
              <option value="email_sent">Email Sent</option>
              <option value="invoice_resent">Invoice Resent</option>
              <option value="invoice_viewed">Invoice Viewed</option>
              <option value="invoice_paid">Invoice Paid</option>
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="label">Invoice ID</label>
            <input
              type="text"
              value={filters.invoiceId}
              onChange={(e) => handleFilterChange("invoiceId", e.target.value)}
              className="input"
              placeholder="Filter by invoice ID"
            />
          </div>

          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : logsData?.logs && logsData.logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsData.logs.map((log) => (
                    <tr key={log.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOperationColor(
                            log.operation,
                          )}`}
                        >
                          {log.operation.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{log.invoiceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="max-w-xs">
                            {log.details.error && (
                              <div className="text-red-600 font-medium">Error: {log.details.error}</div>
                            )}
                            {log.details.recipients && <div>Recipients: {log.details.recipients.join(", ")}</div>}
                            {log.details.invoiceNumber && <div>Invoice: {log.details.invoiceNumber}</div>}
                            {log.details.finalTotal && log.details.currency && (
                              <div>
                                Amount: {log.details.currency} {log.details.finalTotal.toFixed(2)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(currentPage * itemsPerPage, logsData?.total || 0)}</span>{" "}
                      of <span className="font-medium">{logsData?.total || 0}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === page
                                ? "bg-primary-600 text-white"
                                : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
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
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {Object.values(filters).some((f) => f && f !== "all")
                ? "Try adjusting your filter criteria."
                : "Invoice operations will appear here once you start generating invoices."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogsViewer
