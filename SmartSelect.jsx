import { useEffect, useMemo, useRef, useState } from "react";

/**
 * SmartSelect
 * - Props: options [{value, label}], value, onChange(v), placeholder, disabled
 * - Type to filter; arrow keys; Enter to pick; Esc to close
 * - Windowed list for fast rendering with thousands of items
 */
export default function SmartSelect({
  options = [],
  value = null,
  onChange = () => {},
  placeholder = "Select…",
  disabled = false,
  width = 220,
  itemHeight = 34,
  maxHeight = 260,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => options.find(o => String(o.value) === String(value)) || null, [options, value]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(o => (o.label || "").toLowerCase().includes(s));
  }, [q, options]);

  // Windowing
  const visibleCount = Math.floor(maxHeight / itemHeight);
  const [scrollTop, setScrollTop] = useState(0);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(filtered.length, startIndex + visibleCount + 6);
  const slice = filtered.slice(startIndex, endIndex);
  const spacerTop = startIndex * itemHeight;
  const spacerBottom = Math.max(0, (filtered.length - endIndex) * itemHeight);

  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function pick(o) {
    onChange(o?.value ?? null);
    setOpen(false);
    setQ("");
  }

  function onKey(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, filtered.length - 1));
      ensureVisible(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
      ensureVisible(active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function ensureVisible(idx) {
    const top = idx * itemHeight;
    const bottom = top + itemHeight;
    const viewTop = scrollTop;
    const viewBottom = scrollTop + maxHeight;
    if (bottom > viewBottom && listRef.current) {
      listRef.current.scrollTop = bottom - maxHeight;
      setScrollTop(listRef.current.scrollTop);
    } else if (top < viewTop && listRef.current) {
      listRef.current.scrollTop = top;
      setScrollTop(listRef.current.scrollTop);
    }
  }

  return (
    <div ref={boxRef} style={{ position: "relative", width }}>
      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={onKey}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          background: "var(--surface)",
          color: disabled ? "var(--muted)" : "var(--ink)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "8px 10px",
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {selected ? selected.label : <span style={{ color: "var(--muted)" }}>{placeholder}</span>}
        </span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
        </svg>
      </div>

      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            zIndex: 60,
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 12px 28px rgba(0,0,0,.35)",
          }}
        >
          <input
            autoFocus
            placeholder="Type to filter…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); if (listRef.current) { listRef.current.scrollTop = 0; setScrollTop(0); } }}
            style={{
              width: "100%",
              background: "var(--surface)",
              color: "var(--ink)",
              border: "none",
              borderBottom: "1px solid var(--border)",
              borderRadius: "10px 10px 0 0",
              padding: "10px 12px",
              outline: "none",
            }}
            onKeyDown={onKey}
          />
          <div
            ref={listRef}
            style={{ maxHeight: maxHeight, overflowY: "auto" }}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            <div style={{ height: spacerTop }} />
            {slice.map((o, i) => {
              const idx = startIndex + i;
              const isActive = idx === active;
              return (
                <div
                  key={o.value}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  style={{
                    height: itemHeight,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    cursor: "pointer",
                    background: isActive ? "rgba(86,180,233,.18)" : "transparent",
                    borderBottom: "1px dashed rgba(255,255,255,.06)",
                    fontSize: 13,
                  }}
                >
                  {o.label}
                </div>
              );
            })}
            <div style={{ height: spacerBottom }} />
            {filtered.length === 0 && (
              <div style={{ padding: 10, fontSize: 12, color: "var(--muted)" }}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
