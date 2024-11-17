import React, { useEffect } from 'react';
import type { Map } from 'mapbox-gl';

interface WeatherLayerProps {
  map: Map;
}

export function WeatherLayer({ map }: WeatherLayerProps) {
  useEffect(() => {
    if (!map.getSource('weather-data')) {
      // Simulated weather data
      const weatherPoints = Array.from({ length: 30 }, () => ({
        type: 'Feature',
        properties: {
          temperature: Math.random() * 30,
          precipitation: Math.random(),
          type: ['rain', 'snow', 'clear', 'cloudy'][Math.floor(Math.random() * 4)]
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -74.0060 + (Math.random() - 0.5) * 0.5,
            40.7128 + (Math.random() - 0.5) * 0.5
          ]
        }
      }));

      map.addSource('weather-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: weatherPoints
        }
      });

      // Weather symbols
      map.addLayer({
        id: 'weather-symbols',
        type: 'symbol',
        source: 'weather-data',
        layout: {
          'text-field': [
            'match',
            ['get', 'type'],
            'rain', '🌧',
            'snow', '❄️',
            'clear', '☀️',
            'cloudy', '☁️',
            '❓'
          ],
          'text-size': 20,
          'text-allow-overlap': true
        }
      });

      // Temperature circles
      map.addLayer({
        id: 'weather-temp',
        type: 'circle',
        source: 'weather-data',
        paint: {
          'circle-radius': 20,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'temperature'],
            0, '#0000ff',
            15, '#00ff00',
            30, '#ff0000'
          ],
          'circle-opacity': 0.3,
          'circle-blur': 1
        }
      });

      // Animate weather effects
      let frame = 0;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        const opacity = Math.abs(Math.sin(Date.now() / 1000));
        
        if (map.getLayer('weather-temp')) {
          map.setPaintProperty('weather-temp', 'circle-opacity', opacity * 0.3);
        }
      };
      
      animate();

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    return () => {
      if (map.getLayer('weather-symbols')) map.removeLayer('weather-symbols');
      if (map.getLayer('weather-temp')) map.removeLayer('weather-temp');
      if (map.getSource('weather-data')) map.removeSource('weather-data');
    };
  }, [map]);

  return null;
}