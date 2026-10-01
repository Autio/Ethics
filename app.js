/* Copyright 2026 Petri Autio. Distributed under GPL-2.0; see LICENSE. */
'use strict';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);parent?.append(el);return el;};
let graph, selected=null;
const kind = n => n.name.includes('C')?3:n.name.includes('D')?0:n.name.includes('A')?1:2;
const colors=['#e7c275','#a9d1d6','#e7b4a2','#c9bbdc'];
const short = n => n.name.slice(1).replace(/0(\d)/g,'$1');
function select(id, scroll=true){
 if(!graph.nodes.some(n=>n.name===id))return;
 selected=id;$('passage').value=id;history.replaceState(null,'','#'+id);draw();
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
 else {const depth=new Map(),visiting=new Set();function level(id){if(depth.has(id))return depth.get(id);if(visiting.has(id))return 0;visiting.add(id);const parents=graph.links.filter(l=>l.target===id).map(l=>l.source);const value=parents.length?1+Math.max(...parents.map(level)):0;visiting.delete(id);depth.set(id,value);return value;}const rows=new Map();nodes.forEach(n=>{const d=level(n.name);if(!rows.has(d))rows.set(d,[]);rows.get(d).push(n);});width=Math.max(900,Math.max(...[...rows.values()].map(r=>r.length))*75+60);height=rows.size*110+60;for(const [d,row]of rows)row.forEach((n,i)=>positions.set(n.name,[(i+1)*width/(row.length+1),55+d*110]));}
 $('view-description').textContent={layers:'Premises at the top; later statements sit below the claims they depend on.',order:'Read left to right, row by row: definitions, axioms, and propositions with their corollaries.',focus:selected?'The selected statement sits between its immediate premises (left) and the statements that use it (right).':'Select a passage to explore its immediate premises and consequences.'}[mode];
 const map=$('map');map.replaceChildren();const svg=svgEl('svg',{width,height,viewBox:`0 0 ${width} ${height}`,role:'group',class:mode==='focus'&&selected?'focus-map':'','aria-label':'Logical dependencies'},map);
 const defs=svgEl('defs',{},svg),marker=svgEl('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'},defs);svgEl('path',{d:'M0 0 L10 5 L0 10 Z',fill:'#7b9681'},marker);
 for(const l of links){const a=positions.get(l.source),b=positions.get(l.target),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;svgEl('line',{x1:a[0]+dx*24/len,y1:a[1]+dy*24/len,x2:b[0]-dx*26/len,y2:b[1]-dy*26/len,'marker-end':'url(#arrow)',class:'edge'+(l.source===selected||l.target===selected?' active':'')},svg);}
 for(const n of nodes){const [x,y]=positions.get(n.name),g=svgEl('g',{transform:`translate(${x},${y})`,class:'node'+(n.name===selected?' selected':selected&&!neighbors.has(n.name)?' dim':''),role:'button',tabindex:0,'aria-label':n.DisplayName+': '+n.ShortText,'aria-pressed':String(n.name===selected)},svg);svgEl('circle',{r:23,fill:colors[kind(n)]},g);svgEl('text',{dy:4},g).textContent=short(n);svgEl('title',{},g).textContent=n.DisplayName+' — '+n.ShortText;g.addEventListener('click',()=>select(n.name));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(n.name);}});}
 const panel=$('selection');panel.replaceChildren();if(selected){const n=graph.nodes.find(n=>n.name===selected),heading=document.createElement('strong');heading.textContent=n.DisplayName;panel.append(heading,document.createTextNode(n.ShortText));for(const [label,items]of [['Uses',incoming.map(l=>l.source)],['Used by',outgoing.map(l=>l.target)]]){const row=document.createElement('div');row.textContent=label+': ';if(!items.length)row.append('No recorded connections');for(const id of items){const b=document.createElement('button');b.textContent=short(graph.nodes.find(n=>n.name===id));b.onclick=()=>select(id);row.append(b);}panel.append(row);}}else panel.textContent='Choose a node to inspect its premises and read the full passage.';
}
async function init(){try{const responses=await Promise.all(['graph','text'].map(name=>fetch(`data/${name}.json`)));if(responses.some(r=>!r.ok))throw Error('Data unavailable');const [g,text]=await Promise.all(responses.map(r=>r.json()));graph=g;graph.nodes.sort((a,b)=>(a.name.includes('D')?0:a.name.includes('A')?1:2)-(b.name.includes('D')?0:b.name.includes('A')?1:2)||a.name.localeCompare(b.name));
 const reader=$('reader');reader.replaceChildren();for(const s of text){const section=document.createElement('section');section.id=s.id;const n=graph.nodes.find(n=>n.name===s.id),h=document.createElement('h3');h.textContent=n?n.DisplayName.replace(/^I /,''): 'Appendix';section.append(h);if(n){const b=document.createElement('button');b.textContent='Locate in the map ↗';b.onclick=()=>select(s.id,false);section.append(b);}s.paragraphs.forEach((text,i)=>{const p=document.createElement('p');p.textContent=text;if(s.anchors?.[i])p.id=s.anchors[i];section.append(p);});reader.append(section);}
 for(const n of graph.nodes){const option=document.createElement('option');option.value=n.name;option.textContent=n.DisplayName;$('passage').append(option);}
 $('passage').addEventListener('change',e=>select(e.target.value));$('view').addEventListener('change',draw);$('reset').onclick=()=>{selected=null;history.replaceState(null,'',location.pathname+location.search);document.querySelectorAll('.current').forEach(el=>el.classList.remove('current'));draw();};window.addEventListener('hashchange',()=>select(location.hash.slice(1)));draw();select(location.hash.slice(1)||'1P01');
 }catch(error){$('reader').textContent='The text could not be loaded. Serve this folder over HTTP, then reload.';$('selection').textContent=error.message;}}
init();
