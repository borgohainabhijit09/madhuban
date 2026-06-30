"use client";

import { useState, useEffect, useRef } from "react";
import { Truck, Navigation, Play, Square, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function DriverPage() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; speed: number | null } | null>(null);
  const [status, setStatus] = useState<string>("Ready to start");
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/trucks`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Filter only active trucks
          setTrucks(data.filter((t: any) => t.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch trucks:", err);
        setError("Could not load trucks. Please check your network.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, []);

  const sendLocationToAPI = async (lat: number, lng: number, speed: number | null) => {
    if (!selectedTruckId) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/trucks/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          truckId: selectedTruckId,
          latitude: lat,
          longitude: lng,
          speed: speed,
        }),
      });

      if (res.ok) {
        setStatus(`Location updated at ${new Date().toLocaleTimeString()}`);
      } else {
        console.error("Failed to send location to server");
      }
    } catch (err) {
      console.error("Error sending location:", err);
    }
  };

  const startTracking = () => {
    if (!selectedTruckId) {
      alert("Please select a truck first.");
      return;
    }

    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsTracking(true);
    setStatus("Acquiring GPS signal...");
    setError(null);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude, speed });

        // Throttle updates: send at most once every 15 seconds
        const now = Date.now();
        if (now - lastSentTimeRef.current >= 15000) {
          sendLocationToAPI(latitude, longitude, speed);
          lastSentTimeRef.current = now;
        }
      },
      (err) => {
        console.error("GPS Error:", err);
        let msg = "Error getting GPS location.";
        if (err.code === 1) msg = "GPS Permission denied. Please enable location access.";
        else if (err.code === 2) msg = "GPS Position unavailable.";
        else if (err.code === 3) msg = "GPS Timeout.";
        setError(msg);
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentCoords(null);
    setStatus("Tracking stopped");
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="animate-spin text-[#C89F5F] w-10 h-10 mb-4" />
        <p className="text-gray-600 font-medium">Loading driver dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-[80vh] bg-[#FAF8F5] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F0EBE1] shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Navigation className="text-[#3A1E14] w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#3A1E14]">Driver GPS Portal</h1>
          <p className="text-gray-500 text-xs mt-1">Start tracking to share your live location with the admin</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex gap-3 items-start text-red-700 text-xs">
            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Truck Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#3A1E14] uppercase tracking-wider">Select Your Truck</label>
            <div className="relative">
              <select
                disabled={isTracking}
                value={selectedTruckId}
                onChange={(e) => setSelectedTruckId(e.target.value)}
                className="w-full border border-[#EBE3D5] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C89F5F] bg-[#FAF8F5] disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
              >
                <option value="">Select a Truck...</option>
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.truckNumber} — {t.driverName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <Truck size={16} />
              </div>
            </div>
          </div>

          {/* Status Monitor */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EBE3D5] space-y-3.5">
            <div className="flex justify-between items-center text-xs border-b border-[#F0EBE1] pb-2.5">
              <span className="font-bold text-gray-500">GPS STATUS</span>
              <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-ping' : 'bg-gray-400'}`}></span>
                {isTracking ? 'Active' : 'Offline'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Latitude</span>
                <span className="font-bold text-[#3A1E14]">
                  {currentCoords ? currentCoords.lat.toFixed(6) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Longitude</span>
                <span className="font-bold text-[#3A1E14]">
                  {currentCoords ? currentCoords.lng.toFixed(6) : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Current Speed</span>
                <span className="font-bold text-[#3A1E14]">
                  {currentCoords?.speed ? `${(currentCoords.speed * 3.6).toFixed(1)} km/h` : "0.0 km/h"}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-center text-gray-500 pt-1.5 border-t border-[#F0EBE1] italic">
              {status}
            </div>
          </div>

          {/* Controls */}
          {!isTracking ? (
            <button
              onClick={startTracking}
              disabled={!selectedTruckId}
              className="w-full bg-[#4A171E] hover:bg-[#330F13] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Play size={16} /> Start Duty & Track Location
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Square size={16} /> Stop Duty & Stop Tracking
            </button>
          )}

        </div>
      </div>
    </main>
  );
}
