"use client"

import { ID } from "appwrite";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Building, Palette, CheckCircle } from "lucide-react";
import { databases, config } from "../lib/appwrite"; // ID imported here

const DATABASE_ID = config.databaseId;
const SETTINGS_COLLECTION_ID = config.collectionsId.settings;


const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company_name: "",
      email: "",
      phone: "",
      Website: "",
      Address: "",
      TAX_ID: "",
      default_currency: "USD",
      default_due_date: 30,
      invoice_prefix: "INV",
      standard_rate: 21,
      reduced_rate: 9,
    },
  });

  // Load saved settings on mount
const fetchSettings = async () => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SETTINGS_COLLECTION_ID);
    if (response.documents.length > 0) {
      setValue("company_name", response.documents[0].company_name);
      setValue("phone", response.documents[0].phone);
      setValue("Website", response.documents[0].Website);
      return response.documents[0]; // return the document for later
    } else {
      // No settings document yet, create one
      const newDoc = await databases.createDocument(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        ID.unique(),
        { company_name: "", phone: "", Website: "" }
      );
      return newDoc;
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }
};


const onSubmit = async (formData) => {
  try {
    const data = {
      ...formData,
      default_due_date: String(formData.default_due_date), // <- convert to string
      standard_rate: String(formData.standard_rate),       // optional: if schema is string
      reduced_rate: String(formData.reduced_rate),         // optional: if schema is string
    };

    const docs = await databases.listDocuments(DATABASE_ID, SETTINGS_COLLECTION_ID);
    if (docs.documents.length > 0) {
      await databases.updateDocument(DATABASE_ID, SETTINGS_COLLECTION_ID, docs.documents[0].$id, data);
    } else {
      await databases.createDocument(DATABASE_ID, SETTINGS_COLLECTION_ID, ID.unique(), data);
    }

    console.log("Settings saved successfully!");
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};



  const tabs = [
    {
      id: "company",
      name: "Company",
      icon: Building,
      description: "Business information and contact details",
    },
    {
      id: "invoice",
      name: "Invoice",
      icon: Palette,
      description: "Billing preferences and tax rates",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">System Settings</h1>

        <div className="flex space-x-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-xl border ${
                  isActive ? "bg-indigo-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Settings */}
          {activeTab === "company" && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Company Name *</label>
                  <input
                    {...register("company_name", { required: "Required" })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.company_name && <p className="text-red-600">{errors.company_name.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Email *</label>
                  <input
                    {...register("email", { required: "Required" })}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.email && <p className="text-red-600">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Phone</label>
                  <input {...register("phone")} className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Website</label>
                  <input {...register("Website")} className="w-full px-3 py-2 border rounded" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 font-medium">Address</label>
                  <textarea {...register("Address")} className="w-full px-3 py-2 border rounded" rows={3} />
                </div>

                <div>
                  <label className="block mb-1 font-medium">TAX ID</label>
                  <input {...register("TAX_ID")} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === "invoice" && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Invoice Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Default Currency</label>
                  <select {...register("default_currency")} className="w-full px-3 py-2 border rounded">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Default Due Days</label>
                  <input
                    {...register("default_due_date", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Invoice Prefix</label>
                  <input {...register("invoice_prefix")} className="w-full px-3 py-2 border rounded" />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Standard Rate (%)</label>
                  <input
                    {...register("standard_rate", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Reduced Rate (%)</label>
                  <input
                    {...register("reduced_rate", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            {saveSuccess && (
              <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded">
                <CheckCircle className="h-5 w-5 mr-2" />
                Settings saved successfully!
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
