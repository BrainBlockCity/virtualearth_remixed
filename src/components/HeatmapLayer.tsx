import React, { useEffect } from 'react';
import type { Map } from 'mapbox-gl';

interface HeatmapLayerProps {
  map: Map;
}

export function HeatmapLayer({ map }: HeatmapLayerProps) {
  useEffect(() => {
    if (!map.getSource('heatmap-data')) {
      // Generate random data points for the heatmap
      const points = Array.from({ length: 1000 }, () => ({
        type: 'Feature',
        properties: {
          intensity: Math.random()
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -74.0060 + (Math.random() - 0.5) * 0.5,
            40.7128 + (Math.random() - 0.5) * 0.5
          ]
        }
      }));

      map.addSource('heatmap-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points
        }
      });

      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 0,
            1, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20
          ],
          'heatmap-opacity': 0.8
        }
      });
    }

    return () => {
      if (map.getLayer('heatmap-layer')) map.removeLayer('heatmap-layer');
      if (map.getSource('heatmap-data')) map.removeSource('heatmap-data');
    };
  }, [map]);

  return null;
}