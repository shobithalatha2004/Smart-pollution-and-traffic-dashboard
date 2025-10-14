import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";
import SearchBox from "./SearchBox.jsx";
import SmartSelect from "./SmartSelect.jsx";

/**
 * MapPanel — nationwide map
 * - Basemap switcher (OSM/Carto/Topo)
 * - State/District polygons
 * - Cities/Towns/Villages markers (cluster + heatmap)
 * - Search (Nominatim), Routing (OSRM), Iso-distance rings
 * - URL sync (level/stateRel/districtRel/basemap)
 */
const OVERPASS = "https://overpass-api.de/api/interpreter";
const OSRM = "https://router.project-osrm.org/route/v1/driving/";
const COLORS = { state:"#56B4E9", district:"#00C389", city:"#E69F00", village:"#FF6655", route:"#7c3aed" };
const LEVELS = [
  { key: "state", label: "State", adminLevel: 4 },
  { key: "district", label: "District", adminLevel: 6 },
  { key: "city", label: "Cities & Towns", place: ["city", "town"] },
  { key: "village", label: "Villages", place: ["village"] },
];
const areaIdFromRel = (relId) => 3600000000 + Number(relId);

const BASEMAPS = {
  OSM: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:'&copy; OpenStreetMap',
    maxZoom: 19,
  }),
  CartoLight: L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution:'&copy; OpenStreetMap & CARTO', maxZoom: 20,
  }),
  CartoDark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:'&copy; OpenStreetMap & CARTO', maxZoom: 20,
  }),
  OpenTopo: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:'&copy; OpenStreetMap & SRTM | OpenTopoMap', maxZoom: 17,
  }),
};

// default Leaflet icons
const DefaultIcon = L.icon({
  iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor:[12,41], popupAnchor:[1,-34], tooltipAnchor:[16,-28],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPanel({ countryCode="IN" }) {
  const mapRef = useRef(null);
  const layerPolys = useRef(null);
  const layerPoints = useRef(null);
  const layerCluster = useRef(null);
  const layerHeat = useRef(null);
  const layerRoute = useRef(null);
  const layerRings = useRef(null);

  const [ready, setReady] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);

  const [level, setLevel] = useState(getQP("level") || "state");
  const [stateRel, setStateRel] = useState(parseInt(getQP("stateRel") || "", 10) || null);
  const [districtRel, setDistrictRel] = useState(parseInt(getQP("districtRel") || "", 10) || null);
  const [basemap, setBasemap] = useState(getQP("basemap") || "CartoDark");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // routing
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // toggles
  const [useCluster, setUseCluster] = useState(true);
  const [useHeat, setUseHeat] = useState(false);

  // init map
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("osm-map", { center: [22.3511, 78.6677], zoom: 5, minZoom: 3, maxZoom: 19 });
    BASEMAPS[basemap]?.addTo(map);

    layerPolys.current = L.geoJSON(null, {
      style: () => ({ color:"#fff", weight:1, opacity:.9, fillColor:"#4f46e5", fillOpacity:.08 }),
      onEachFeature: (f, layer) => layer.bindPopup(`<b>${f?.properties?.name || "Unknown"}</b>`),
    }).addTo(map);

    layerPoints.current = L.layerGroup().addTo(map);
    layerCluster.current = L.markerClusterGroup({ showCoverageOnHover:false, disableClusteringAtZoom: 11 }).addTo(map);
    layerHeat.current = L.heatLayer([], { radius:18, blur:12, maxZoom:12, minOpacity:.25 });
    layerRoute.current = L.geoJSON(null, { style:{ color:"#7c3aed", weight:4, opacity:.9 } }).addTo(map);
    layerRings.current = L.layerGroup().addTo(map);

    map.on("click", (e) => {
      if (e.originalEvent.shiftKey) setEnd({ lat:e.latlng.lat, lon:e.latlng.lng });
      else { setStart({ lat:e.latlng.lat, lon:e.latlng.lng }); setEnd(null); }
    });

    mapRef.current = map;
    setReady(true);
  }, [basemap]);

  // switch basemap
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.values(BASEMAPS).forEach(l => map.removeLayer(l));
    BASEMAPS[basemap]?.addTo(map);
    pushQP({ basemap });
  }, [basemap]);

  // load states once
  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        setLoading(true); setErr("");
        const q = `
[out:json][timeout:60];
area["ISO3166-1"="${countryCode}"]["admin_level"="2"]->.country;
rel(area.country)["boundary"="administrative"]["admin_level"="4"];
out ids tags bb;`;
        const res = await fetch(OVERPASS, { method:"POST", headers:{ "Content-Type":"text/plain" }, body:q });
        if (!res.ok) throw new Error("overpass states fail");
        const json = await res.json();
        const rows = (json.elements||[])
          .filter(e=>e.type==="relation")
          .map(r=>({ rel:r.id, name:r.tags?.name || r.tags?.["name:en"] || `state ${r.id}`, bounds:r.bounds||null }))
          .sort((a,b)=> a.name.localeCompare(b.name));
        setStates(rows);

        if (stateRel) {
          await onSelectState(stateRel, { silentPush:true });
          if (districtRel) await onSelectDistrict(districtRel, { silentPush:true });
        }
      } catch {
        setErr("Could not load states. Try again later.");
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, countryCode]);

  // helpers
  function fitBbox(b) {
    if (!b || !mapRef.current) return;
    const bounds = L.latLngBounds([b.minlat,b.minlon],[b.maxlat,b.maxlon]);
    if (bounds.isValid()) mapRef.current.fitBounds(bounds.pad(0.05));
  }
  function drawPolys(geojson, color) {
    const polys = layerPolys.current;
    polys.clearLayers();
    if (!geojson) return;
    polys.options.style = () => ({ color, weight:1, opacity:.9, fillColor:color, fillOpacity:.08 });
    polys.addData(geojson);
    try { const b = polys.getBounds(); if (b.isValid()) mapRef.current.fitBounds(b.pad(0.05)); } catch {}
  }
  function clearPoints(){
    layerPoints.current.clearLayers();
    layerCluster.current.clearLayers();
    if (mapRef.current.hasLayer(layerHeat.current)) mapRef.current.removeLayer(layerHeat.current);
    layerHeat.current.setLatLngs([]);
  }
  function drawPoints(pts, color){
    clearPoints();
    if (useCluster) {
      pts.forEach(p=>{
        const m = L.marker([p.lat,p.lon]).bindPopup(`<b>${p.name}</b><br/>${p.type||""}`);
        layerCluster.current.addLayer(m);
      });
    } else {
      pts.forEach(p=>{
        L.circleMarker([p.lat,p.lon], { radius:5, color, weight:1, fillColor:color, fillOpacity:.85 })
          .bindPopup(`<b>${p.name}</b><br/>${p.type||""}`)
          .addTo(layerPoints.current);
      });
    }
    if (useHeat && pts.length){
      const heat = pts.map(p=>{
        const w = p.type==="city" ? 1 : p.type==="town" ? 0.7 : 0.35;
        return [p.lat, p.lon, w];
      });
      layerHeat.current.setLatLngs(heat);
      layerHeat.current.addTo(mapRef.current);
    }
  }

  async function fetchRelationGeo(relId){
    const q = `
[out:json][timeout:60];
rel(${relId}); out tags bb;
(._;>;); out body geom;`;
    const res = await fetch(OVERPASS, { method:"POST", headers:{ "Content-Type":"text/plain" }, body:q });
    if (!res.ok) throw new Error("overpass geom fail");
    const json = await res.json();
    const rel = (json.elements||[]).find(e=>e.type==="relation");
    if (!rel) return { geojson:null, bbox:null };
    const outers = (rel.members||[]).filter(m=>m.type==="way" && m.role==="outer" && m.geometry)
      .map(m=> m.geometry.map(g=>[g.lon,g.lat]));
    if (!outers.length) return { geojson:null, bbox:rel.bounds||null };
    return {
      geojson:{ type:"Feature", properties:{ name: rel.tags?.name || `rel ${rel.id}` },
        geometry:{ type:"MultiPolygon", coordinates: outers.map(r=>[r]) } },
      bbox: rel.bounds || null
    };
  }
  async function loadDistricts(relId){
    const q = `
[out:json][timeout:60];
area(${areaIdFromRel(relId)})->.sel;
rel(area.sel)["boundary"="administrative"]["admin_level"="6"];
out ids tags bb;`;
    const res = await fetch(OVERPASS, { method:"POST", headers:{ "Content-Type":"text/plain" }, body:q });
    if (!res.ok) throw new Error("overpass districts fail");
    const json = await res.json();
    return (json.elements||[])
      .filter(e=>e.type==="relation")
      .map(r=>({ rel:r.id, name:r.tags?.name || r.tags?.["name:en"] || `district ${r.id}`, bounds:r.bounds||null }))
      .sort((a,b)=> a.name.localeCompare(b.name));
  }
  async function loadPlacesInArea(relId, kinds){
    const filter = kinds.map(k=> `node(area)[place="${k}"];`).join("\n");
    const q = `
[out:json][timeout:60];
area(${areaIdFromRel(relId)})->.a;
( ${filter} ); out tags center;`;
    const res = await fetch(OVERPASS, { method:"POST", headers:{ "Content-Type":"text/plain" }, body:q });
    if (!res.ok) throw new Error("overpass places fail");
    const json = await res.json();
    const pts = (json.elements||[]).map(n=>({
      id:n.id, name:n.tags?.name || n.tags?.["name:en"] || "(unnamed)",
      type:n.tags?.place, lat:n.lat ?? n.center?.lat, lon:n.lon ?? n.center?.lon
    })).filter(p=> Number.isFinite(p.lat) && Number.isFinite(p.lon));
    setPlaces(pts);
    return pts;
  }

  async function onSelectState(relId){
    setStateRel(relId || null);
    setDistrictRel(null);
    setPlaces([]);
    pushQP({ level, stateRel: relId || "", districtRel: "", basemap });

    if (!relId){ layerPolys.current.clearLayers(); clearPoints(); return; }
    try{
      setLoading(true); setErr("");
      const { geojson, bbox } = await fetchRelationGeo(relId);
      drawPolys(geojson, COLORS.state);
      if (bbox) fitBbox(bbox);
      const ds = await loadDistricts(relId);
      setDistricts(ds);
      if (level==="city") drawPoints(await loadPlacesInArea(relId, ["city","town"]), COLORS.city);
      else if (level==="village") drawPoints(await loadPlacesInArea(relId, ["village"]), COLORS.village);
      else clearPoints();
    } catch { setErr("Failed to draw state or load districts."); }
    finally { setLoading(false); }
  }
  async function onSelectDistrict(relId){
    setDistrictRel(relId || null);
    pushQP({ level, stateRel: stateRel || "", districtRel: relId || "", basemap });

    if (!relId){ layerPolys.current.clearLayers(); clearPoints(); return; }
    try{
      setLoading(true); setErr("");
      const { geojson, bbox } = await fetchRelationGeo(relId);
      drawPolys(geojson, COLORS.district);
      if (bbox) fitBbox(bbox);
      if (level==="city") drawPoints(await loadPlacesInArea(relId, ["city","town"]), COLORS.city);
      else if (level==="village") drawPoints(await loadPlacesInArea(relId, ["village"]), COLORS.village);
      else clearPoints();
    } catch { setErr("Failed to draw district."); }
    finally { setLoading(false); }
  }
  async function onChangeLevel(k){
    setLevel(k);
    pushQP({ level:k, stateRel: stateRel||"", districtRel: districtRel||"", basemap });
    try{
      setLoading(true); setErr("");
      if (k==="state" || k==="district"){
        clearPoints();
        if (districtRel){
          const { geojson } = await fetchRelationGeo(districtRel);
          drawPolys(geojson, COLORS.district);
        } else if (stateRel){
          const { geojson } = await fetchRelationGeo(stateRel);
          drawPolys(geojson, COLORS.state);
        }
        return;
      }
      const kinds = k==="city" ? ["city","town"] : ["village"];
      if (districtRel) drawPoints(await loadPlacesInArea(districtRel, kinds), k==="city"?COLORS.city:COLORS.village);
      else if (stateRel) drawPoints(await loadPlacesInArea(stateRel, kinds), k==="city"?COLORS.city:COLORS.village);
      else setErr("Select a state first.");
    } catch { setErr("Could not load places for this level."); }
    finally { setLoading(false); }
  }

  // search pick → pan & set start
  function onPickSearch(p){
    if (!mapRef.current) return;
    mapRef.current.setView([p.lat,p.lon], 11);
    setStart({ lat:p.lat, lon:p.lon });
    setEnd(null);
  }

  // rings around start
  useEffect(()=>{
    const g = layerRings.current;
    g.clearLayers();
    if (!start) return;
    [1,3,5].forEach((km, i)=>{
      L.circle([start.lat,start.lon], { radius:km*1000, color:"#94a3b8", weight:1, fill:false, dashArray: i===0?"":"4 6" })
        .bindTooltip(`${km} km`).addTo(g);
    });
    L.marker([start.lat,start.lon]).bindPopup("<b>Start</b>").addTo(g);
  }, [start]);

  // route
  useEffect(()=>{
    const rl = layerRoute.current;
    rl.clearLayers();
    setRouteInfo(null);
    if (!start || !end) return;
    (async ()=>{
      try{
        const url = `${OSRM}${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        const route = json?.routes?.[0];
        if (!route) return;
        rl.addData({ type:"Feature", geometry: route.geometry, properties:{} });
        const b = L.geoJSON(route.geometry).getBounds();
        if (b.isValid()) mapRef.current.fitBounds(b.pad(0.08));
        setRouteInfo({ distance_km:+(route.distance/1000).toFixed(2), duration_min:Math.round(route.duration/60) });
      } catch {}
    })();
  }, [start, end]);

  // redraw on toggles
  useEffect(()=>{
    if (!places.length) return;
    drawPoints(places, level==="city"?COLORS.city:COLORS.village);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCluster, useHeat]);

  const legend = useMemo(()=>(
    <div className="legend" style={{marginTop:8, flexWrap:"wrap"}}>
      <span className="chip"><span className="dot" style={{background:COLORS.state}}></span>State</span>
      <span className="chip"><span className="dot" style={{background:COLORS.district}}></span>District</span>
      <span className="chip"><span className="dot" style={{background:COLORS.city}}></span>City/Town</span>
      <span className="chip"><span className="dot" style={{background:COLORS.village}}></span>Village</span>
      <span className="chip"><span className="dot" style={{background:COLORS.route}}></span>Route</span>
    </div>
  ),[]);

  return (
    <div className="panel" aria-label="Nationwide map">
      <div className="section" style={{gap:10, alignItems:"center", flexWrap:"wrap"}}>
        <h4>Nationwide Map — Admin Areas + Places</h4>
        <div className="row" style={{flexWrap:"wrap"}}>
          <SearchBox placeholder="Search any place in India…" onPick={onPickSearch} />

          <label>Basemap</label>
          <select value={basemap} onChange={(e)=> setBasemap(e.target.value)}>
            {Object.keys(BASEMAPS).map(k=> <option key={k} value={k}>{k}</option>)}
          </select>

          <label>Level</label>
          <select value={level} onChange={(e)=> onChangeLevel(e.target.value)}>
            {LEVELS.map(l=> <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>

          <label>State</label>
          <SmartSelect
            options={states.map(s=> ({ value: s.rel, label: s.name }))}
            value={stateRel ?? ""}
            onChange={(v)=> onSelectState(Number(v) || null)}
            placeholder="Pick a state…"
            width={260}
          />

          <label>District</label>
          <SmartSelect
            options={districts.map(d=> ({ value: d.rel, label: d.name }))}
            value={districtRel ?? ""}
            onChange={(v)=> onSelectDistrict(Number(v) || null)}
            placeholder={districts.length ? "Pick a district…" : "Select state first"}
            disabled={!districts.length}
            width={260}
          />

          <label className="chip" style={{cursor:"pointer"}}>
            <input type="checkbox" checked={useCluster} onChange={e=> setUseCluster(e.target.checked)} />&nbsp;Cluster
          </label>
          <label className="chip" style={{cursor:"pointer"}}>
            <input type="checkbox" checked={useHeat} onChange={e=> setUseHeat(e.target.checked)} />&nbsp;Heatmap
          </label>

          {loading ? <span className="spinner" /> : null}
        </div>
      </div>

      {legend}

      <div id="osm-map"></div>

      <div className="note" style={{ marginTop: 10 }}>
        <b>How to route:</b> Click map = <b>Start</b>, <b>Shift+Click</b> = <b>End</b>.
        Rings show 1/3/5 km from Start. Basemap, cluster & heatmap can be toggled.
        {routeInfo && <> &nbsp; <b>Route:</b> {routeInfo.distance_km} km • ~{routeInfo.duration_min} min</>}
      </div>

      {err && <div className="note" style={{ marginTop:10, borderLeftColor:"var(--red)" }}>{err}</div>}
    </div>
  );
}

/* URL helpers */
function getQP(k){ const u = new URL(window.location.href); return u.searchParams.get(k) || ""; }
function pushQP(obj){
  const u = new URL(window.location.href);
  Object.entries(obj).forEach(([k,v])=>{ if (v===null || v==="") u.searchParams.delete(k); else u.searchParams.set(k, String(v)); });
  window.history.replaceState({}, "", u.toString());
}
