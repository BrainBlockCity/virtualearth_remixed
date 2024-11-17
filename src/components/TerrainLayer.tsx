import React, { useEffect, useRef } from 'react';
import type { Map } from 'mapbox-gl';
import { waitForMapStyle } from '../utils/mapUtils';

interface TerrainLayerProps {
  map: Map | null;
}

export function TerrainLayer({ map }: TerrainLayerProps) {
  const isMounted = useRef(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!map) return;

    const setupTerrain = async () => {
      if (!isMounted.current || hasInitialized.current) return;

      try {
        // Wait for style to load
        await waitForMapStyle(map);

        // Add terrain source if it doesn't exist
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
        }

        // Set terrain properties
        map.setTerrain({ 
          source: 'mapbox-dem',
          exaggeration: 1.5 
        });

        // Add sky layer if it doesn't exist
        if (!map.getLayer('sky')) {
          map.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15
            }
          });
        }

        // Add 3D buildings if they don't exist
        if (!map.getLayer('building-extrusions')) {
          map.addLayer({
            id: 'building-extrusions',
            type: 'fill-extrusion',
            source: 'composite',
            'source-layer': 'building',
            paint: {
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', 'height'],
                0, '#000066',
                50, '#660066',
                100, '#660033',
                200, '#990099'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8,
              'fill-extrusion-vertical-gradient': true
            },
            filter: ['==', 'extrude', 'true']
          });
        }

        hasInitialized.current = true;
      } catch (error) {
        console.error('Error setting up terrain:', error);
      }
    };

    setupTerrain();

    // Cleanup function
    return () => {
      isMounted.current = false;
      
      if (!map || !hasInitialized.current) return;

      try {
        // Only attempt cleanup if the style is still loaded
        if (map.isStyleLoaded()) {
          // Remove layers and sources in reverse order
          const layers = ['building-extrusions', 'sky'];
          layers.forEach(layer => {
            if (map.getLayer(layer)) {
              map.removeLayer(layer);
            }
          });

          // Remove terrain and source
          map.setTerrain(null);
          if (map.getSource('mapbox-dem')) {
            map.removeSource('mapbox-dem');
          }
        }
      } catch (error) {
        console.error('Error cleaning up terrain:', error);
      }

      hasInitialized.current = false;
    };
  }, [map]);

  return null;
}