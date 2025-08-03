import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet.heat';
import { LatLngExpression, LayerOptions } from 'leaflet';


interface HeatmapLayerProps {
  points: Array<[number, number, number?]>; // [lat, lng, intensity?]
  options?: LayerOptions;
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points, options }) => {
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const heatLayer = (window as any).L.heatLayer(points, options).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;
