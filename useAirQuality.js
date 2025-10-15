import { useEffect, useState } from "react";

export default function useAirQuality({ lat, lon }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [latest, setLatest] = useState(null);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!lat || !lon) return;
    (async () => {
      try {
        setLoading(true);
        const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();
        const time = json.hourly.time;
        const rows = time.map((t, i) => ({
          time: t,
          pm25: json.hourly.pm2_5[i],
          pm10: json.hourly.pm10[i],
          no2: json.hourly.nitrogen_dioxide[i],
          o3: json.hourly.ozone[i],
        }));
        setSeries(rows);
        setLatest(rows.at(-1));
      } catch (e) {
        setErr("Failed to load air quality");
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon]);

  return { loading, err, latest, series };
}
