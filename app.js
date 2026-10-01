/* Copyright 2026 Petri Autio. Distributed under GPL-2.0; see LICENSE. */
'use strict';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);parent?.append(el);return el;};
let graph, selected=null;
const storageKey='spinoza-ethics-highlights-v1';
let highlights={};
let storageAvailable=true;
try { const saved=JSON.parse(localStorage.getItem(storageKey)||'{}'); if(saved && typeof saved==='object' && !Array.isArray(saved)) highlights=saved; } catch { storageAvailable=false; }
function persistHighlights(){try{localStorage.setItem(storageKey,JSON.stringify(highlights));$('storage-status').textContent='Saved in this browser.';}catch{storageAvailable=false;$('storage-status').textContent='Browser storage unavailable. Download to keep your highlights.';}}
function applyHighlights(){
 document.querySelectorAll('#reader .personal-highlight').forEach(el=>el.classList.remove('personal-highlight'));
 for(const id of Object.keys(highlights)){document.getElementById(id)?.classList.add('personal-highlight');}
 $('highlight').disabled=!selected;$('highlight').textContent=highlights[selected]?'Remove highlight':'Highlight passage';
}

const kind = n => n.name.includes('C')?3:n.name.includes('D')?0:n.name.includes('A')?1:2;
const colors=['#e7c275','#a9d1d6','#e7b4a2','#c9bbdc'];
const short = n => n.name.slice(1).replace(/0(\d)/g,'$1');
function select(id, scroll=true){
 if(!graph.nodes.some(n=>n.name===id))return;
 selected=id;$('passage').value=id;history.replaceState(null,'','#'+id);draw();applyHighlights();
 document.querySelectorAll('#reader .current').forEach(el=>el.classList.remove('current'));
 const target=$(id);target?.classList.add('current');
 if(target && scroll){const reader=$('reader');reader.scrollTo({top:target.getBoundingClientRect().top-reader.getBoundingClientRect().top+reader.scrollTop-24,behavior:'instant'});}
}
function draw(){
 const mode=$('view').value, incoming=graph.links.filter(l=>l.target===selected), outgoing=graph.links.filter(l=>l.source===selected);
 const neighbors=new Set([selected,...incoming.map(l=>l.source),...outgoing.map(l=>l.target)]);
 const nodes=mode==='focus'&&selected?graph.nodes.filter(n=>neighbors.has(n.name)):graph.nodes;
 const ids=new Set(nodes.map(n=>n.name)),links=graph.links.filter(l=>ids.has(l.source)&&ids.has(l.target));
 const positions=new Map();let width=900,height=700;
 if(mode==='focus'&&selected){height=Math.max(440,Math.max(incoming.length,outgoing.length)*65+100);positions.set(selected,[450,height/2]);for(const [column,items] of [[170,incoming.map(l=>l.source)],[730,outgoing.map(l=>l.target)]]){[...new Set(items)].forEach((id,i)=>positions.set(id,[column,65+i*65]));}}
 else if(mode==='order'){height=940;nodes.forEach((n,i)=>positions.set(n.name,[80+(i%8)*105,65+Math.floor(i/8)*100]));}
 else {width=Math.max(320,$('map').clientWidth);height=Math.max(350,$('map').clientHeight);const depth=new Map(),visiting=new Set();function level(id){if(depth.has(id))return depth.get(id);if(visiting.has(id))return 0;visiting.add(id);const parents=graph.links.filter(l=>l.target===id).map(l=>l.source);const value=parents.length?1+Math.max(...parents.map(level)):0;visiting.delete(id);depth.set(id,value);return value;}const rows=new Map();nodes.forEach(n=>{const d=level(n.name);if(!rows.has(d))rows.set(d,[]);rows.get(d).push(n);});for(const [d,row]of rows)row.forEach((n,i)=>positions.set(n.name,[(i+1)*width/(row.length+1),30+d*(height-60)/Math.max(1,rows.size-1)]));}
 const map=$('map');map.replaceChildren();const svg=svgEl('svg',{width,height,viewBox:`0 0 ${width} ${height}`,role:'group',class:mode==='focus'&&selected?'focus-map':'','aria-label':'Logical dependencies'},map);
 const defs=svgEl('defs',{},svg),marker=svgEl('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'},defs);svgEl('path',{d:'M0 0 L10 5 L0 10 Z',fill:'#7b9681'},marker);
 for(const l of links){const a=positions.get(l.source),b=positions.get(l.target),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;svgEl('line',{x1:a[0]+dx*24/len,y1:a[1]+dy*24/len,x2:b[0]-dx*26/len,y2:b[1]-dy*26/len,'marker-end':'url(#arrow)',class:'edge'+(l.source===selected||l.target===selected?' active':'')},svg);}
 document.querySelectorAll('.hover-info').forEach(el=>el.remove());const hoverInfo=document.createElement('div');hoverInfo.className='hover-info';hoverInfo.setAttribute('role','status');map.after(hoverInfo);
 function previewNode(id){
  const active=id||selected;
  const related=new Set([active,...graph.links.filter(l=>l.target===active).map(l=>l.source),...graph.links.filter(l=>l.source===active).map(l=>l.target)]);
  svg.querySelectorAll('.node').forEach(el=>el.classList.toggle('dim',!!active&&!related.has(el.dataset.id)));
  svg.querySelectorAll('.edge').forEach(el=>el.classList.toggle('active',!!active&&(el.dataset.source===active||el.dataset.target===active)));
  if(id){const n=graph.nodes.find(n=>n.name===id);hoverInfo.textContent=n.DisplayName+' — '+n.ShortText;hoverInfo.classList.add('visible');}else{hoverInfo.classList.remove('visible');}
 }
 hoverInfo.classList.remove('visible');
 for(const edge of svg.querySelectorAll('.edge')){const l=links[[...svg.querySelectorAll('.edge')].indexOf(edge)];edge.dataset.source=l.source;edge.dataset.target=l.target;}
 for(const n of nodes){const [x,y]=positions.get(n.name),g=svgEl('g',{transform:`translate(${x},${y})`,class:'node'+(highlights[n.name]?' saved':'')+(n.name===selected?' selected':selected&&!neighbors.has(n.name)?' dim':''),role:'button',tabindex:0,'aria-label':n.DisplayName+': '+n.ShortText,'aria-pressed':String(n.name===selected)},svg);svgEl('circle',{r:mode==='layers'?Math.max(10,Math.min(20,(height-60)/32)):23,fill:colors[kind(n)]},g);svgEl('text',{dy:4},g).textContent=short(n);svgEl('title',{},g).textContent=n.DisplayName+' — '+n.ShortText;g.dataset.id=n.name;g.addEventListener('mouseenter',()=>previewNode(n.name));g.addEventListener('mouseleave',()=>previewNode(null));g.addEventListener('focus',()=>previewNode(n.name));g.addEventListener('blur',()=>previewNode(null));g.addEventListener('click',()=>select(n.name));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.name);}});}
 const panel=$('selection');panel.replaceChildren();if(selected){const n=graph.nodes.find(n=>n.name===selected),heading=document.createElement('strong');heading.textContent=n.DisplayName;panel.append(heading);for(const [label,items]of [['Uses',incoming.map(l=>l.source)],['Used by',outgoing.map(l=>l.target)]]){if(!items.length)continue;const row=document.createElement('div');row.textContent=label+': ';for(const id of items){const b=document.createElement('button');b.textContent=short(graph.nodes.find(n=>n.name===id));b.onclick=()=>select(id);row.append(b);}panel.append(row);}}else panel.textContent='Choose a node to inspect its premises and read the full passage.';
}
async function init(){try{const responses=await Promise.all(['graph','text'].map(name=>fetch(`data/${name}.json`)));if(responses.some(r=>!r.ok))throw Error('Data unavailable');const [g,text]=await Promise.all(responses.map(r=>r.json()));graph=g;graph.nodes.sort((a,b)=>(a.name.includes('D')?0:a.name.includes('A')?1:2)-(b.name.includes('D')?0:b.name.includes('A')?1:2)||a.name.localeCompare(b.name));
 const reader=$('reader');reader.replaceChildren();for(const s of text){const section=document.createElement('section');section.id=s.id;const n=graph.nodes.find(n=>n.name===s.id),h=document.createElement('h3');h.textContent=n?n.DisplayName.replace(/^I /,''): 'Appendix';section.append(h);if(n){const b=document.createElement('button');b.textContent='Locate in the map ↗';b.onclick=()=>select(s.id,false);section.append(b);}s.paragraphs.forEach((text,i)=>{const p=document.createElement('p');p.textContent=text;if(s.anchors?.[i])p.id=s.anchors[i];section.append(p);});reader.append(section);}
 for(const n of graph.nodes){const option=document.createElement('option');option.value=n.name;option.textContent=n.DisplayName;$('passage').append(option);}
 $('highlight').onclick=()=>{if(!selected)return;if(highlights[selected])delete highlights[selected];else highlights[selected]={createdAt:new Date().toISOString()};persistHighlights();draw();applyHighlights();};
 $('export').onclick=()=>{const payload={format:'spinoza-ethics-highlights',version:1,exportedAt:new Date().toISOString(),highlights};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='spinoza-ethics-highlights.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('File is too large.');const payload=JSON.parse(await file.text());if(payload.format!=='spinoza-ethics-highlights'||payload.version!==1||!payload.highlights||typeof payload.highlights!=='object'||Array.isArray(payload.highlights))throw Error('Choose an exported Ethics highlights file.');const valid=new Set(graph.nodes.map(n=>n.name));const additions={};for(const [id,value]of Object.entries(payload.highlights)){if(!valid.has(id)||!value||typeof value.createdAt!=='string'||!Number.isFinite(Date.parse(value.createdAt)))throw Error('The file contains an invalid passage or date.');additions[id]={createdAt:value.createdAt};}highlights={...highlights,...additions};persistHighlights();draw();applyHighlights();$('storage-status').textContent='Imported '+Object.keys(additions).length+' highlights.'+(storageAvailable?' Saved in this browser.':' Download to keep them.');}catch(error){$('storage-status').textContent=error.message;}e.target.value='';};
 if(!storageAvailable)$('storage-status').textContent='Browser storage unavailable. Download to keep your highlights.';
 applyHighlights();
 $('passage').addEventListener('change' ,e=>select(e.target.value));$('view').addEventListener('change',draw);let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(draw);}).observe($('map'));$('reset').onclick=()=>{selected=null;history.replaceState(null,'',location.pathname+location.search);document.querySelectorAll('.current').forEach(el=>el.classList.remove('current'));draw();applyHighlights();};window.addEventListener('hashchange',()=>select(location.hash.slice(1)));draw();select(location.hash.slice(1)||'1P01');
 }catch(error){$('reader').textContent='The text could not be loaded. Serve this folder over HTTP, then reload.';$('selection').textContent=error.message;}}
init();
