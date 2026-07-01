"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TruckLocation {
  id: string;
  truckNumber: string;
  driverName: string;
  driverPhone: string | null;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  locationUpdatedAt: string | null;
}

interface TrackingMapProps {
  trucks: TruckLocation[];
  selectedTruckId?: string | null;
}

export default function TrackingMap({ trucks, selectedTruckId }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const prevSelectedTruckIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize Leaflet Map centered on Guwahati, Assam
    const map = L.map(mapContainerRef.current).setView([26.1445, 91.7362], 12);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Fix default marker icon issues in Leaflet with Next.js
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;

    // Custom truck icon using secure inline SVG (brand colors)
    const truckIcon = L.divIcon({
      html: `
        <div style="
          background-color: #3D141C;
          border: 2px solid #C89F5F;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.15);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" width="20" height="20">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-5.5h-3V9h3v4z"/>
          </svg>
        </div>
      `,
      className: "custom-truck-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    const activeCoords: L.LatLngExpression[] = [];

    trucks.forEach((truck) => {
      // Check if location is online according to the database
      const isOnline = truck.isOnline;

      if (isOnline) {
        const latLng: L.LatLngExpression = [truck.latitude!, truck.longitude!];
        activeCoords.push(latLng);

        const popupContent = `
          <div style="font-family: sans-serif; padding: 2px;">
            <h4 style="margin: 0 0 4px 0; color: #3A1E14; font-weight: bold;">${truck.truckNumber}</h4>
            <p style="margin: 0 0 2px 0; font-size: 11px; color: #555;"><b>Driver:</b> ${truck.driverName}</p>
            <p style="margin: 0 0 2px 0; font-size: 11px; color: #555;"><b>Speed:</b> ${truck.speed ? `${(truck.speed * 3.6).toFixed(1)} km/h` : "0.0 km/h"}</p>
            <p style="margin: 0; font-size: 9px; color: #888;"><b>Last Seen:</b> ${truck.locationUpdatedAt ? new Date(truck.locationUpdatedAt).toLocaleTimeString() : "N/A"}</p>
          </div>
        `;

        if (currentMarkers[truck.id]) {
          // Update existing marker position
          currentMarkers[truck.id].setLatLng(latLng);
          currentMarkers[truck.id].getPopup()?.setContent(popupContent);
        } else {
          // Create new marker
          const marker = L.marker(latLng, { icon: truckIcon })
            .addTo(map)
            .bindPopup(popupContent);
          currentMarkers[truck.id] = marker;
        }
      } else {
        // If truck went offline or has no location, remove its marker if it exists
        if (currentMarkers[truck.id]) {
          map.removeLayer(currentMarkers[truck.id]);
          delete currentMarkers[truck.id];
        }
      }
    });

    // Clean up markers for trucks that are no longer in the list
    Object.keys(currentMarkers).forEach((id) => {
      const exists = trucks.find((t) => t.id === id);
      if (!exists) {
        map.removeLayer(currentMarkers[id]);
        delete currentMarkers[id];
      }
    });

    // Fit map bounds to show all active trucks if there are any and no truck is selected
    if (activeCoords.length > 0 && !selectedTruckId) {
      const bounds = L.latLngBounds(activeCoords);
      map.fitBounds(bounds, { maxZoom: 15, padding: [50, 50] });
    }
  }, [trucks, selectedTruckId]);

  // Center/Fly-to Selected Truck when selection changes or position updates
  useEffect(() => {
    if (!mapRef.current || !selectedTruckId) return;

    const marker = markersRef.current[selectedTruckId];
    if (marker) {
      const latLng = marker.getLatLng();
      if (prevSelectedTruckIdRef.current !== selectedTruckId) {
        // Initial selection: fly to the truck and zoom in
        mapRef.current.flyTo(latLng, 16, { animate: true });
        marker.openPopup();
        prevSelectedTruckIdRef.current = selectedTruckId;
      } else {
        // Position update while selected: pan smoothly
        mapRef.current.panTo(latLng, { animate: true });
      }
    }
  }, [trucks, selectedTruckId]);

  // Handle clearing selection: fit bounds to all active trucks
  useEffect(() => {
    if (!mapRef.current) return;

    if (!selectedTruckId) {
      prevSelectedTruckIdRef.current = null;
      const activeCoords: L.LatLngExpression[] = [];
      trucks.forEach((truck) => {
        if (truck.isOnline) {
          activeCoords.push([truck.latitude!, truck.longitude!]);
        }
      });
      if (activeCoords.length > 0) {
        const bounds = L.latLngBounds(activeCoords);
        mapRef.current.fitBounds(bounds, { maxZoom: 15, padding: [50, 50] });
      }
    }
  }, [trucks, selectedTruckId]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-2xl border border-gray-200 z-10"
      style={{ minHeight: "500px" }}
    />
  );
}
