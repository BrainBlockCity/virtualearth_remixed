import React, { useEffect, useRef, useState } from 'react';
import type { Map, Marker } from 'mapbox-gl';
import * as turf from '@turf/turf';

interface RouteLayerProps {
  map: Map;
}

export function RouteLayer({ map }: RouteLayerProps) {
  const [marker, setMarker] = useState<Marker | null>(null);
  const animationFrame = useRef<number>();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!map.getSource('route')) {
      // Cyberpunk-themed route
      const route = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-74.0060, 40.7128], // Start
            [-74.0090, 40.7148],
            [-74.0120, 40.7138],
            [-74.0150, 40.7158],
            [-74.0180, 40.7168], // End
          ]
        }
      };

      // Add the route
      map.addSource('route', {
        type: 'geojson',
        data: route
      });

      // Neon route line
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#ff00ff',
          'line-width': 12,
          'line-opacity': 0.4,
          'line-blur': 8
        }
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#ff00ff',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      // Add marker
      const newMarker = new mapboxgl.Marker({
        color: '#ff00ff'
      })
        .setLngLat([-74.0060, 40.7128])
        .addTo(map);

      setMarker(newMarker);

      // Animate marker
      const animate = () => {
        const duration = 10000; // 10 seconds
        const elapsed = (Date.now() - startTime.current) % duration;
        const progress = elapsed / duration;

        const route = map.getSource('route')._data;
        const path = turf.lineString(route.geometry.coordinates);
        const length = turf.length(path);
        const along = turf.along(path, length * progress);

        if (marker) {
          marker.setLngLat(along.geometry.coordinates);
        }

        animationFrame.current = requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (marker) {
        marker.remove();
      }
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route')) map.removeSource('route');
    };
  }, [map, marker]);

  return null;
}