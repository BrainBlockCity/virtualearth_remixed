import React, { useEffect } from 'react';
import type { Map } from 'mapbox-gl';
import { flyToLocation } from '../utils/mapUtils';

interface DataLayerProps {
  map: Map;
}

export function DataLayer({ map }: DataLayerProps) {
  useEffect(() => {
    if (!map.getSource('data-points')) {
      // Simulated cyberpunk-themed data points with more detailed properties
      const points = Array.from({ length: 50 }, (_, i) => ({
        type: 'Feature',
        properties: {
          id: `point-${i}`,
          intensity: Math.random(),
          category: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
          pulse: Math.random() > 0.5,
          name: `Node ${i + 1}`,
          description: `Cyberpunk data node with activity level ${(Math.random() * 100).toFixed(1)}%`,
          securityLevel: Math.floor(Math.random() * 5) + 1
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -74.0060 + (Math.random() - 0.5) * 0.5,
            40.7128 + (Math.random() - 0.5) * 0.5
          ]
        }
      }));

      map.addSource('data-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points
        }
      });

      // Glowing circle layer
      map.addLayer({
        id: 'data-points-glow',
        type: 'circle',
        source: 'data-points',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'intensity'],
            0, 10,
            1, 25
          ],
          'circle-color': [
            'match',
            ['get', 'category'],
            'info', '#00ffff',
            'warning', '#ffff00',
            'error', '#ff0066',
            '#ff00ff'
          ],
          'circle-opacity': 0.1,
          'circle-blur': 1
        }
      });

      // Core point layer
      map.addLayer({
        id: 'data-points-core',
        type: 'circle',
        source: 'data-points',
        paint: {
          'circle-radius': 4,
          'circle-color': [
            'match',
            ['get', 'category'],
            'info', '#00ffff',
            'warning', '#ffff00',
            'error', '#ff0066',
            '#ff00ff'
          ],
          'circle-opacity': 0.8
        }
      });

      // Add click interaction
      map.on('click', 'data-points-core', (e) => {
        if (!e.features?.length) return;

        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice() as [number, number];
        const { name, description, category, securityLevel } = feature.properties;

        // Create popup content with cyberpunk styling
        const popupContent = `
          <div class="bg-black/90 p-4 rounded-lg border border-${category === 'info' ? 'cyan' : category === 'warning' ? 'yellow' : 'red'}-500/50">
            <h3 class="text-${category === 'info' ? 'cyan' : category === 'warning' ? 'yellow' : 'red'}-400 font-bold mb-2">${name}</h3>
            <p class="text-gray-300 text-sm mb-2">${description}</p>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-gray-400">Security Level:</span>
              <div class="flex gap-1">
                ${Array(5).fill(0).map((_, i) => `
                  <div class="w-2 h-2 rounded-full ${i < securityLevel ? 'bg-purple-500' : 'bg-gray-700'}"></div>
                `).join('')}
              </div>
            </div>
          </div>
        `;

        new mapboxgl.Popup({
          closeButton: false,
          className: 'cyberpunk-popup',
          maxWidth: '300px'
        })
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map);

        // Trigger fly animation
        flyToLocation(map, coordinates, {
          zoom: map.getZoom() + 2,
          pitch: 60,
          bearing: Math.random() * 360,
          duration: 2000
        });
      });

      // Change cursor on hover
      map.on('mouseenter', 'data-points-core', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'data-points-core', () => {
        map.getCanvas().style.cursor = '';
      });

      // Animate pulses
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const opacity = Math.abs(Math.sin(Date.now() / 1000));
        
        if (map.getLayer('data-points-glow')) {
          map.setPaintProperty('data-points-glow', 'circle-opacity', opacity * 0.2);
        }
      };
      
      animate();

      return () => {
        cancelAnimationFrame(frame);
        map.off('click', 'data-points-core');
        map.off('mouseenter', 'data-points-core');
        map.off('mouseleave', 'data-points-core');
      };
    }

    return () => {
      if (map.getLayer('data-points-core')) map.removeLayer('data-points-core');
      if (map.getLayer('data-points-glow')) map.removeLayer('data-points-glow');
      if (map.getSource('data-points')) map.removeSource('data-points');
    };
  }, [map]);

  return null;
}