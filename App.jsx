import { useEffect, useMemo, useState } from "react";
import "./index.css";
import CITIES from "./data/cities";
import SmartSelect from "./components/SmartSelect.jsx";
import AirPanel from "./components/AirPanel.jsx";
import TrafficPanel from "./components/TrafficPanel.jsx";
import MapPanel from "./components/MapPanel.jsx";
import useAirQuality from "./hooks/useAirQuality";
import OverviewPanel from "./components/OverviewPanel.jsx";

function genTrafficSeries(seed = 3) {
  const rand = (i) => (Math.sin(i * 12.9898 + seed) * 43758.5453) % 1;
  const hours = [...Array(24).keys()];
  return hours.map((h) => {
    const base = 30 + 60 * Math.max(
      Math.exp(-Math.pow((h - 9) / 2.2, 2)),
      Math.exp(-Math.pow((h - 18) / 2.5, 2))
    );
    const jitter = 8 * rand(h);
    const index = Math.min(100, Math.max(10, base + jitter));
    const speed = Math.max(8, 60 - index * 0.4) + (rand(h+100) * 4);
    return { h: `${h}:00`, index: Math.round(index), speed: +speed.toFixed(1) };
  });
}

export default function App() {
  const [city, setCity] = useState(CITIES[0]);
  const [tab, setTab] = useState("overview");
  const [seed, setSeed] = useState(3);

  const { latest } = useAirQuality({ lat: city.lat, lon: city.lon });
  const trafficSeries = useMemo(() => genTrafficSeries(seed), [seed]);
  const now = new Date().getHours();
  const trafficNow = trafficSeries[now] || trafficSeries[0];

  useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set("tab", tab);
    u.searchParams.set("city", city.value);
    window.history.replaceState({}, "", u.toString());
  }, [tab, city]);

  return (
    <div className="wrap">
      <div className="panel">
        <div className="section">
          <h4>Smart Traffic & Pollution Dashboard</h4>
          <div className="row">
            <SmartSelect
              options={CITIES.map((c) => ({ value: c.value, label: c.label }))}
              value={city.value}
              onChange={(v) => setCity(CITIES.find((c) => c.value === v))}
              placeholder="Select city…"
              width={220}
            />
            <button className={tab === "overview" ? "btn-accent" : ""} onClick={() => setTab("overview")}>Overview</button>
            <button className={tab === "air" ? "btn-accent" : ""} onClick={() => setTab("air")}>Air</button>
            <button className={tab === "traffic" ? "btn-accent" : ""} onClick={() => setTab("traffic")}>Traffic</button>
            <button className={tab === "map" ? "btn-accent" : ""} onClick={() => setTab("map")}>Map</button>
            <button onClick={() => setSeed((s) => s + 1)}>↻ Refresh</button>
          </div>
        </div>
      </div>

      {tab === "overview" && <OverviewPanel city={city} airLatest={latest} trafficNow={trafficNow} />}
      {tab === "air" && <AirPanel city={city} />}
      {tab === "traffic" && <TrafficPanel city={city} />}
      {tab === "map" && <MapPanel countryCode="IN" />}
    </div>
  );
}
