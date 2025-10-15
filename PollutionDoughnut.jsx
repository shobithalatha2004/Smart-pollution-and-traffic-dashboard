import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = ["#ff6b6b","#fbbf24","#60a5fa","#9b59b6","#34d399","#d97706"];

export default function PollutionDoughnut({ counts }){
  const data = [
    {name:"PM2.5", value: counts.pm25||0},
    {name:"PM10", value: counts.pm10||0},
    {name:"NO2",  value: counts.no2||0},
    {name:"SO2",  value: counts.so2||0},
    {name:"CO",   value: counts.co||0},
    {name:"O3",   value: counts.o3||0},
  ];
  return (
    <div className="panel">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <b>Pollution breakdown</b>
        <span className="sub">Hover to see values</span>
      </div>
      <div style={{height:280, display:"grid", placeItems:"center"}}>
        <PieChart width={360} height={240}>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((_, i)=>(<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
}
