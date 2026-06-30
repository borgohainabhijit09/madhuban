"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Truck, Plus, Phone, AlertCircle, Loader2, Navigation, CheckCircle2 } from "lucide-react";

// Dynamically import the Leaflet map component with SSR disabled
const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex flex-col items-center justify-center border border-gray-200">
      <Loader2 className="animate-spin text-[#C89F5F] w-8 h-8 mb-2" />
      <span className="text-gray-500 text-sm font-medium">Loading interactive map...</span>
    </div>
  ),
});

export default function TrackingPage() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    truckNumber: "",
    driverName: "",
    driverPhone: "",
  });
  const [formSaving, setFormSaving] = useState<boolean>(false);

  const fetchTrucks = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/trucks`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTrucks(data);
      }
    } catch (err) {
      console.error("Failed to fetch trucks:", err);
      setError("Failed to connect to the tracking server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();

    // Poll for live location updates every 10 seconds
    const interval = setInterval(fetchTrucks, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/trucks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ truckNumber: "", driverName: "", driverPhone: "" });
        fetchTrucks();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to add truck.");
      }
    } catch (err) {
      console.error("Error adding truck:", err);
      setError("Network error adding truck.");
    } finally {
      setFormSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="animate-spin text-[#C89F5F] w-10 h-10 mb-4" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Navigation className="text-[#C89F5F] rotate-45" size={24} />
            Live Delivery Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1">Track the live locations of your delivery trucks on the map (updates every 10s)</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#3D141C] hover:bg-[#2A0A10] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} /> Add Delivery Truck
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start text-red-700 text-sm">
          <AlertCircle className="shrink-0 w-5 h-5 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar: Truck List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">
              Truck Fleet ({trucks.length})
            </h3>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {trucks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No trucks registered. Add a truck to start tracking.
                </div>
              ) : (
                trucks.map((truck) => {
                  const isOnline = truck.latitude !== null && truck.longitude !== null;
                  return (
                    <div
                      key={truck.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isOnline
                          ? "border-green-100 bg-green-50/10"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Truck size={16} className="text-gray-500" />
                            {truck.truckNumber}
                          </span>
                          <span className="text-xs text-gray-500 block mt-1">
                            Driver: <b>{truck.driverName}</b>
                          </span>
                          {truck.driverPhone && (
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Phone size={12} /> {truck.driverPhone}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isOnline
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>

                      {isOnline && (
                        <div className="mt-3 pt-3 border-t border-dashed border-green-100 flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            Speed: <b>{truck.speed ? `${(truck.speed * 3.6).toFixed(1)} km/h` : "0 km/h"}</b>
                          </span>
                          <span className="text-gray-400">
                            Updated {new Date(truck.locationUpdatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Map */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col justify-between">
            <TrackingMap trucks={trucks} />
          </div>
        </div>

      </div>

      {/* Add Truck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-[#FAF8F5]">
              <h3 className="text-lg font-bold text-gray-900">Add New Truck</h3>
              <p className="text-xs text-gray-500 mt-1">Register a truck to enable GPS tracking for its driver</p>
            </div>
            
            <form onSubmit={handleAddTruck} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Truck Number *</label>
                <input
                  type="text"
                  required
                  placeholder="AS 01 EX 1234"
                  value={formData.truckNumber}
                  onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C89F5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Driver Full Name"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C89F5F]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Driver Phone Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C89F5F]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="bg-[#3D141C] hover:bg-[#2A0A10] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
                >
                  {formSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Truck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
