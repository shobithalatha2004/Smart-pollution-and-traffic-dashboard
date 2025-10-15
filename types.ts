export interface WeatherData {
  condition: 'Clear Sky' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Thunderstorm';
  temperature: number;
  windSpeed: number;
}

export interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

export interface Hotspot {
  id: string;
  type: 'traffic' | 'pollution' | 'parking';
  level: 'high' | 'medium' | 'low';
  position: { lat: number; lng: number };
  details: string;
}

export interface SelectedHotspot {
    type: 'traffic' | 'pollution' | 'parking';
    level: 'high' | 'medium' | 'low';
    details: string;
}

export interface TrafficDataPoint {
  time: string;
  'Predicted Congestion': number;
  'Actual Congestion': number;
}

export interface PollutionDataPoint {
  name: string;
  value: number;
}

export interface ParkingData {
  id: string;
  name: string;
  occupied: number;
  total: number;
  lat: number;
  lng: number;
}

export interface HistoricalDataPoint {
  hour: string;
  traffic: number; // 0-100
  aqi: number; // 0-500
  parking: number; // 0-100
}

export interface GasData {
    name: string;
    value: number;
}

export interface TrafficAlertData {
  id: string;
  type: 'Accident' | 'Road Closure' | 'Heavy Congestion';
  location: string;
  severity: 'critical' | 'major' | 'minor';
  detour: string;
}
// FIX: Add Route and RouteData types for the NavigationView.
export interface Route {
  name: string;
  distanceKm: number;
  timeMin: number;
  color: string;
}

export type RouteData = Route[];
