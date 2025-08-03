import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';


interface HeatmapLayerProps {
  points: Array<[number, number, number?]>; // [lat, lng, intensity?]
  options?: Record<string, unknown>;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, options }) => {
  const map = useMap();

  useEffect(() => {
    // leaflet.heat is not typed, so we use unknown and cast
    const L_ = (window as unknown as { L: typeof import('leaflet') & { heatLayer: (points: Array<[number, number, number?]>, options?: Record<string, unknown>) => L.Layer } }).L;
    const heatLayer = L_.heatLayer(points, options).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
