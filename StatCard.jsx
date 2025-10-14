import { useEffect, useRef, useState } from "react";

export default function StatCard({ title, value, sub, icon, color="var(--accent)" }){
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(()=>{
    if (typeof value !== "number") { setDisplay(value ?? "—"); prev.current = 0; return; }
    const start = prev.current || 0;
    const end = value;
    const dur = 500;
    const t0 = performance.now();
    let raf;
    const tick = (t)=>{
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1-p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    prev.current = end;
    return ()=> cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="card">
      <div className="kpi">
        <div className="kpiIcon" style={{borderColor:color, background:`linear-gradient(140deg, ${color}33, ${color}14)`}}>
          {icon}
        </div>
        <div>
          <div className="cardTitle">{title}</div>
          <div className="big">{display ?? "—"}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
