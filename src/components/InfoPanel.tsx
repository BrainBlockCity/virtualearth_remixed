import React from 'react';
import { Activity } from 'lucide-react';

interface InfoPanelProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export function InfoPanel({ coordinates, zoom }: InfoPanelProps) {
  return (
    <div className="absolute left-4 top-4 p-6 bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Blockcities Virtual Earth
        </h2>
      </div>
      <div className="space-y-2">
        <p className="text-sm opacity-80">Explore the digital frontier</p>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30">
            LAT: {coordinates.lat.toFixed(4)}°N
          </span>
          <span className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30">
            LNG: {coordinates.lng.toFixed(4)}°W
          </span>
        </div>
        <div className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-xs">
          ZOOM: {zoom}
        </div>
      </div>
    </div>
  );
}