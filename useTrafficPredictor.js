import { useEffect, useMemo, useState } from "react";

/**
 * Frontend-only traffic predictor (no API keys)
 * - Uses live weather from Open-Meteo and a realistic base commute pattern
 * - Adjusts traffic index by rain, wind, temp, weekday/weekend
 * - Returns current "now", a 24h series, and 6h forecast
 *
 * Index: 0 (free) → 100 (jam). Speed derived from index.
 */

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

// Realistic daily base curve (morning + evening peaks)
function basePattern(hour, isWeekend) {
  const commute = (h, p, w) => Math.exp(-Math.pow((h - p) / w, 2));
  const morning = commute(hour, 9, 2.3);
  const evening = commute(hour, 18, 2.6);
  // weekends softer peaks
  const weight = isWeekend ? 0.55 : 1.0;
  const base = 28 + 60 * weight * Math.max(morning, evening); // 28–88 range typical
  return clamp(Math.round(base), 10, 95);
}

// Convert index to average speed (km/h), simple inverse mapping
function speedFromIndex(index) {
  // 60 km/h when index=0, ~8 km/h when index=100
  return +(Math.max(8, 60 - index * 0.46)).toFixed(1);
}

// Weather → traffic modifiers (explainable)
function weatherImpact({ precipProb = 0, precipMm = 0, windKmh = 0, tempC = 25 }) {
  // Rain makes the biggest difference
  const rainBump =
    (precipProb / 100) * (precipMm >= 5 ? 0.22 : precipMm >= 1 ? 0.14 : 0.06); // up to +22%

  // Strong winds can slow traffic with debris/visibility (modest)
  const windBump = windKmh >= 40 ? 0.06 : windKmh >= 25 ? 0.03 : 0;

  // Extreme heat can reduce speeds due to A/C load & driver fatigue (small)
  const heatBump = tempC >= 38 ? 0.03 : tempC >= 32 ? 0.015 : 0;

  // Cold/rime (rare in many Indian metros) could add bump; skip for simplicity

  const total = rainBump + windBump + heatBump;
  const explain = [];
  if (rainBump) explain.push(`rain +${Math.round(rainBump * 100)}%`);
  if (windBump) explain.push(`wind +${Math.round(windBump * 100)}%`);
  if (heatBump) explain.push(`heat +${Math.round(heatBump * 100)}%`);
  return { factor: total, explain };
}

export default function useTrafficPredictor({ lat, lon }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [hourlyWX, setHourlyWX] = useState([]); // [{time, tempC, precipProb, precipMm, windKmh}]
  const [currentWX, setCurrentWX] = useState(null);

  // 1) Fetch live weather (keyless)
  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    let abort = false;

    (async () => {
      try {
        setLoading(true); setErr("");
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,precipitation,wind_speed_10m` +
          `&hourly=temperature_2m,precipitation_probability,precipitation,wind_speed_10m` +
          `&forecast_days=2&timezone=auto`;
        const r = await fetch(url);
        if (!r.ok) throw new Error("weather fetch failed");
        const j = await r.json();
        if (abort) return;

        const cur = {
          tempC: j?.current?.temperature_2m ?? null,
          windKmh: j?.current?.wind_speed_10m ?? null,
          precipMm: j?.current?.precipitation ?? 0,
        };
        setCurrentWX(cur);

        const t = j?.hourly?.time || [];
        const rows = t.map((ts, i) => ({
          time: ts,
          tempC: j.hourly.temperature_2m?.[i] ?? null,
          precipProb: j.hourly.precipitation_probability?.[i] ?? 0,
          precipMm: j.hourly.precipitation?.[i] ?? 0,
          windKmh: j.hourly.wind_speed_10m?.[i] ?? 0,
        }));
        setHourlyWX(rows);
      } catch (e) {
        if (!abort) setErr("Live weather unavailable — using historical pattern only.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();

    return () => { abort = true; };
  }, [lat, lon]);

  // 2) Build 24h predicted traffic series using weather adjustments
  const series = useMemo(() => {
    const now = new Date();
    const isWeekend = [0,6].includes(now.getDay());
    // if we don’t have hourly weather, synthesize 24h from current + decay
    const hours = [...Array(24).keys()].map(h => (now.getHours() + h) % 24);

    return hours.map((H, idx) => {
      // pick matching hour from hourlyWX by timestamp if available
      const wx = hourlyWX[idx] || {};
      const impact = weatherImpact({
        precipProb: wx.precipProb ?? 0,
        precipMm: wx.precipMm ?? 0,
        windKmh: wx.windKmh ?? (currentWX?.windKmh ?? 0),
        tempC: wx.tempC ?? (currentWX?.tempC ?? 28),
      });

      const base = basePattern(H, isWeekend);
      const adjusted = clamp(Math.round(base * (1 + impact.factor)), 10, 99);
      const speed = speedFromIndex(adjusted);

      return {
        hour: H,
        label: `${String(H).padStart(2,"0")}:00`,
        index: adjusted,
        speed,
        explain: impact.explain,
        precipProb: wx.precipProb ?? 0,
        precipMm: wx.precipMm ?? 0,
        windKmh: wx.windKmh ?? 0,
        tempC: wx.tempC ?? null,
      };
    });
  }, [hourlyWX, currentWX]);

  // 3) “Now” & next 6h forecast
  const nowIdx = 0; // first element corresponds to this hour
  const now = series[nowIdx] || null;
  const forecast = series.slice(1, 7); // next 6 hours

  return { loading, err, now, series, forecast };
}
