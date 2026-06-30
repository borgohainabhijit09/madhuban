"use client";

import React, { useState, useEffect } from 'react';
import { 
  Store, CreditCard, Bell, Shield, MapPin, Save, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'locations' | 'payments' | 'notifications' | 'security'>('store');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Settings Form States
  const [storeDetails, setStoreDetails] = useState({
    name: "Madhuban - Big Bakery",
    email: "support@madhubanbakery.com",
    phone: "+91 98765 43210",
    currency: "INR",
    description: "Premium luxury bakery offering fresh artisanal bread, rich chocolates, and customized cakes.",
    isOnline: true
  });

  const [locations, setLocations] = useState({
    storeLocatorUrl: "https://maps.app.goo.gl/KP4hjGaW6fGaKdXQ9",
    address: "Opposite Madhuban Rest House, Guwahati, Assam 781001"
  });

  const [payments, setPayments] = useState({
    cod: true,
    upi: true,
    cards: false
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    whatsappAlerts: false,
    soundAlerts: true
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'security') {
      if (security.newPassword !== security.confirmPassword) {
        setNotification({ message: "New passwords do not match!", type: "error" });
        return;
      }
      if (!security.currentPassword) {
        setNotification({ message: "Current password is required!", type: "error" });
        return;
      }
    }

    // Simulate saving settings
    setNotification({ message: "Settings saved successfully!", type: "success" });
    
    // Clear security form
    if (activeTab === 'security') {
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <Link href="/admin" className="hover:text-[#C89F5F]">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-[#C89F5F]">Settings</span>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-[#3A1E14] hover:bg-[#2A080C] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            <button 
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-w-fit ${
                activeTab === 'store' 
                  ? 'bg-white text-[#C89F5F] shadow-sm border-gray-100' 
                  : 'text-gray-600 border-transparent hover:bg-white/50'
              }`}
            >
              <Store size={18} /> Store Details
            </button>
            <button 
              onClick={() => setActiveTab('locations')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-w-fit ${
                activeTab === 'locations' 
                  ? 'bg-white text-[#C89F5F] shadow-sm border-gray-100' 
                  : 'text-gray-600 border-transparent hover:bg-white/50'
              }`}
            >
              <MapPin size={18} /> Locations
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-w-fit ${
                activeTab === 'payments' 
                  ? 'bg-white text-[#C89F5F] shadow-sm border-gray-100' 
                  : 'text-gray-600 border-transparent hover:bg-white/50'
              }`}
            >
              <CreditCard size={18} /> Payments
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-w-fit ${
                activeTab === 'notifications' 
                  ? 'bg-white text-[#C89F5F] shadow-sm border-gray-100' 
                  : 'text-gray-600 border-transparent hover:bg-white/50'
              }`}
            >
              <Bell size={18} /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all min-w-fit ${
                activeTab === 'security' 
                  ? 'bg-white text-[#C89F5F] shadow-sm border-gray-100' 
                  : 'text-gray-600 border-transparent hover:bg-white/50'
              }`}
            >
              <Shield size={18} /> Security
            </button>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* TAB 1: STORE DETAILS */}
          {activeTab === 'store' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">General Information</h2>
                  <p className="text-sm text-gray-500">Update your store's basic details and branding.</p>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                      <input 
                        type="text" 
                        value={storeDetails.name} 
                        onChange={(e) => setStoreDetails({...storeDetails, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                      <input 
                        type="email" 
                        value={storeDetails.email} 
                        onChange={(e) => setStoreDetails({...storeDetails, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input 
                        type="text" 
                        value={storeDetails.phone} 
                        onChange={(e) => setStoreDetails({...storeDetails, phone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select 
                        value={storeDetails.currency}
                        onChange={(e) => setStoreDetails({...storeDetails, currency: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                    <textarea 
                      rows={4} 
                      value={storeDetails.description} 
                      onChange={(e) => setStoreDetails({...storeDetails, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Store Status</h2>
                    <p className="text-sm text-gray-500">Control if your store is visible to customers.</p>
                  </div>
                  <div 
                    onClick={() => setStoreDetails({...storeDetails, isOnline: !storeDetails.isOnline})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${storeDetails.isOnline ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${storeDetails.isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <div className="p-6">
                   <p className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-xl p-4">
                     Your store is currently <strong>{storeDetails.isOnline ? 'Online' : 'Offline'}</strong>. Customers can {storeDetails.isOnline ? 'view products and place orders' : 'not access the storefront (a maintenance message will be shown)'}.
                   </p>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Store Locations</h2>
                <p className="text-sm text-gray-500">Configure your bakery outlet locations and Google Maps settings.</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps Store Locator URL</label>
                  <input 
                    type="url" 
                    value={locations.storeLocatorUrl}
                    onChange={(e) => setLocations({...locations, storeLocatorUrl: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Used in the storefront "Store Locator" link.</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Physical Outlet Address</label>
                  <textarea 
                    rows={3}
                    value={locations.address}
                    onChange={(e) => setLocations({...locations, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Payment Methods</h2>
                <p className="text-sm text-gray-500">Enable or disable checkout payment gateways.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Allow customers to pay with cash at the time of delivery.</p>
                  </div>
                  <div 
                    onClick={() => setPayments({...payments, cod: !payments.cod})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${payments.cod ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${payments.cod ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">UPI Payment (QR Code)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Show a UPI QR code or request UPI ID during checkout.</p>
                  </div>
                  <div 
                    onClick={() => setPayments({...payments, upi: !payments.upi})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${payments.upi ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${payments.upi ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl opacity-60">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Online Card Payments (Stripe/Razorpay)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Credit/Debit Cards, Net Banking, and Wallets (Requires API integration).</p>
                  </div>
                  <div 
                    onClick={() => setPayments({...payments, cards: !payments.cards})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${payments.cards ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${payments.cards ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Alerts & Notifications</h2>
                <p className="text-sm text-gray-500">Manage how you and your customers receive updates.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Sound Alerts on New Orders</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Play a pleasant dual-tone chime sound instantly when a customer places an order.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, soundAlerts: !notifications.soundAlerts})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${notifications.soundAlerts ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notifications.soundAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Email Alerts</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Send a confirmation email to the customer and support team.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${notifications.emailAlerts ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notifications.emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">WhatsApp Updates</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Send delivery updates and tracking links directly to customer WhatsApp.</p>
                  </div>
                  <div 
                    onClick={() => setNotifications({...notifications, whatsappAlerts: !notifications.whatsappAlerts})}
                    className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${notifications.whatsappAlerts ? 'bg-[#3A1E14]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${notifications.whatsappAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
                <p className="text-sm text-gray-500">Update your administrator account login credentials.</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" 
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    placeholder="Min 8 characters"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C89F5F]/20 focus:border-[#C89F5F]" 
                  />
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Custom Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-350">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs font-bold border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
