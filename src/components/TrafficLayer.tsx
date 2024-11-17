import React, { useEffect } from 'react';
import type { Map } from 'mapbox-gl';

interface TrafficLayerProps {
  map: Map;
}

export function TrafficLayer({ map }: TrafficLayerProps) {
  useEffect(() => {
    if (!map.getSource('traffic-data')) {
      // Simulated traffic data
      const trafficLines = Array.from({ length: 20 }, () => ({
        type: 'Feature',
        properties: {
          volume: Math.random(),
          speed: Math.random()
        },
        geometry: {
          type: 'LineString',
          coordinates: Array.from({ length: 5 }, () => [
            -74.0060 + (Math.random() - 0.5) * 0.5,
            40.7128 + (Math.random() - 0.5) * 0.5
          ])
        }
      }));

      map.addSource('traffic-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trafficLines
        }
      });

      map.addLayer({
        id: 'traffic-flow',
        type: 'line',
        source: 'traffic-data',
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'speed'],
            0, '#ff0000',
            0.5, '#ffff00',
            1, '#00ff00'
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'volume'],
            0, 2,
            1, 8
          ],
          'line-opacity': 0.8,
          'line-blur': 1
        }
      });

      // Animated flow effect
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const offset = (Date.now() / 1000) % 1;
        
        if (map.getLayer('traffic-flow')) {
          map.setPaintProperty('traffic-flow', 'line-dasharray', [2, 4, offset]);
        }
      };
      
      animate();

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    return () => {
      if (map.getLayer('traffic-flow')) map.removeLayer('traffic-flow');
      if (map.getSource('traffic-data')) map.removeSource('traffic-data');
    };
  }, [map]);

  return null;
}