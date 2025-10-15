import useAirQuality from "../hooks/useAirQuality";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function chipColor(pm25) {
  if (pm25 == null) return "var(--muted)";
  if (pm25 <= 12) return "var(--green)";
  if (pm25 <= 35) return "var(--orange)";
  return "var(--red)";
}

export default function AirPanel({ city }) {
  const { lat, lon, label } = city || {};
  const { loading, err, latest, series } = useAirQuality({ lat, lon });

  return (
    <div className="panel">
      <div className="section">
        <h4>Air Quality — {label}</h4>
        {loading && <span className="spinner" />}
      </div>

      {err && <div className="note" style={{ borderLeftColor: "var(--red)", marginBottom: 10 }}>{err}</div>}

      <div className="cards" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="cardTitle">PM2.5 (µg/m³)</div>
          <div className="big" style={{ color: chipColor(latest?.pm25) }}>{latest?.pm25?.toFixed?.(1) ?? "—"}</div>
          <div className="sub">Lower is better</div>
        </div>
        <div className="card">
          <div className="cardTitle">PM10 (µg/m³)</div>
          <div className="big">{latest?.pm10?.toFixed?.(1) ?? "—"}</div>
          <div className="sub">Coarse particles</div>
        </div>
        <div className="card">
          <div className="cardTitle">NO₂ (µg/m³)</div>
          <div className="big">{latest?.no2?.toFixed?.(1) ?? "—"}</div>
          <div className="sub">Traffic signature</div>
        </div>
        <div className="card">
          <div className="cardTitle">O₃ (µg/m³)</div>
          <div className="big">{latest?.o3?.toFixed?.(1) ?? "—"}</div>
          <div className="sub">Sunlight + precursors</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 12 }}>
        <div className="section"><h4>Last 24 hours</h4></div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <XAxis dataKey="time" tick={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="var(--c-pm25)" dot={false} />
              <Line type="monotone" dataKey="pm10" name="PM10" stroke="var(--c-pm10)" dot={false} />
              <Line type="monotone" dataKey="no2"  name="NO₂"  stroke="var(--c-no2)"  dot={false} />
              <Line type="monotone" dataKey="o3"   name="O₃"   stroke="var(--c-o3)"   dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
