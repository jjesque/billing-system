import { useQuery } from "@tanstack/react-query"
import { databases, config } from "../lib/appwrite"
import { useNavigate } from 'react-router-dom';
import { Query } from "appwrite"
import { FileText, DollarSign, Clock, CheckCircle, TrendingUp, AlertCircle, BarChart3, PieChart, Activity, Calendar } from "lucide-react"
import { format } from "date-fns"
import "../style/Dashboard.css"

const Dashboard = () => {

  const navigate = useNavigate();
  const {
    data: invoices,
    isLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const response = await databases.listDocuments(config.databaseId, config.collectionsId.invoices, [
          Query.orderDesc("$createdAt"),
          Query.limit(10),
        ])
        return response.documents
      } catch (error) {
        console.log("[v0] Database query error:", error)
        throw error
      }
    },
    retry: false, // Don't retry on 404 errors
  })

  const { data: stats, error: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        const [allInvoices, paidInvoices, pendingInvoices] = await Promise.all([
          databases.listDocuments(config.databaseId, config.collectionsId.invoices),
          databases.listDocuments(config.databaseId, config.collectionsId.invoices, [Query.equal("status", "paid")]),
          databases.listDocuments(config.databaseId, config.collectionsId.invoices, [Query.equal("status", "sent")]),
        ])

        const totalRevenue = allInvoices.documents.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
        const pendingAmount = pendingInvoices.documents.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

        return {
          totalInvoices: allInvoices.total,
          totalRevenue,
          pendingInvoices: pendingInvoices.total,
          pendingAmount,
          paidInvoices: paidInvoices.total,
        }
      } catch (error) {
        console.log("[v0] Stats query error:", error)
        throw error
      }
    },
    retry: false, // Don't retry on 404 errors
  })

  const hasSetupError = invoicesError || statsError
  const isNotFoundError =
    hasSetupError &&
    (invoicesError?.code === 404 ||
      statsError?.code === 404 ||
      invoicesError?.message?.includes("404") ||
      statsError?.message?.includes("404"))

  const statCards = [
    {
      title: "Total Invoices",
      value: stats?.totalInvoices || 0,
      icon: FileText,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
    {
      title: "Pending Invoices",
      value: stats?.pendingInvoices || 0,
      icon: Clock,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
    },
    {
      title: "Paid Invoices",
      value: stats?.paidInvoices || 0,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
    },
  ]

  // Function to format amounts for display
  const formatAmount = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  if (isNotFoundError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl mb-4 shadow-lg animate-bounce">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-900 to-pink-900 bg-clip-text text-transparent mb-2 animate-slide-in">
              Database Setup Required
            </h1>
            <p className="text-xl text-gray-600 mb-6 animate-slide-in">Your billing system needs to be configured</p>
          </div>

          {/* Setup Error Card */}
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="h-8 w-8 text-white animate-pulse" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Database Setup Required</h2>
                    <p className="text-red-100">
                      Your Appwrite database and collections haven't been created yet.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-red-600" />
                    Quick Setup Steps
                  </h3>
                  <div className="grid gap-4">
                    {[
                      { step: 1, title: "Create Database", desc: "Go to Appwrite Console → Databases", code: "billing-db" },
                      { step: 2, title: "Create Collections", desc: "Add required collections", codes: ["invoices", "clients", "logs"] },
                      { step: 3, title: "Run Setup Script", desc: "", code: "node scripts/setup-collections.js" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-red-200 hover:border-red-300 hover:shadow-md transition-all duration-300 animate-slide-in">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform duration-300">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          {item.desc && <p className="text-gray-700 text-sm mb-2">{item.desc}</p>}
                          {item.code && <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono hover:bg-red-200 transition-colors cursor-pointer">{item.code}</code>}
                          {item.codes && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.codes.map((code, i) => (
                                <code key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono hover:bg-red-200 transition-colors cursor-pointer">{code}</code>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-xl mx-auto mb-2 max-w-md animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg mx-auto max-w-sm animate-pulse"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-16 bg-gray-200 animate-pulse"></div>
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg animate-float hover:shadow-2xl hover:scale-110 transition-all duration-500">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 animate-slide-in">
            Business Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6 animate-slide-in">Overview of your billing performance and recent activity</p>
          
          {/* Quick Stats Summary */}
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-4 shadow-sm border border-gray-100 animate-fade-in hover:shadow-lg hover:scale-105 transition-all duration-500">
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stats?.totalInvoices || 0}</div>
              <div className="text-sm text-gray-500">Total Invoices</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                {stats?.totalRevenue ? formatAmount(stats.totalRevenue) : '$0'}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-yellow-600 group-hover:text-orange-600 transition-colors duration-300">{stats?.pendingInvoices || 0}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-sm border ${stat.borderColor} overflow-hidden hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer animate-slide-up group`}>
                <div className="p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-3 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${stat.textColor} mb-1`}>{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
                  </div>
                  
                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Invoices Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in hover:shadow-2xl transition-shadow duration-500">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Recent Invoices</h2>
                  <p className="text-indigo-100">Latest billing activity and status updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {invoices && invoices.length > 0 ? (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Invoice", "Client", "Amount", "Status", "Date"].map((header, index) => (
                          <th key={header} className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 transition-colors duration-300 ${index === 0 ? 'rounded-tl-xl' : index === 4 ? 'rounded-tr-xl' : ''}`}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map((invoice, index) => (
                        <tr key={invoice.$id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group cursor-pointer animate-slide-in">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                {invoice.invoiceNumber || `INV-${index + 1}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-gray-900 font-medium group-hover:text-indigo-600 transition-colors duration-300">{invoice.clientName || "Unknown Client"}</div>
                            <div className="text-sm text-gray-500">Client</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900 group-hover:text-green-600 group-hover:scale-105 transition-all duration-300">
                              {invoice.currency || "USD"} {(invoice.finalTotal || 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">Total amount</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full hover:scale-105 transition-transform duration-300 ${
                                invoice.status === "paid"
                                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 hover:from-green-200 hover:to-emerald-200"
                                  : invoice.status === "sent"
                                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200 hover:from-yellow-200 hover:to-orange-200"
                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200 hover:from-gray-200 hover:to-slate-200"
                              }`}
                            >
                              {invoice.status === "paid" && <CheckCircle className="h-4 w-4 mr-1" />}
                              {invoice.status === "sent" && <Clock className="h-4 w-4 mr-1" />}
                              {invoice.status === "draft" && <FileText className="h-4 w-4 mr-1" />}
                              {invoice.status || "draft"}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center text-gray-900 font-medium">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                              {format(new Date(invoice.$createdAt), "MMM dd, yyyy")}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(invoice.$createdAt), "h:mm a")}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-500">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Get started by creating your first invoice and tracking your business performance.
                </p>
                <button
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 hover:scale-105 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => navigate("/generate")}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Create Your First Invoice
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Insights */}
        {stats && (stats.totalRevenue > 0 || stats.pendingAmount > 0) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Insights */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 animate-slide-in hover:shadow-xl hover:scale-105 transition-all duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900">Revenue Insights</h3>
                  <p className="text-green-700">Your billing performance</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-green-200 hover:border-green-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                  <span className="font-medium text-gray-700">Total Earned</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(stats.totalRevenue || 0).toLocaleString()}
                  </span>
                </div>
                
                {stats.pendingAmount > 0 && (
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-yellow-200 hover:border-yellow-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                    <span className="font-medium text-gray-700">Pending Payment</span>
                    <span className="text-xl font-bold text-yellow-600">
                      ${(stats.pendingAmount || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 animate-slide-in hover:shadow-xl hover:scale-105 transition-all duration-500">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center hover:shadow-lg hover:scale-110 transition-all duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Activity Summary</h3>
                  <p className="text-blue-700">Invoice status overview</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">{stats.paidInvoices || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-700">Awaiting Payment</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">{stats.pendingInvoices || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard