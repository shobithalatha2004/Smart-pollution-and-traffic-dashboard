import { useEffect, useRef, useState } from "react";
const NOMINATIM = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=25&q=";

export default function SearchBox({ placeholder="Search places...", onPick }) {
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function searchNow(v) {
    setQ(v);
    if (!v || v.length < 3) { setOpts([]); setOpen(false); return; }
    try {
      const res = await fetch(NOMINATIM + encodeURIComponent(v), { headers: { "Accept-Language": "en" } });
      const json = await res.json();
      setOpts(json || []);
      setOpen(true);
      setActive(0);
      if (listRef.current) listRef.current.scrollTop = 0;
    } catch {
      setOpts([]); setOpen(false);
    }
  }

  function pick(o) {
    setQ(o.display_name || "");
    setOpen(false);
    if (onPick) onPick({ lat: +o.lat, lon: +o.lon, name: o.display_name, raw: o });
  }

  function onKey(e){
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a=> Math.min(a+1, opts.length-1)); ensureVisible(active+1); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a=> Math.max(a-1, 0));            ensureVisible(active-1); }
    if (e.key === "Enter")     { e.preventDefault(); pick(opts[active]); }
    if (e.key === "Escape")    { setOpen(false); }
  }

  function ensureVisible(idx){
    if (!listRef.current) return;
    const itemH = 34, maxH = 260;
    const top = idx * itemH, bottom = top + itemH;
    const viewTop = listRef.current.scrollTop;
    const viewBottom = viewTop + maxH;
    if (bottom > viewBottom) listRef.current.scrollTop = bottom - maxH;
    if (top < viewTop) listRef.current.scrollTop = top;
  }

  return (
    <div ref={boxRef} style={{ position:"relative", minWidth:260 }}>
      <input
        aria-label="Search"
        value={q}
        placeholder={placeholder}
        onChange={(e) => searchNow(e.target.value)}
        onKeyDown={onKey}
        onFocus={() => { if (opts.length) setOpen(true); }}
        style={{ width:"100%", background:"var(--surface)", color:"var(--ink)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px" }}
      />
      {open && opts.length > 0 && (
        <div
          ref={listRef}
          style={{
            position:"absolute", top:"110%", left:0, right:0, zIndex:50,
            background:"var(--panel)", border:"1px solid var(--border)", borderRadius:10,
            maxHeight:260, overflowY:"auto", boxShadow:"0 12px 28px rgba(0,0,0,.35)"
          }}>
          {opts.map((o, i) => (
            <div
              key={o.place_id}
              onClick={() => pick(o)}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              style={{
                padding:"8px 10px", cursor:"pointer", fontSize:13,
                background: i===active ? "rgba(86,180,233,.18)" : "transparent",
                borderBottom:"1px dashed rgba(255,255,255,.06)"
              }}
            >{o.display_name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
