import React, { useState, useEffect, useRef } from 'react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import MapCard from './components/MapCard';
import TrafficPredictionChart from './components/TrafficPredictionChart';
import PollutionLevelsChart from './components/PollutionLevelsChart';
import ParkingStatus from './components/ParkingStatus';
import TrafficLightControl from './components/TrafficLightControl';
import ParkingView from './components/ParkingView';
import SatelliteView from './components/SatelliteView';
import AnalyticsView from './components/AnalyticsView';
import WeatherAlert from './components/WeatherAlert';
import TrafficAlert from './components/TrafficAlert';

import {
  CarIcon,
  PollutionIcon,
  ParkingIcon,
  WindIcon,
} from './components/icons';

import type {
  WeatherData,
  KpiCardProps,
  Hotspot,
  TrafficDataPoint,
  PollutionDataPoint,
  ParkingData,
  HistoricalDataPoint,
  GasData,
  TrafficAlertData,
} from './types';

// Data Simulation Helpers
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const generateNearbyParkingData = (center: { lat: number; lng: number }): ParkingData[] => {
    const names = ["Metro Center Garage", "City Square Lot", "Riverfront Parking", "Uptown Parkade", "North Station Lot", "Southside Garage", "West End Plaza", "East Market Park"];
    const data: ParkingData[] = [];
    for (let i = 0; i < 8; i++) {
        const total = Math.floor(randomBetween(80, 400) / 10) * 10;
        data.push({
            id: `np-${i}`,
            name: names[i],
            total: total,
            occupied: Math.floor(randomBetween(20, total)),
            lat: center.lat + randomBetween(-0.02, 0.02),
            lng: center.lng + randomBetween(-0.02, 0.02)
        });
    }
    return data;
};


const App: React.FC = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSimulationPaused, setIsSimulationPaused] = useState(false);
    const simulationIntervalRef = useRef<number | null>(null);

    // --- STATE ---
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData>({ condition: 'Partly Cloudy', temperature: 22, windSpeed: 15 });
    const [parkingData, setParkingData] = useState<ParkingData[]>([]);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
    const [pollutionData, setPollutionData] = useState<PollutionDataPoint[]>([]);
    const [kpiData, setKpiData] = useState<KpiCardProps[]>([]);
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [gasData, setGasData] = useState<GasData[]>([]);
    const [mapFlyTo, setMapFlyTo] = useState<{ lat: number; lng: number } | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState('Click "Generate Insights" to get an AI-powered analysis of the current city data.');
    const [trafficAlert, setTrafficAlert] = useState<TrafficAlertData | null>(null);


    // --- SIMULATION LOGIC ---
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(location);
                setParkingData(generateNearbyParkingData(location));
            },
            () => {
                const fallbackLocation = { lat: 40.7128, lng: -74.0060 };
                setUserLocation(fallbackLocation); // Fallback to NYC
                setParkingData(generateNearbyParkingData(fallbackLocation));
            }
        );

        // Initial data generation
        generateTrafficData();
        generateHistoricalData();
    }, []);

    useEffect(() => {
        if (!isSimulationPaused && parkingData.length > 0) { // Ensure parking data is generated before starting simulation
            simulationIntervalRef.current = window.setInterval(updateSimulation, 2000);
        } else if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }

        return () => {
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
            }
        };
    }, [isSimulationPaused, parkingData, trafficAlert, userLocation]); // Re-run if state changes to have latest state in closure

    const generateTrafficData = (hasLocalIncident: boolean = false) => {
        const data: TrafficDataPoint[] = [];
        const now = new Date();
        for (let i = 12; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 5 * 60000);
            const hour = time.getHours();
            const baseCongestion = (Math.sin((hour - 8) * (Math.PI / 12)) + 1) * 40 + 10; // Peak at 2 PM
            
            let actualCongestion = clamp(baseCongestion + randomBetween(-8, 8), 0, 100);

            // If it's the most recent data point and there's a live local incident, spike the "Actual" congestion
            if (i === 0 && hasLocalIncident) {
                actualCongestion = clamp(actualCongestion + randomBetween(30, 45), 0, 100);
            }

            data.push({
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'Predicted Congestion': clamp(baseCongestion + randomBetween(-5, 5), 0, 100),
                'Actual Congestion': actualCongestion,
            });
        }
        setTrafficData(data);
    };
    
    const generateHistoricalData = () => {
        const data: HistoricalDataPoint[] = [];
        const now = new Date();
        for(let i = 23; i >= 0; i--) {
            const hour = (now.getHours() - i + 24) % 24;
            const traffic = (Math.sin((hour - 8) * (Math.PI / 12)) + 1) * 40 + 10 + randomBetween(-5, 5); // Peak at 2 PM
            const aqi = traffic * 1.5 + randomBetween(-10, 10);
            const parking = 100 - (traffic * 0.8 + randomBetween(-10, 10));
            data.push({
                hour: `${String(hour).padStart(2, '0')}:00`,
                traffic: clamp(traffic, 0, 100),
                aqi: clamp(aqi, 20, 150),
                parking: clamp(parking, 0, 100),
            });
        }
        setHistoricalData(data);
    };

    const updateSimulation = () => {
        // Update parking
        const newParkingData = parkingData.map(lot => {
            const change = Math.random() > 0.5 ? 1 : -1;
            const newOccupied = clamp(lot.occupied + change * Math.floor(randomBetween(0, 3)), 0, lot.total);
            return { ...lot, occupied: newOccupied };
        });
        setParkingData(newParkingData);

        const totalOccupancy = newParkingData.reduce((acc, lot) => acc + lot.occupied / lot.total, 0) / newParkingData.length;
        const avgTraffic = clamp(totalOccupancy * 100, 10, 95);
        const avgPollution = clamp(avgTraffic * 1.2, 20, 180);

        // Update KPIs
        setKpiData([
            { title: 'Traffic Flow', value: `${(100 - avgTraffic).toFixed(0)}%`, icon: <CarIcon className="w-6 h-6 text-white" />, trend: avgTraffic > 60 ? 'down' : 'up' },
            { title: 'Air Quality (AQI)', value: avgPollution.toFixed(0), icon: <PollutionIcon className="w-6 h-6 text-white" />, trend: avgPollution > 100 ? 'down' : 'up' },
            { title: 'Parking Availability', value: `${(100 - totalOccupancy * 100).toFixed(0)}%`, icon: <ParkingIcon className="w-6 h-6 text-white" />, trend: totalOccupancy > 0.8 ? 'down' : 'up' },
            { title: 'Wind Speed', value: `${weatherData.windSpeed} km/h`, icon: <WindIcon className="w-6 h-6 text-white" />, trend: 'up' },
        ]);

        // Update Pollution
        setPollutionData([
            { name: 'PM2.5', value: clamp(avgPollution * 0.6, 10, 100) },
            { name: 'NO₂', value: clamp(avgPollution * 0.3, 5, 50) },
            { name: 'O₃', value: clamp(avgPollution * 0.4, 8, 80) },
            { name: 'CO', value: clamp(avgPollution * 0.1, 2, 20) },
        ]);
        
        // Update Gas Data for Analytics
        setGasData([
            { name: 'Nitrogen Dioxide', value: clamp(avgPollution * 0.3, 5, 50) },
            { name: 'Ozone', value: clamp(avgPollution * 0.4, 8, 80) },
            { name: 'Carbon Monoxide', value: clamp(avgPollution * 0.1, 2, 20) },
            { name: 'Sulfur Dioxide', value: clamp(avgPollution * 0.05, 1, 10) }
        ]);

        // Update hotspots based on new data
        const newHotspots: Hotspot[] = [];
        let hasLocalTrafficIncident = false;

        newParkingData.forEach(lot => {
            const occupancy = lot.occupied / lot.total;
            if (occupancy > 0.95) {
                newHotspots.push({
                    id: `${lot.id}-h`,
                    type: 'parking',
                    level: 'high',
                    position: { lat: lot.lat, lng: lot.lng },
                    details: `Lot: ${lot.name}\nStatus: Almost Full\nOccupancy: ${(occupancy * 100).toFixed(1)}%`
                });
            }
        });
        
        // Add random traffic/pollution hotspots near the user
        if (userLocation) {
            if (Math.random() > 0.3) {
                const level = Math.random() > 0.7 ? 'high' : 'medium';
                if (level === 'high') {
                    hasLocalTrafficIncident = true;
                }
                newHotspots.push({
                    id: `t-${Date.now()}`,
                    type: 'traffic',
                    level: level,
                    position: { lat: userLocation.lat + randomBetween(-0.01, 0.01), lng: userLocation.lng + randomBetween(-0.01, 0.01) },
                    details: `Source: Local Sensor\nSpeed: ${level === 'high' ? '5' : '15'} km/h\nCause: Heavy Congestion`
                });
            }
            if (Math.random() > 0.5) {
                newHotspots.push({
                    id: `p-${Date.now()}`,
                    type: 'pollution',
                    level: 'medium',
                    position: { lat: userLocation.lat + randomBetween(-0.01, 0.01), lng: userLocation.lng + randomBetween(-0.01, 0.01) },
                    details: `Source: Local Sensor\nAQI: 115\nPrimary: PM2.5`
                });
            }
        }
        setHotspots(newHotspots);
        
        // Regenerate traffic forecast data, passing in local incident status
        generateTrafficData(hasLocalTrafficIncident);

        // Simulate traffic incidents
        if (!trafficAlert && Math.random() > 0.98) { // ~2% chance every 2 seconds if no active alert
            const locations = ["I-95 North", "Brooklyn Bridge", "5th Ave & 34th St", "Lincoln Tunnel"];
            const types = ["Accident", "Road Closure", "Heavy Congestion"];
            const detours = ["Use FDR Drive", "Take Williamsburg Bridge", "Use 6th Ave", "Take G. Washington Bridge"];
            const randIndex = Math.floor(Math.random() * locations.length);

            setTrafficAlert({
                id: `alert-${Date.now()}`,
                type: types[Math.floor(Math.random() * types.length)] as TrafficAlertData['type'],
                location: locations[randIndex],
                severity: 'critical',
                detour: `Advised detour: ${detours[randIndex]}. Expect major delays.`
            });
        }
    };

    const handleViewChange = (view: string) => {
        setActiveView(view);
        setMapFlyTo(null); // Reset fly-to when changing views
    };
    
    const handleFlyTo = (coords: { lat: number; lng: number }) => {
        setMapFlyTo(coords);
    };

    const handleDismissTrafficAlert = () => {
        setTrafficAlert(null);
    };

    const getParkingDataWithDistance = () => {
        if (!userLocation || parkingData.length === 0) return parkingData.map(p => ({ ...p, distance: null }));
        return parkingData.map(lot => {
            const R = 6371; // Radius of the Earth in km
            const dLat = (lot.lat - userLocation.lat) * (Math.PI / 180);
            const dLng = (lot.lng - userLocation.lng) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(lot.lat * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km
            return { ...lot, distance };
        }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    };

    const renderView = () => {
        switch (activeView) {
            case 'parking':
                const parkingLotsWithDistance = getParkingDataWithDistance();
                // Create a dedicated set of hotspots for the parking view, showing all lots
                const parkingHotspots: Hotspot[] = parkingLotsWithDistance.map(lot => {
                    const occupancy = lot.occupied / lot.total;
                    let level: 'low' | 'medium' | 'high' = 'low';
                    if (occupancy >= 0.95) level = 'high';
                    else if (occupancy >= 0.75) level = 'medium';
            
                    return {
                        id: `ph-${lot.id}`,
                        type: 'parking',
                        level: level,
                        position: { lat: lot.lat, lng: lot.lng },
                        details: `Lot: ${lot.name}\nStatus: ${level === 'high' ? 'Almost Full' : level === 'medium' ? 'Filling Up' : 'Available'}\nOccupancy: ${(occupancy * 100).toFixed(1)}%`
                    };
                });
                return <ParkingView data={parkingLotsWithDistance} hotspots={parkingHotspots} userLocation={userLocation} mapFlyTo={mapFlyTo} onFlyTo={handleFlyTo} />;
            case 'satellite':
                return <SatelliteView userLocation={userLocation} hotspots={hotspots} />;
            case 'analytics':
                return <AnalyticsView historicalData={historicalData} gasData={gasData} aiAnalysis={aiAnalysis} onAnalysisUpdate={setAiAnalysis} trafficAlert={trafficAlert} />;
            case 'dashboard':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                        {trafficAlert && (
                            <div className="lg:col-span-3">
                                <TrafficAlert alert={trafficAlert} onDismiss={handleDismissTrafficAlert} />
                            </div>
                        )}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {kpiData.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
                            </div>
                            <MapCard hotspots={hotspots} userLocation={userLocation} />
                        </div>
                        <div className="space-y-6">
                            {weatherData.condition === 'Thunderstorm' && <WeatherAlert message="Thunderstorm warning issued for the next 2 hours. Advise caution." severity="danger" />}
                            <ParkingStatus data={parkingData} />
                            <TrafficLightControl />
                        </div>
                        <div className="lg:col-span-2 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
                           <h3 className="text-lg font-semibold text-white mb-4">Traffic Congestion Forecast (Next Hour)</h3>
                           <TrafficPredictionChart data={trafficData} />
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
                           <h3 className="text-lg font-semibold text-white mb-4">Air Pollution Hotspots</h3>
                           <PollutionLevelsChart data={pollutionData} />
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen flex font-sans">
            <Sidebar activeView={activeView} onViewChange={handleViewChange} />
            <main className="flex-1 flex flex-col">
                <Header 
                    isSimulationPaused={isSimulationPaused} 
                    onToggleSimulation={() => setIsSimulationPaused(p => !p)} 
                    weatherData={weatherData} 
                />
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default App;