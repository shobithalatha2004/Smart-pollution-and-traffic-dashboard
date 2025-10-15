import React, { useState, useEffect, useRef } from 'react';
// FIX: Import RouteData to be used in MapCardProps.
import type { Hotspot, SelectedHotspot, RouteData } from '../types';
import HotspotDetailModal from './HotspotDetailModal';

// Assert global existence for CDN-loaded libraries
declare const L: any;

interface MapCardProps {
  hotspots: Hotspot[];
  userLocation: { lat: number; lng: number } | null;
  mapType?: 'dark' | 'satellite';
  flyTo?: { lat: number; lng: number } | null;
  // FIX: Add optional routeData prop to support displaying routes.
  routeData?: RouteData | null;
}

const getIconHTML = (hotspot: Hotspot): string => {
    const baseClass = 'w-8 h-8 p-1.5 rounded-full shadow-lg flex items-center justify-center';
    let svg = '';
    let bgColor = '';

    switch (hotspot.type) {
        case 'traffic':
            bgColor = hotspot.level === 'high' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black';
            svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5h12.75a1.125 1.125 0 001.125-1.125V11.25a4.5 4.5 0 014.5-4.5h.75c.621 0 1.125.504 1.125 1.125v3.75m-18 0V5.625c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v3.75" /></svg>`;
            break;
        case 'pollution':
            bgColor = 'bg-cyan-400 text-white';
            svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`;
            break;
        case 'parking':
            if (hotspot.level === 'high') {
                bgColor = 'bg-red-500 text-white';
            } else if (hotspot.level === 'medium') {
                bgColor = 'bg-yellow-500 text-black';
            } else {
                bgColor = 'bg-green-500 text-white';
            }
            svg = `<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6" /></svg>`;
            break;
    }
    return `<div class="${baseClass} ${bgColor}">${svg}</div>`;
}

const MapCard: React.FC<MapCardProps> = ({ hotspots, userLocation, mapType = 'dark', flyTo, routeData }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<any>(null);
  const layerControlRef = useRef<any>(null);

  // Refs for layer groups for clustering
  const trafficLayerRef = useRef<any>(null);
  const pollutionLayerRef = useRef<any>(null);
  const parkingLayerRef = useRef<any>(null);

  const [selectedHotspot, setSelectedHotspot] = useState<SelectedHotspot | null>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        const initialView: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [40.7128, -74.0060];
        const map = L.map(mapContainerRef.current).setView(initialView, 13);
        mapRef.current = map;

        const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 20
        });

        if (mapType === 'dark') {
            darkLayer.addTo(map);
        } else {
            satelliteLayer.addTo(map);
        }

        // Initialize marker cluster groups
        trafficLayerRef.current = L.markerClusterGroup().addTo(map);
        pollutionLayerRef.current = L.markerClusterGroup().addTo(map);
        parkingLayerRef.current = L.markerClusterGroup().addTo(map);

        const baseMaps = {
            "Dark": darkLayer,
            "Satellite": satelliteLayer
        };

        const overlayMaps = {
            "Traffic": trafficLayerRef.current,
            "Pollution": pollutionLayerRef.current,
            "Parking": parkingLayerRef.current,
        };

        layerControlRef.current = L.control.layers(baseMaps, overlayMaps).addTo(map);
    }
  }, []); // Runs only once to initialize map

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    
    // Only set view if not being controlled by flyTo
    if (!flyTo) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }

    if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
            html: `<div class="user-location-marker"></div>`,
            className: '',
            iconSize: [20, 20],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation, flyTo]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [flyTo]);

  useEffect(() => {
    const trafficLayer = trafficLayerRef.current;
    const pollutionLayer = pollutionLayerRef.current;
    const parkingLayer = parkingLayerRef.current;

    if (!trafficLayer || !pollutionLayer || !parkingLayer) return;
    
    // Clear old hotspot markers from each layer
    trafficLayer.clearLayers();
    pollutionLayer.clearLayers();
    parkingLayer.clearLayers();

    // Add new hotspot markers to the correct layer
    hotspots.forEach(hotspot => {
        const iconHTML = getIconHTML(hotspot);
        const customIcon = L.divIcon({
            html: iconHTML,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
        
        const marker = L.marker([hotspot.position.lat, hotspot.position.lng], { icon: customIcon });
        marker.on('click', () => {
             setSelectedHotspot({
                type: hotspot.type,
                level: hotspot.level,
                details: hotspot.details,
            });
        });

        switch (hotspot.type) {
            case 'traffic':
                trafficLayer.addLayer(marker);
                break;
            case 'pollution':
                pollutionLayer.addLayer(marker);
                break;
            case 'parking':
                parkingLayer.addLayer(marker);
                break;
        }
    });
  }, [hotspots]);

  const handleCloseModal = () => {
    setSelectedHotspot(null);
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full relative overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Live City Map</h3>
      <div id="map" ref={mapContainerRef} className="flex-grow rounded-lg bg-gray-700 w-full h-full min-h-[400px]">
      </div>
      {selectedHotspot && <HotspotDetailModal hotspot={selectedHotspot} onClose={handleCloseModal} />}
    </div>
  );
};

export default MapCard;
