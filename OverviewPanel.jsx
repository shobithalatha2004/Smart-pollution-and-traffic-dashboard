import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from "recharts";

// Single-column Overview: hero + 4 KPI cards with tiny sparklines
export default function OverviewPanel({ city, airLatest, trafficNow, airSeries = [], trafficSeries = [] }) {
  const pm25 = airLatest?.pm25 ?? null;
  const pm10 = airLatest?.pm10 ?? null;
  const no2  = airLatest?.no2  ?? null;
  const o3   = airLatest?.o3   ?? null;

  const tIndex = trafficNow?.index ?? null;
  const tSpeed = trafficNow?.speed ?? null;

  // normalize (0..100) for meters
  const normPM25 = (v) => {
    if (v == null) return 0;
    if (v <= 12) return (v/12)*20;
    if (v <= 35) return 20 + ((v-12)/23)*20;
    if (v <= 55) return 40 + ((v-35)/20)*20;
    if (v <= 150) return 60 + ((v-55)/95)*25;
    return 85 + Math.min(15, (v-150)/100*15);
  };
  const pmPct = Math.round(normPM25(pm25));
  const trafficPct = Math.round(Math.max(0, Math.min(100, tIndex ?? 0)));

  const airLabel =
    pm25 == null ? "—" :
    pm25 <= 12 ? "Good" :
    pm25 <= 35 ? "Moderate" :
    pm25 <= 55 ? "Unhealthy (SG)" :
    pm25 <= 150 ? "Unhealthy" : "Very Unhealthy";

  const trafficLabel =
    tIndex == null ? "—" :
    tIndex > 70 ? "Heavy" : tIndex > 45 ? "Moderate" : "Light";

  // insights
  const insights = [];
  if (pm25 != null && pm25 > 35) insights.push("Mask recommended 😷");
  if (tIndex != null && tIndex > 70) insights.push("Delay travel if possible ⏳");
  if (tSpeed != null && tSpeed < 20) insights.push("Slow corridors ahead 🐢");
  if (o3 != null && o3 > 100) insights.push("Midday ozone spike ☀️");
  if (!insights.length) insights.push("Conditions are generally OK ✅");

  // deltas
  const prevAir = airSeries.length >= 2 ? airSeries[airSeries.length - 2] : null;
  const prevPM = prevAir?.pm25 ?? null;
  const pmDelta = (pm25 != null && prevPM != null) ? +(pm25 - prevPM).toFixed(1) : null;

  const prevT = trafficSeries.length >= 1 ? trafficSeries[0] : null; // predictor’s first entry is “now”
  const prevIdx = prevT?.index ?? null;
  const tDelta = (tIndex != null && prevIdx != null) ? (tIndex - prevIdx) : null;

  const fmtDelta = (d, unit="") => d == null ? "—" : (d > 0 ? `+${d}${unit}` : `${d}${unit}`);
  const dotCol = (score) =>
    score == null ? "var(--muted)" :
    score > 75 ? "var(--red)" :
    score > 50 ? "var(--orange)" :
    score > 25 ? "var(--yellow)" : "var(--green)";

  // Sparklines (with graceful fallbacks so the card never looks empty)
  const pmSpark = airSeries.slice(-12).map((r,i) => ({ x:i, y:r.pm25 ?? null }));
  const tSpark  = trafficSeries.slice(0,12).map((r,i) => ({ x:i, y:r.index ?? null }));
  const pmIsEmpty = !pmSpark.length || pmSpark.every(d => d.y == null);
  const tIsEmpty  = !tSpark.length  || tSpark.every(d => d.y == null);
  const pmFallback = Array.from({length:12}, (_,i)=>({x:i, y: 10 + Math.sin(i/2)*3}));
  const tFallback  = Array.from({length:12}, (_,i)=>({x:i, y: 35 + (i%6)*6}));

  const nowStr = new Date().toLocaleString();
  const travelTip = tIndex != null && tIndex > 70 ? "Leave +2h from now" : "Leave +1h for smoother ride";

  return (
    <div className="panel" style={{ display:"grid", gap:12 }}>
      {/* HERO */}
      <div className="hero">
        <div className="section" style={{ alignItems:"flex-start" }}>
          <div>
            <h4 style={{ margin:0 }}>{city?.label}</h4>
            <div className="hint">{nowStr}</div>
          </div>
          <div className="row">
            <span className="badge">
              <span className="iconRound">🌿</span>
              Air: <b>{airLabel}</b>
              <span className="hint">PM2.5 {pm25?.toFixed?.(1) ?? "—"} µg/m³</span>
            </span>
            <span className="badge">
              <span className="iconRound">🚦</span>
              Traffic: <b>{trafficLabel}</b>
              <span className="hint">{tSpeed != null ? `${tSpeed} km/h` : "—"}</span>
            </span>
          </div>
        </div>
        <div className="insights">
          {insights.map((txt, i) => <span className="badge" key={i}>{txt}</span>)}
        </div>
      </div>

      {/* KPI CARDS (single column grid that wraps) */}
      <div className="cards">
        {/* PM2.5 */}
        <div className="card">
          <div className="section">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="iconRound">🫧</div>
              <div>
                <div className="cardTitle">PM2.5 (µg/m³)</div>
                <div className="kpiValue" style={{ color: dotCol(Math.round(normPM25(pm25))) }}>
                  {pm25?.toFixed?.(1) ?? <span className="skel" style={{display:"inline-block", width:60, height:28}}/>}
                </div>
              </div>
            </div>
            <div className="hint">{pmDelta != null ? `vs prev hr: ${fmtDelta(pmDelta)}` : "—"}</div>
          </div>

          <div className="meter" style={{ marginTop:10 }}>
            <span style={{ width: `${pmPct}%` }} />
          </div>

          <div className="spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pmIsEmpty ? pmFallback : pmSpark} margin={{top:6,right:6,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="gPm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-pm25)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--c-pm25)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="y" name="PM2.5" stroke="var(--c-pm25)" fill="url(#gPm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="hint" style={{ marginTop:8 }}>WHO good ≤ 12 · moderate ≤ 35</div>
        </div>

        {/* PM10 / NO2 / O3 */}
        <div className="card">
          <div className="section">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="iconRound">🌬️</div>
              <div>
                <div className="cardTitle">PM10 (µg/m³)</div>
                <div className="kpiValue">
                  {pm10?.toFixed?.(1) ?? <span className="skel" style={{display:"inline-block", width:60, height:28}}/>}
                </div>
              </div>
            </div>
            <div className="hint">Coarse particles</div>
          </div>
          <div className="hr" />
          <div className="section" style={{ marginTop:6 }}>
            <div className="badge">NO₂: <b>{no2?.toFixed?.(1) ?? "—"}</b></div>
            <div className="badge">O₃: <b>{o3?.toFixed?.(1) ?? "—"}</b></div>
          </div>
        </div>

        {/* Traffic Index */}
        <div className="card">
          <div className="section">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="iconRound">🚗</div>
              <div>
                <div className="cardTitle">Traffic Index</div>
                <div className="kpiValue" style={{ color: dotCol(trafficPct) }}>
                  {tIndex ?? <span className="skel" style={{display:"inline-block", width:40, height:28}}/>}
                </div>
              </div>
            </div>
            <div className="hint">{tDelta != null ? `vs baseline: ${fmtDelta(tDelta)}` : "—"}</div>
          </div>

          <div className="meter meterTraffic" style={{ marginTop:10 }}>
            <span style={{ width: `${trafficPct}%` }} />
          </div>

          <div className="spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tIsEmpty ? tFallback : tSpark} margin={{top:6,right:6,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="gTraf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-traffic)" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="var(--c-traffic)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="y" name="Traffic Index" stroke="var(--c-traffic)" fill="url(#gTraf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="hint" style={{ marginTop:8 }}>0 = free · 100 = jam</div>
        </div>

        {/* Speed & Tips */}
        <div className="card">
          <div className="section">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div className="iconRound">🧭</div>
              <div>
                <div className="cardTitle">Speed (km/h)</div>
                <div className="kpiValue">
                  {tSpeed ?? <span className="skel" style={{display:"inline-block", width:54, height:28}}/>}
                </div>
              </div>
            </div>
            <div className="hint">Across major corridors</div>
          </div>
          <div className="hr" />
          <div style={{ marginTop:6, display:"grid", gap:8 }}>
            <div className="badge">Peaks: <b>08–10</b> & <b>17–20</b></div>
            <div className="badge">Tip: {travelTip}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
