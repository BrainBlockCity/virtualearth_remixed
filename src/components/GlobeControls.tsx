import React from 'react';
import { Globe2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { CyberButton } from './ui/CyberButton';
import type { Map } from 'mapbox-gl';

interface GlobeControlsProps {
  map: Map;
  isGlobeView: boolean;
}

export function GlobeControls({ map, isGlobeView }: GlobeControlsProps) {
  const handleRotate = () => {
    if (!map) return;
    
    const currentBearing = map.getBearing();
    map.easeTo({
      bearing: currentBearing + 90,
      duration: 2000,
      easing: (t) => t
    });
  };

  const handleZoomToWorld = () => {
    if (!map) return;

    map.flyTo({
      center: [0, 20],
      zoom: 2,
      duration: 2000
    });
  };

  const handleZoomIn = () => {
    map?.zoomIn();
  };

  const handleZoomOut = () => {
    map?.zoomOut();
  };

  if (!isGlobeView) return null;

  return (
    <div className="absolute bottom-20 right-4 flex flex-col gap-2">
      <CyberButton 
        onClick={handleZoomToWorld} 
        title="View entire globe"
        variant="secondary"
      >
        <Globe2 className="w-6 h-6" />
      </CyberButton>
      
      <CyberButton 
        onClick={handleRotate} 
        title="Rotate globe"
        variant="secondary"
      >
        <RotateCcw className="w-6 h-6" />
      </CyberButton>

      <CyberButton 
        onClick={handleZoomIn}
        title="Zoom in"
        variant="secondary"
      >
        <ZoomIn className="w-6 h-6" />
      </CyberButton>

      <CyberButton 
        onClick={handleZoomOut}
        title="Zoom out"
        variant="secondary"
      >
        <ZoomOut className="w-6 h-6" />
      </CyberButton>
    </div>
  );
}