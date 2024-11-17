import React, { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { validateMapboxToken } from '../utils/mapUtils';
import { cyberpunkMapStyle } from '../styles/mapStyle';
import { MapControls } from './MapControls';
import { InfoPanel } from './InfoPanel';
import { ErrorBoundary } from './ErrorBoundary';
import { HexGrid } from './HexGrid';
import { DataLayer } from './DataLayer';
import { HeatmapLayer } from './HeatmapLayer';
import { TrafficLayer } from './TrafficLayer';
import { WeatherLayer } from './WeatherLayer';
import { RouteLayer } from './RouteLayer';
import { TerrainLayer } from './TerrainLayer';
import { GlobeControls } from './GlobeControls';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapErrors, setMapErrors] = useState<string[]>([]);
  const [isGlobeView, setIsGlobeView] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    terrain: true,
    hexGrid: false,
    data: false,
    heatmap: false,
    traffic: false,
    weather: false,
    route: false
  });
  const [coordinates, setCoordinates] = useState({ lng: -74.5, lat: 40 });
  const [zoom, setZoom] = useState(9);

  const initializeMapbox = useCallback(() => {
    try {
      const token = validateMapboxToken(import.meta.env.VITE_MAPBOX_TOKEN);
      mapboxgl.accessToken = token;
      return true;
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setMapErrors(prev => [...prev, error.message]);
      return false;
    }
  }, []);

  const handleMapError = useCallback((error: any) => {
    const errorMessage = error.error?.message || error.message || 'Unknown map error';
    console.error('Map error:', errorMessage);
    
    // Ignore certain transient errors
    if (
      errorMessage.includes('tiles') || 
      errorMessage.includes('network error') ||
      errorMessage.includes('canceled') ||
      errorMessage.includes('style is not loaded')
    ) {
      return;
    }

    setMapErrors(prev => {
      if (prev.includes(errorMessage)) return prev;
      return [...prev, errorMessage];
    });
    
    setTimeout(() => {
      setMapErrors(prev => prev.filter(e => e !== errorMessage));
    }, 5000);
  }, []);

  const handleToggleGlobe = useCallback(() => {
    if (!map.current) return;

    setIsGlobeView(prev => {
      const newIsGlobeView = !prev;
      map.current?.setProjection(newIsGlobeView ? 'globe' : 'mercator');
      return newIsGlobeView;
    });
  }, []);

  const handleToggleLayer = useCallback((layerId: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      if (!initializeMapbox()) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: cyberpunkMapStyle,
        center: [coordinates.lng, coordinates.lat],
        zoom: zoom,
        pitch: 60,
        bearing: -17.6,
        antialias: true,
        projection: isGlobeView ? 'globe' : 'mercator',
        fog: {
          'range': [0.8, 8],
          'color': '#242B4B',
          'high-color': '#161B33',
          'space-color': '#0B0B15',
          'star-intensity': 0.15
        }
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'top-right'
      );

      // Handle map events
      map.current.on('error', handleMapError);

      map.current.on('style.load', () => {
        if (!map.current) return;

        // Enable terrain if active
        if (activeLayers.terrain) {
          map.current.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });

          map.current.setTerrain({ 
            source: 'mapbox-dem',
            exaggeration: 1.5 
          });
        }

        // Add atmosphere effect for globe view
        if (isGlobeView && !map.current.getLayer('sky')) {
          map.current.addLayer({
            id: 'sky',
            type: 'sky',
            paint: {
              'sky-type': 'atmosphere',
              'sky-atmosphere-sun': [0.0, 90.0],
              'sky-atmosphere-sun-intensity': 15
            }
          });
        }
      });

      map.current.on('move', () => {
        if (!map.current) return;
        const { lng, lat } = map.current.getCenter();
        setCoordinates({ lng, lat });
        setZoom(map.current.getZoom());
      });

      // Clean up on unmount
      return () => {
        map.current?.remove();
        map.current = null;
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      handleMapError(error);
    }
  }, [initializeMapbox, handleMapError, coordinates.lng, coordinates.lat, zoom, isGlobeView]);

  // Handle layer visibility changes
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;

    Object.entries(activeLayers).forEach(([layerId, isActive]) => {
      const layer = map.current?.getLayer(layerId);
      if (layer) {
        map.current?.setLayoutProperty(
          layerId,
          'visibility',
          isActive ? 'visible' : 'none'
        );
      }
    });
  }, [activeLayers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <InfoPanel coordinates={coordinates} zoom={zoom} />
      
      <MapControls
        map={map.current}
        isGlobeView={isGlobeView}
        onToggleGlobe={handleToggleGlobe}
        activeLayers={activeLayers}
        onToggleLayer={handleToggleLayer}
      />

      <GlobeControls map={map.current} isGlobeView={isGlobeView} />

      {activeLayers.terrain && (
        <ErrorBoundary>
          <TerrainLayer map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.hexGrid && (
        <ErrorBoundary>
          <HexGrid map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.data && (
        <ErrorBoundary>
          <DataLayer map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.heatmap && (
        <ErrorBoundary>
          <HeatmapLayer map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.traffic && (
        <ErrorBoundary>
          <TrafficLayer map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.weather && (
        <ErrorBoundary>
          <WeatherLayer map={map.current} />
        </ErrorBoundary>
      )}

      {activeLayers.route && (
        <ErrorBoundary>
          <RouteLayer map={map.current} />
        </ErrorBoundary>
      )}

      {mapErrors.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 space-y-2 z-50">
          {mapErrors.map((error, i) => (
            <div
              key={i}
              className="px-4 py-2 bg-red-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-200 text-sm"
            >
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}