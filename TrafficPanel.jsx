import useTrafficPredictor from "../hooks/useTrafficPredictor";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function TrafficPanel({ city }) {
  const { lat, lon, label } = city || {};
  const { loading, err, now, series, forecast } = useTrafficPredictor({ lat, lon });

  const colorByIndex = (n) => n > 70 ? "var(--red)" : n > 45 ? "var(--orange)" : "var(--green)";

  return (
    <div className="panel">
      <div className="section">
        <h4>Traffic (Predicted) — {label}</h4>
        {loading && <span className="spinner" />}
      </div>

      {err && <div className="note" style={{ borderLeftColor: "var(--red)", marginBottom: 10 }}>{err}</div>}

      <div className="cards" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="cardTitle">Traffic Index (now)</div>
          <div className="big" style={{ color: colorByIndex(now?.index ?? 0) }}>{now?.index ?? "—"}</div>
          <div className="sub">{now ? (now.index > 70 ? "Heavy" : now.index > 45 ? "Moderate" : "Light") : "—"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Avg Speed (now)</div>
          <div className="big">{now?.speed ?? "—"} km/h</div>
          <div className="sub">Derived from index</div>
        </div>
        <div className="card">
          <div className="cardTitle">Weather impact</div>
          <div className="big" style={{ fontSize: 16 }}>
            {now?.explain?.length ? now.explain.join(" · ") : "minimal"}
          </div>
          <div className="sub">How weather is affecting traffic</div>
        </div>
        <div className="card">
          <div className="cardTitle">Next 6h (Index)</div>
          <div className="big">
            {forecast?.length ? forecast.map(f => f.index).join(" → ") : "—"}
          </div>
          <div className="sub">Predicted trend</div>
        </div>
      </div>

      <div className="panel" style={{ padding: 12 }}>
        <div className="section"><h4>24h Prediction — Index vs Speed (weather-adjusted)</h4></div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gIndex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-traffic)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--c-traffic)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-speed)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--c-speed)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="index" name="Traffic Index" stroke="var(--c-traffic)" fill="url(#gIndex)" />
              <Area type="monotone" dataKey="speed" name="Avg Speed (km/h)" stroke="var(--c-speed)" fill="url(#gSpeed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="note" style={{ marginTop: 10 }}>
        <b>How this works:</b> A realistic commute pattern (morning/evening peaks) is adjusted using live weather:
        rain, wind, and heat increase congestion. All computed in the browser — no keys, no backend.
      </div>
    </div>
  );
}
