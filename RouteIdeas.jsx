/* RouteIdeas.jsx
   - No external maps yet; smart, readable suggestions.
   - Scores each place by inverted congestion + air quality.
   - Best window = next 3 hours with lowest congestion.
*/

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// Compute a 0..100 score from AQI + congestion
function comfortScore(aqi, congestion){
  // Normalize AQI: 0..500 => 100..0 (higher is better)
  const aqiScore = 100 - clamp((aqi ?? 200) / 500 * 100, 0, 100);
  // Normalize congestion: 0..100 => 100..0
  const congScore = 100 - clamp((congestion ?? 60), 0, 100);
  // Weighted: traffic matters slightly more for “route comfort”
  const score = Math.round(0.45 * aqiScore + 0.55 * congScore);
  return clamp(score, 0, 100);
}

// Find the best 3-hour window in the next 8 hours
function bestWindow(seriesT){
  if(!seriesT || !seriesT.length) return { label:"—", avgCon: null };
  const future = seriesT.filter(r => r.time >= new Date(Date.now() - 10*60*1000)); // now onwards
  const take = future.slice(0, 8); // next 8 hours if available
  if(!take.length) return { label:"—", avgCon: null };

  let bestIdx = 0, bestVal = Infinity;
  for(let i=0;i<take.length;i++){
    const chunk = take.slice(i, i+3);
    if(chunk.length<2) break;
    const avg = chunk.reduce((p,c)=>p+c.congestion,0) / chunk.length;
    if(avg < bestVal){ bestVal = avg; bestIdx = i; }
  }
  const start = take[bestIdx];
  const end = take[Math.min(bestIdx+2, take.length-1)];
  const label = new Date(start.time).toLocaleTimeString([], { hour:"2-digit" }) + "–" +
                new Date(end.time).toLocaleTimeString([], { hour:"2-digit" });
  return { label, avgCon: Math.round(bestVal) };
}

// A tiny conic “score ring”
function ScoreRing({ score=0, label="Score"}){
  const col =
    score >= 80 ? "#009E73" : score >= 60 ? "#56B4E9" :
    score >= 40 ? "#E69F00" : "#D55E00";
  return (
    <div style={{display:"grid", placeItems:"center"}}>
      <div style={{
        width: 56, height:56, borderRadius:"50%",
        background: `conic-gradient(${col} ${score*3.6}deg, rgba(255,255,255,.12) 0deg)`,
        display:"grid", placeItems:"center"
      }}>
        <div style={{
          width:42, height:42, borderRadius:"50%", background:"var(--panel)",
          border:"1px solid var(--border)", display:"grid", placeItems:"center", fontWeight:800
        }}>
          {score}
        </div>
      </div>
      <div className="sub" style={{textAlign:"center", marginTop:6}}>{label}</div>
    </div>
  );
}

// Per-city simple POIs (lat/lon placeholders for now)
const POIS = {
  Bengaluru: [
    { name:"Cubbon Park", type:"Park", hint:"Via Kasturba Rd / MG Rd" },
    { name:"Ulsoor Lake", type:"Lake", hint:"Via Kensington Rd" },
    { name:"Orion Mall", type:"Mall", hint:"Via Dr Rajkumar Rd" },
    { name:"KR Market", type:"Bazaar", hint:"Via SJP Rd" },
    { name:"Majestic (KBS)", type:"Transit", hint:"Via Sheshadri Rd" },
  ],
  Delhi: [
    { name:"Lodhi Gardens", type:"Park", hint:"Via Lodhi Rd" },
    { name:"India Gate", type:"Monument", hint:"Via Rajpath / Janpath" },
    { name:"Sarojini Nagar", type:"Bazaar", hint:"Via Aurobindo Marg" },
    { name:"Select Citywalk", type:"Mall", hint:"Via Press Enclave Rd" },
    { name:"New Delhi Station", type:"Transit", hint:"Via Bhavbhuti Marg" },
  ],
  Mumbai: [
    { name:"Marine Drive", type:"Seafront", hint:"Via Netaji Subhash Chandra Bose Rd" },
    { name:"Sanjay Gandhi NP", type:"Park", hint:"Via Western Express Hwy" },
    { name:"Juhu Beach", type:"Beach", hint:"Via Juhu Rd" },
    { name:"Phoenix Mall", type:"Mall", hint:"Via Senapati Bapat Marg" },
    { name:"CST", type:"Transit", hint:"Via DN Rd" },
  ],
  Chennai: [
    { name:"Marina Beach", type:"Beach", hint:"Via Kamarajar Salai" },
    { name:"Semmozhi Poonga", type:"Park", hint:"Via Cathedral Rd" },
    { name:"Express Avenue", type:"Mall", hint:"Via Whites Rd" },
    { name:"T Nagar", type:"Bazaar", hint:"Via Usman Rd" },
    { name:"Central Station", type:"Transit", hint:"Via GH Rd" },
  ],
};

export default function RouteIdeas({ city, aqi, seriesT=[] }){
  const last = seriesT[seriesT.length-1];
  const currentCong = last ? last.congestion : null;
  const window = bestWindow(seriesT);
  const candidates = (POIS[city.value] || []).map(p => {
    const score = comfortScore(aqi, currentCong);
    return { ...p, score };
  }).sort((a,b)=> b.score - a.score).slice(0,4);

  return (
    <div className="panel" aria-label="Location ideas">
      <div className="section">
        <h4>Location & Route Ideas</h4>
        <span className="help">Blends air quality + traffic to suggest better trips</span>
      </div>

      <div className="legend" style={{marginBottom:10}}>
        <span className="chip"><span className="dot" style={{background:"#009E73"}}></span>80–100 Great</span>
        <span className="chip"><span className="dot" style={{background:"#56B4E9"}}></span>60–79 Good</span>
        <span className="chip"><span className="dot" style={{background:"#E69F00"}}></span>40–59 Fair</span>
        <span className="chip"><span className="dot" style={{background:"#D55E00"}}></span>0–39 Busy/Poor</span>
      </div>

      <div className="ideas-list">
        {candidates.map((p, i)=>(
          <div key={i} className="idea-card">
            <div style={{display:"flex", gap:12, alignItems:"center"}}>
              <ScoreRing score={p.score} label="Comfort" />
              <div style={{flex:1}}>
                <div style={{display:"flex", alignItems:"baseline", gap:8}}>
                  <b style={{fontSize:16}}>{p.name}</b>
                  <span className="chip">{p.type}</span>
                </div>
                <div className="sub">Suggested route: <b>{p.hint}</b></div>
                <div className="sub">Best window: <b>{window.label}</b> (avg congestion {window.avgCon ?? "—"}%)</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="note" style={{marginTop:12}}>
        <b>Tip:</b> Scores are higher when air is cleaner and roads are clearer. Real turn-by-turn routing can be added later via your backend (Mapbox/HERE/TomTom).
      </div>
    </div>
  );
}
