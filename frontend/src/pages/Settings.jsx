"use client"

import { ID } from "appwrite";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Building, Palette, CheckCircle, Settings as SettingsIcon, Globe, CreditCard } from "lucide-react";
import { databases, config } from "../lib/appwrite";
import "../style/Settings.css";

const DATABASE_ID = config.databaseId;
const SETTINGS_COLLECTION_ID = config.collectionsId.settings;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await databases.listDocuments(DATABASE_ID, SETTINGS_COLLECTION_ID);
        if (response.documents.length > 0) {
          const settings = response.documents[0];
          Object.keys(settings).forEach(key => {
            if (key !== '$id' && key !== '$createdAt' && key !== '$updatedAt' && key !== '$permissions' && key !== '$collectionId' && key !== '$databaseId') {
              setValue(key, settings[key]);
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [setValue]);

  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const data = {
        ...formData,
        default_due_date: String(formData.default_due_date),
        standard_rate: parseInt(formData.standard_rate) || 0,
        reduced_rate: parseInt(formData.reduced_rate) || 0,
      };

      const docs = await databases.listDocuments(DATABASE_ID, SETTINGS_COLLECTION_ID);
      if (docs.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, SETTINGS_COLLECTION_ID, docs.documents[0].$id, data);
      } else {
        await databases.createDocument(DATABASE_ID, SETTINGS_COLLECTION_ID, ID.unique(), data);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
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
      icon: CreditCard,
      description: "Billing preferences and tax rates",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        {/* Modern Header */}
        <div className="settings-header">
          <div className="settings-icon">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="settings-title">System Settings</h1>
          <p className="settings-subtitle">Configure your business information and billing preferences</p>
          
          {/* Quick Settings Summary */}
          <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-4 shadow-sm border border-gray-100">
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                <Building className="h-6 w-6 mx-auto mb-1" />
              </div>
              <div className="text-sm text-gray-500">Company</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-6 w-6 mx-auto mb-1" />
              </div>
              <div className="text-sm text-gray-500">Billing</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center group cursor-pointer">
              <div className="text-2xl font-bold text-purple-600 group-hover:text-indigo-600 transition-colors duration-300">
                <Globe className="h-6 w-6 mx-auto mb-1" />
              </div>
              <div className="text-sm text-gray-500">Global</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${isActive ? 'active' : ''}`}
              >
                <Icon className="tab-icon" />
                <div className="text-left">
                  <div className="font-semibold">{tab.name}</div>
                  <div className="text-sm opacity-75">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="settings-form">
          {/* Company Settings */}
          {activeTab === "company" && (
            <div className="settings-section">
              <h2 className="section-title">
                <Building className="section-icon" />
                Company Information
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    {...register("company_name", { required: "Company name is required" })}
                    className={`form-input ${errors.company_name ? 'error' : ''}`}
                    placeholder="Enter your company name"
                  />
                  {errors.company_name && (
                    <div className="form-error">{errors.company_name.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="contact@yourcompany.com"
                  />
                  {errors.email && (
                    <div className="form-error">{errors.email.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    {...register("phone")} 
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input 
                    {...register("Website")} 
                    className="form-input"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div className="form-group form-grid-full">
                  <label className="form-label">Business Address</label>
                  <textarea 
                    {...register("Address")} 
                    className="form-textarea"
                    placeholder="123 Business Street, City, State, ZIP Code"
                    rows={3} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax ID / VAT Number</label>
                  <input 
                    {...register("TAX_ID")} 
                    className="form-input"
                    placeholder="Enter your tax identification number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === "invoice" && (
            <div className="settings-section">
              <h2 className="section-title">
                <CreditCard className="section-icon" />
                Invoice Configuration
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Default Currency</label>
                  <select {...register("default_currency")} className="form-select">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="PHP">PHP - Philippine Peso</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Payment Terms (Days)</label>
                  <input
                    {...register("default_due_date", { 
                      valueAsNumber: true,
                      min: { value: 1, message: "Must be at least 1 day" },
                      max: { value: 365, message: "Must be less than 365 days" }
                    })}
                    type="number"
                    className={`form-input ${errors.default_due_date ? 'error' : ''}`}
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                  {errors.default_due_date && (
                    <div className="form-error">{errors.default_due_date.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice Number Prefix</label>
                  <input 
                    {...register("invoice_prefix")} 
                    className="form-input"
                    placeholder="INV"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Standard Tax Rate (%)</label>
                  <input
                    {...register("standard_rate", { 
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      max: { value: 100, message: "Must be 100 or less" }
                    })}
                    type="number"
                    className={`form-input ${errors.standard_rate ? 'error' : ''}`}
                    placeholder="21"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  {errors.standard_rate && (
                    <div className="form-error">{errors.standard_rate.message}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Reduced Tax Rate (%)</label>
                  <input
                    {...register("reduced_rate", { 
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be 0 or greater" },
                      max: { value: 100, message: "Must be 100 or less" }
                    })}
                    type="number"
                    className={`form-input ${errors.reduced_rate ? 'error' : ''}`}
                    placeholder="9"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  {errors.reduced_rate && (
                    <div className="form-error">{errors.reduced_rate.message}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Section */}
          <div className="save-section">
            {saveSuccess && (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                Settings saved successfully!
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="save-button"
            >
              <Save className="save-icon" />
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;