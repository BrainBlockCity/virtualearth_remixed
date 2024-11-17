import React, { useEffect } from 'react';
import { latLngToCell, cellToBoundary } from 'h3-js';
import type { Map } from 'mapbox-gl';

interface HexGridProps {
  map: Map;
}

export function HexGrid({ map }: HexGridProps) {
  useEffect(() => {
    if (!map.getSource('hexagons')) {
      const bounds = map.getBounds();
      const resolution = 7;
      const hexagons = [];

      for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += 0.1) {
        for (let lng = bounds.getWest(); lng <= bounds.getEast(); lng += 0.1) {
          const hexId = latLngToCell(lat, lng, resolution);
          const boundary = cellToBoundary(hexId);
          
          hexagons.push({
            type: 'Feature',
            properties: { hexId },
            geometry: {
              type: 'Polygon',
              coordinates: [boundary.map(([lat, lng]) => [lng, lat])]
            }
          });
        }
      }

      map.addSource('hexagons', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: hexagons
        }
      });

      map.addLayer({
        id: 'hex-grid',
        type: 'line',
        source: 'hexagons',
        paint: {
          'line-color': '#ff00ff',
          'line-width': 1,
          'line-opacity': 0.3
        }
      });

      map.addLayer({
        id: 'hex-grid-fill',
        type: 'fill',
        source: 'hexagons',
        paint: {
          'fill-color': '#ff00ff',
          'fill-opacity': 0.1
        }
      });
    }

    return () => {
      if (map.getLayer('hex-grid')) map.removeLayer('hex-grid');
      if (map.getLayer('hex-grid-fill')) map.removeLayer('hex-grid-fill');
      if (map.getSource('hexagons')) map.removeSource('hexagons');
    };
  }, [map]);

  return null;
}