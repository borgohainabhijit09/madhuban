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
}

export default function TrackingMap({ trucks }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

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

    // Custom truck icon
    const truckIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1048/1048314.png", // Delivery truck icon
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });

    const activeCoords: L.LatLngExpression[] = [];

    trucks.forEach((truck) => {
      if (truck.latitude !== null && truck.longitude !== null) {
        const latLng: L.LatLngExpression = [truck.latitude, truck.longitude];
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
      if (!trucks.find((t) => t.id === id)) {
        map.removeLayer(currentMarkers[id]);
        delete currentMarkers[id];
      }
    });

    // Fit map bounds to show all active trucks if there are any
    if (activeCoords.length > 0) {
      const bounds = L.latLngBounds(activeCoords);
      map.fitBounds(bounds, { maxZoom: 15, padding: [50, 50] });
    }
  }, [trucks]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-2xl border border-gray-200 z-10"
      style={{ minHeight: "500px" }}
    />
  );
}
