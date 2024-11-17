import React, { useState } from 'react';
import { Globe2, Layers, Map as MapIcon, Maximize2, Compass, Activity, Sun, Route } from 'lucide-react';
import { CyberButton } from './ui/CyberButton';
import type { Map } from 'mapbox-gl';

interface MapControlsProps {
  map: Map;
  isGlobeView: boolean;
  onToggleGlobe: () => void;
  activeLayers: Record<string, boolean>;
  onToggleLayer: (layerName: string) => void;
}

export function MapControls({ 
  map, 
  isGlobeView, 
  onToggleGlobe,
  activeLayers,
  onToggleLayer 
}: MapControlsProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const handleReset = () => {
    map?.flyTo({
      center: [0, 20],
      zoom: 2,
      bearing: 0,
      pitch: isGlobeView ? 60 : 0,
      duration: 1500
    });
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen not available:', error);
    }
  };

  const layerControls = [
    { id: 'terrain', icon: <Activity className="w-5 h-5" />, label: 'Terrain' },
    { id: 'hexGrid', icon: <Layers className="w-5 h-5" />, label: 'Hex Grid' },
    { id: 'data', icon: <Activity className="w-5 h-5" />, label: 'Data Points' },
    { id: 'heatmap', icon: <Sun className="w-5 h-5" />, label: 'Heatmap' },
    { id: 'traffic', icon: <Activity className="w-5 h-5" />, label: 'Traffic' },
    { id: 'weather', icon: <Sun className="w-5 h-5" />, label: 'Weather' },
    { id: 'route', icon: <Route className="w-5 h-5" />, label: 'Route' }
  ];

  return (
    <>
      {/* Main Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <CyberButton onClick={handleReset} title="Reset view">
          <Compass className="w-6 h-6" />
        </CyberButton>
        
        <CyberButton onClick={onToggleGlobe} title="Toggle globe view">
          <Globe2 className="w-6 h-6" />
        </CyberButton>

        <CyberButton 
          onClick={() => setShowLayerMenu(!showLayerMenu)} 
          title="Toggle layers"
          variant={showLayerMenu ? 'secondary' : 'primary'}
        >
          <Layers className="w-6 h-6" />
        </CyberButton>

        <CyberButton onClick={handleFullscreen} title="Toggle fullscreen">
          <Maximize2 className="w-6 h-6" />
        </CyberButton>
      </div>

      {/* Layer Controls */}
      {showLayerMenu && (
        <div className="absolute top-4 right-20 p-4 bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-lg">
          <h3 className="text-purple-400 font-bold mb-3 text-sm">Map Layers</h3>
          <div className="space-y-2">
            {layerControls.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => onToggleLayer(id)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all
                  ${activeLayers[id] 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'text-purple-400/60 hover:bg-purple-500/10'}
                `}
              >
                {icon}
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}