import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';
import { LatLngExpression, LayerOptions } from 'leaflet';


interface HeatmapLayerProps {
  points: Array<[number, number, number?]>; // [lat, lng, intensity?]
  options?: any; // Accept any options for leaflet.heat
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, options }) => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = (window as unknown as { L: { heatLayer: (points: Array<[number, number, number?]>, options?: LayerOptions) => any } }).L.heatLayer(points, options).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
