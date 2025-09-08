import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import InvoiceList from "./pages/InvoiceList"
import InvoiceViewer from "./pages/InvoiceViewer"
import GenerateInvoice from "./pages/GenerateInvoice"
import LogsViewer from "./pages/LogsViewer"
import Settings from "./pages/Settings"
import Layout from "./components/Layout"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/:id" element={<InvoiceViewer />} />
          <Route path="generate" element={<GenerateInvoice />} />
          
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
