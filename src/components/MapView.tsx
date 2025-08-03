'use client';

import { useEffect, useRef, useState } from 'react';
import { reverseGeocode, classifyLocationsBySupplyDemand } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PriceEntry, Location, UserType, RecommendationPair } from '@/types'; // Changed to type-only import
import { formatCurrency, formatTimestamp } from '@/lib/utils';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


interface MapViewProps {
  priceEntries: PriceEntry[];
  userLocation: Location | null;
  selectedUserType: UserType | null;
  selectedProduct: string | null;
  recommendations?: RecommendationPair[];
  className?: string;
}

// Custom marker icons for different user types
const createCustomIcon = (userType: UserType, isSelected: boolean = false) => {
  const colors = {
    buyer: '#3B82F6', // Blue
    farmer: '#10B981', // Green
    regular: '#8B5CF6', // Purple
  };

  const color = colors[userType];
  const size = isSelected ? 30 : 20;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${size - 10}px;
          height: ${size - 10}px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

export default function MapView({ 
  priceEntries, 
  userLocation, 
  selectedUserType, 
  selectedProduct,
  recommendations = [],
  className = '' 
}: MapViewProps) {


  // Center the map on the user's location or the Philippines
  const mapCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [12.8797, 121.7740];

  // Filter entries by selected product if provided
  const filteredEntries = selectedProduct
    ? priceEntries.filter((e: PriceEntry) => e.product.id === selectedProduct)
    : priceEntries;


  // Define a type for classified location
  interface ClassifiedLocation {
    location: Location;
    demandLevel: string | null;
    supplyLevel?: string | null;
    entries: PriceEntry[];
    farmers: number;
    buyers: number;
  }

  const classifiedLocations: ClassifiedLocation[] = classifyLocationsBySupplyDemand(filteredEntries);

  // Prepare heatmap points: [lat, lng, intensity]
  const heatmapPoints: Array<[number, number, number]> = classifiedLocations.map((loc) => [
    loc.location.latitude,
    loc.location.longitude,
    Math.max(1, loc.entries.length)
  ]);

  const mapRef = useRef<L.Map | null>(null);
  interface PopupInfo {
    lat: number;
    lng: number;
    city: string;
    province: string;
    region: string;
    entries: PriceEntry[];
  }
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  // Placeholder for map click handler (implement as needed)
  const handleMapClick = () => {
    // Implement map click logic if needed
  };

  // Debug: print filtered entries
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Filtered price entries:', filteredEntries);
  }, [filteredEntries]);


  return (
    <div className={`relative ${className}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Map Header */}
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            AgriMap PH - Real-time Price Map
          </h3>
          {/* Legend for supply/demand markers */}
          <div className="flex items-center space-x-4 text-xs mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full border border-white shadow-sm"></div>
              <span>Super High Supply</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-lime-400 rounded-full border border-white shadow-sm"></div>
              <span>Medium High Supply</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></div>
              <span>Super High Demand</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded-full border border-white shadow-sm"></div>
              <span>Medium High Demand</span>
            </div>
          </div>
        </div>
        {/* MapContainer and marker rendering */}
        <MapContainer center={mapCenter} zoom={7} style={{ height: '500px', width: '100%' }} ref={mapRef as any}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />
          {/* Heatmap overlay */}
          <HeatmapLayer points={heatmapPoints} options={{ radius: 25, blur: 15, maxZoom: 12 }} />
          {/* Render supply/demand markers */}
          {classifiedLocations.map((loc, idx: number) => {
            let iconColor = '';
            let label = '';
            if (loc.demandLevel === 'super_high_supply') {
              iconColor = 'green';
              label = 'Super High Supply';
            } else if (loc.demandLevel === 'medium_high_supply') {
              iconColor = 'lime';
              label = 'Medium High Supply';
            } else if (loc.demandLevel === 'super_high_demand') {
              iconColor = 'red';
              label = 'Super High Demand';
            } else if (loc.demandLevel === 'medium_high_demand') {
              iconColor = 'orange';
              label = 'Medium High Demand';
            }
            if (!iconColor) return null;
            const markerIcon = L.divIcon({
              className: 'custom-supply-demand-marker',
              html: `<div style=\"width:24px;height:24px;background:${iconColor};border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);\"></div>`
            });
            return (
              <Marker key={idx} position={[loc.location.latitude, loc.location.longitude]} icon={markerIcon} eventHandlers={{ click: () => setPopupInfo({
                lat: loc.location.latitude,
                lng: loc.location.longitude,
                city: loc.location.municipality || '',
                province: loc.location.province || '',
                region: '',
                entries: loc.entries,
              }) }}>
                <Popup minWidth={300} maxWidth={400}>
                  <div className="p-2">
                    <div className="font-bold text-base mb-1">{loc.location.municipality || 'Unknown City'}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {loc.location.province && `${loc.location.province}`}
                    </div>
                    <div className="mb-2 text-sm font-semibold">{label}</div>
                    <div className="mb-2 text-xs">Farmers: {loc.farmers}, Buyers: {loc.buyers}</div>
                    <div className="mb-2 text-sm font-semibold">Price Entries:</div>
                    {loc.entries.length === 0 ? (
                      <div className="text-xs text-gray-400">No price data for this city.</div>
                    ) : (
                      <ul className="text-xs space-y-1">
                        {loc.entries.map((entry, idx2: number) => (
                          <li key={idx2} className="border-b last:border-b-0 pb-1">
                            <span className="font-medium">{entry.product.name}</span> - {formatCurrency(entry.price)} per {entry.product.unit} <span className="text-gray-500">({entry.userType})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* Popup for city/region info on map click */}
          {popupInfo && (
            <Marker position={[popupInfo.lat, popupInfo.lng]} eventHandlers={{ popupclose: () => setPopupInfo(null) }}>
              <Popup minWidth={300} maxWidth={400}>
                <div className="p-2">
                  <div className="font-bold text-base mb-1">{popupInfo.city || 'Unknown City'}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    {popupInfo.province && `${popupInfo.province}, `}
                    {popupInfo.region && popupInfo.region}
                  </div>
                  <div className="mb-2 text-sm font-semibold">Price Entries:</div>
                  {popupInfo.entries.length === 0 ? (
                    <div className="text-xs text-gray-400">No price data for this city.</div>
                  ) : (
                    <ul className="text-xs space-y-1">
                      {popupInfo.entries.map((entry, idx: number) => (
                        <li key={idx} className="border-b last:border-b-0 pb-1">
                          <span className="font-medium">{entry.product.name}</span> - {formatCurrency(entry.price)} per {entry.product.unit} <span className="text-gray-500">({entry.userType})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        {/* Map Footer */}
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
          Data updates in real-time • Click markers for details • Red marker is your location
        </div>
      </div>
    </div>
  );
}
