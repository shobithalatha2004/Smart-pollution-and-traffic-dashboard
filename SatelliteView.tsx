
import React from 'react';
import MapCard from './MapCard';
import type { Hotspot } from '../types';

interface SatelliteViewProps {
  userLocation: { lat: number; lng: number } | null;
  hotspots: Hotspot[];
}

const SatelliteView: React.FC<SatelliteViewProps> = ({ userLocation, hotspots }) => {
  return (
    <div className="h-full w-full animate-fade-in">
      <MapCard userLocation={userLocation} hotspots={hotspots} mapType="satellite" />
    </div>
  );
};

export default SatelliteView;
