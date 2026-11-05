document.addEventListener("DOMContentLoaded", () => {
  function renderDashboard() {
    const key = "dekalhouse_analytics_v1";
    let data; try { data = JSON.parse(localStorage.getItem(key)) || { visits: [], clicks: [] }; } catch { data = { visits: [], clicks: [] }; }
    const projects = ["Web Store", "Web Store for Dev", "Dépenses", "QR CODE", "Vidéo Cover", "DEKAL Ping", "Galaxy Defender"];
    let range = "week";
    const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const startOfWeek = d => { const x = startOfDay(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
    const inRange = (item, r, offset=0) => { const d = new Date(item.at), now = new Date(); now.setFullYear(now.getFullYear() - offset); const date = new Date(d); date.setFullYear(date.getFullYear() - offset); if (r === "week") return date >= startOfWeek(now) && date <= now; if (r === "month") return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); if (r === "year") return date.getFullYear() === now.getFullYear(); return true; };
    const count = (arr, r, offset=0) => arr.filter(x => inRange(x, r, offset)).length;
    const fmt = n => Number(n).toLocaleString("fr-FR");
    function drawChart(visits, clicks) {
      const canvas = document.getElementById("activity-chart"); if (!canvas) return;
      const rect = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1, width = Math.max(300, rect.width), height = 260;
      canvas.width = width * ratio; canvas.height = height * ratio; const ctx = canvas.getContext("2d"); ctx.scale(ratio, ratio);
      const days = range === "week" ? 7 : range === "month" ? 30 : range === "year" ? 12 : 12;
      const labels = [], v = [], c = [], now = new Date();
      for (let i=days-1;i>=0;i--) { let a, b, label; if (range === "year") { a = new Date(now.getFullYear(), now.getMonth()-i, 1); b = new Date(a.getFullYear(), a.getMonth()+1, 1); label = a.toLocaleDateString("fr-FR",{month:"short"}); } else { a = startOfDay(now); a.setDate(a.getDate()-i); b = new Date(a); b.setDate(b.getDate()+1); label = a.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}); } labels.push(label); v.push(data.visits.filter(x=>new Date(x.at)>=a && new Date(x.at)<b).length); c.push(data.clicks.filter(x=>new Date(x.at)>=a && new Date(x.at)<b).length); }
      const max = Math.max(1,...v,...c), left=34, right=12, top=18, bottom=34, plotW=width-left-right, plotH=height-top-bottom;
      ctx.font="11px Arial"; ctx.fillStyle="#8390a5"; ctx.strokeStyle="#e8edf4"; ctx.lineWidth=1;
      for(let i=0;i<=4;i++){const y=top+plotH*i/4;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(width-right,y);ctx.stroke();ctx.fillText(String(Math.round(max*(4-i)/4)),4,y+4);}
      const step=plotW/days, bar=Math.max(3,Math.min(12,step*.24));
      for(let i=0;i<days;i++){const x=left+step*i+step/2;const vh=plotH*v[i]/max,ch=plotH*c[i]/max;ctx.fillStyle="#2563eb";ctx.fillRect(x-bar-1,top+plotH-vh,bar,vh);ctx.fillStyle="#18a779";ctx.fillRect(x+1,top+plotH-ch,bar,ch);if(days<=7 || i%Math.ceil(days/6)===0 || i===days-1){ctx.fillStyle="#8390a5";ctx.textAlign="center";ctx.fillText(labels[i],x,height-10);}}
    }
    function update() {
      const visits=count(data.visits,range), clicks=count(data.clicks,range), prevVisits=count(data.visits,range,1), prevClicks=count(data.clicks,range,1);
      document.getElementById("dash-visits").textContent=fmt(visits); document.getElementById("dash-clicks").textContent=fmt(clicks); document.getElementById("dash-projects").textContent=projects.filter(p=>data.clicks.some(x=>x.project===p && inRange(x,range))).length; document.getElementById("dash-rate").textContent=(visits?Math.round(clicks/visits*100):0)+"%";
      const change=(a,b)=>b===0?(a===0?"0%":"Nouveau"):((a-b)/b>0?"+":"")+Math.round((a-b)/b*100)+"%";
      document.getElementById("dash-visits-change").textContent=change(visits,prevVisits)+" vs période précédente"; document.getElementById("dash-clicks-change").textContent=change(clicks,prevClicks)+" vs période précédente";
      const box=document.getElementById("project-stats"); box.innerHTML="";
      projects.forEach(p=>{const n=count(data.clicks.filter(x=>x.project===p),range);const row=document.createElement("div");row.className="project-stat-row";row.innerHTML=`<div><span></span><b></b></div><strong></strong>`;row.querySelector("span").textContent=p;row.querySelector("b").style.width=(clicks?Math.max(2,n/clicks*100):0)+"%";row.querySelector("strong").textContent=fmt(n);box.appendChild(row);});
      drawChart();
      const currentYear=new Date().getFullYear(), current=data.visits.filter(x=>new Date(x.at).getFullYear()===currentYear).length, last=data.visits.filter(x=>new Date(x.at).getFullYear()===currentYear-1).length, diff=last===0?(current===0?"0%":"Nouveau"):((current-last)/last>0?"+":"")+Math.round((current-last)/last*100)+"%";
      document.getElementById("year-comparison").innerHTML=`<div><span>Visites ${currentYear}</span><strong>${fmt(current)}</strong></div><div><span>Visites ${currentYear-1}</span><strong>${fmt(last)}</strong></div><b class="comparison-diff">${diff} par rapport à l’année passée</b>`;
    }
    document.querySelectorAll("[data-range]").forEach(btn=>btn.addEventListener("click",()=>{range=btn.dataset.range;document.querySelectorAll("[data-range]").forEach(b=>b.classList.toggle("active",b===btn));update();}));
    update(); window.addEventListener("resize",()=>drawChart());
  }
  renderDashboard();
});
