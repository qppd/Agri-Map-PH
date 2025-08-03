import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Location } from '@/types';

// Fix default marker icon issue in Leaflet + React
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface LocationPickerProps {
  value: Location;
  onChange: (loc: Location) => void;
}

function LocationMarker({ value, onChange }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return (
    <Marker
      position={[value.latitude, value.longitude]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onChange({ latitude: pos.lat, longitude: pos.lng });
        },
      }}
    />
  );
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  // Default to Unisan, Quezon if no value
  const [center] = useState<[number, number]>([
    value?.latitude || 13.8317,
    value?.longitude || 121.9622,
  ]);

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
      <div className="text-xs text-gray-500 mt-1 text-center">
        I-drag ang marker o i-tap ang mapa para itama ang iyong lokasyon.
      </div>
    </div>
  );
}
