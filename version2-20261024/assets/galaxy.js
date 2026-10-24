(()=>{'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)],TAU=Math.PI*2;
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let paused=preference.matches,clock=0,last=0,task='distance',taskStart=0,drawn=false;
try{if(sessionStorage.getItem('v2-motion')==='paused')paused=true;}catch{}
function motionUI(){document.body.classList.toggle('motion-paused',paused);$('#motion').textContent=paused?'Resume motion':'Pause motion';$('#motion').setAttribute('aria-pressed',String(paused));}
motionUI();$('#motion').addEventListener('click',()=>{paused=!paused;motionUI();try{sessionStorage.setItem('v2-motion',paused?'paused':'playing');}catch{}});
let systemReduced=preference.matches,lastMediaCheck=0;preference.addEventListener('change',e=>{systemReduced=e.matches;paused=e.matches;drawn=false;motionUI();});

// A fine, short-lived silver-blue wake; decoration never intercepts input.
const trail=document.createElement('canvas');trail.id='cursor-trail';trail.setAttribute('aria-hidden','true');document.body.append(trail);
const trailCtx=trail.getContext('2d'),finePointer=matchMedia('(pointer:fine)');let dust=[],trailPath=[],trailDpr=1,trailLast=0,previousMouse=null;
function sizeTrail(){trailDpr=Math.min(devicePixelRatio||1,2);trail.width=innerWidth*trailDpr;trail.height=innerHeight*trailDpr;trailCtx.setTransform(trailDpr,0,0,trailDpr,0,0);dust=[];trailPath=[];}
sizeTrail();addEventListener('resize',sizeTrail);
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!finePointer.matches||paused||preference.matches)return;const now=performance.now();if(now-trailLast<12)return;trailLast=now;const old=previousMouse||{x:e.clientX,y:e.clientY},dx=e.clientX-old.x,dy=e.clientY-old.y,distance=Math.hypot(dx,dy);if(distance>160){trailPath=[];previousMouse={x:e.clientX,y:e.clientY};return;}trailPath.push({x:e.clientX,y:e.clientY,born:now});if(trailPath.length>28)trailPath.shift();const count=Math.min(6,Math.max(1,Math.floor(distance/8))),nx=-dy/Math.max(1,distance),ny=dx/Math.max(1,distance);for(let i=0;i<count;i++){const f=Math.random(),spread=(Math.random()-.5)*4;dust.push({x:old.x+dx*f+nx*spread,y:old.y+dy*f+ny*spread,born:now,life:380+Math.random()*230,r:.3+Math.random()*.85,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5,tint:Math.random()>.16?'190,214,239':'224,216,232',glint:Math.random()>.92});}previousMouse={x:e.clientX,y:e.clientY};if(dust.length>110)dust.splice(0,dust.length-110);},{passive:true});
document.addEventListener('pointerout',e=>{if(!e.relatedTarget)previousMouse=null;});addEventListener('blur',()=>{dust=[];trailPath=[];previousMouse=null;});
function paintTrail(now){trailCtx.clearRect(0,0,innerWidth,innerHeight);if(paused||preference.matches||!finePointer.matches){dust=[];trailPath=[];previousMouse=null;return;}dust=dust.filter(p=>now-p.born<p.life);trailPath=trailPath.filter(p=>now-p.born<350);trailCtx.save();trailCtx.globalCompositeOperation='screen';trailCtx.lineCap='round';for(let i=1;i<trailPath.length;i++){const a=trailPath[i-1],b=trailPath[i],fade=(1-(now-a.born)/350)**2;trailCtx.strokeStyle=`rgba(157,188,224,${fade*.10})`;trailCtx.lineWidth=3;trailCtx.shadowColor='#a4c5e9';trailCtx.shadowBlur=4;trailCtx.beginPath();trailCtx.moveTo(a.x,a.y);trailCtx.lineTo(b.x,b.y);trailCtx.stroke();trailCtx.shadowBlur=0;trailCtx.strokeStyle=`rgba(221,234,248,${fade*.20})`;trailCtx.lineWidth=.55;trailCtx.stroke();}for(const p of dust){const age=(now-p.born)/p.life,life=(1-age)**1.7,x=p.x+p.vx*age,y=p.y+p.vy*age;trailCtx.fillStyle=trailCtx.strokeStyle=`rgba(${p.tint},${life*.62})`;const r=p.r*(.55+.45*life);if(p.glint){trailCtx.shadowColor='#cddfed';trailCtx.shadowBlur=5;trailCtx.lineWidth=.5;trailCtx.beginPath();trailCtx.moveTo(x-r*2,y);trailCtx.lineTo(x+r*2,y);trailCtx.moveTo(x,y-r*1.5);trailCtx.lineTo(x,y+r*1.5);trailCtx.stroke();}else{trailCtx.shadowBlur=0;trailCtx.beginPath();trailCtx.ellipse(x,y,r,r*.7,age*1.2,0,TAU);trailCtx.fill();}}trailCtx.restore();}

let launching=false;
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download'))return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||!url.pathname.endsWith('.html')||url.href===location.href)return;if(paused||preference.matches)return;e.preventDefault();if(launching)return;launching=true;$('#launch').classList.add('active');setTimeout(()=>location.assign(url.href),780);});
addEventListener('pageshow',()=>{launching=false;$('#launch').classList.remove('active');last=0;});
const stars=$('#galaxy'),ctx=stars.getContext('2d');let w=0,h=0,dpr=1,starfield=[],protectedRects=[];
let pointer={x:0,y:0};
function protectContent(){drawn=false;protectedRects=all('.console-rail,.dash-panel,.dash-heading,.dash-stats,header .brand,header nav,header button,.hero-copy,.portrait,.page-heading,.mission,.demo-layout,.content-page,.next-mission,.breadcrumbs,footer').map(e=>e.getBoundingClientRect()).filter(r=>r.bottom>0&&r.top<h).map(r=>({x:r.x-12,y:r.y-10,width:r.width+24,height:r.height+20}));}
function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);stars.width=w*dpr;stars.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);starfield=Array.from({length:Math.min(350,Math.floor(w*h/3300))},(_,i)=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.3+.3,phase:i*2.4,speed:.6+Math.random()}));protectContent();}
resize();addEventListener('resize',resize);addEventListener('scroll',protectContent,{passive:true});document.fonts?.ready.then(protectContent);all('img').forEach(i=>i.addEventListener('load',protectContent));
addEventListener('pointermove',e=>{pointer={x:e.clientX/w-.5,y:e.clientY/h-.5};},{passive:true});
function galaxy(t){window.portfolioGalaxyFrame?.(t);ctx.clearRect(0,0,w,h);
const band=ctx.createLinearGradient(0,h*.85,w,h*.05);band.addColorStop(0,'#121c4100');band.addColorStop(.35,'#25436b14');band.addColorStop(.55,'#9266d243');band.addColorStop(.72,'#25436b12');band.addColorStop(1,'#121c4100');ctx.fillStyle=band;ctx.fillRect(0,0,w,h);
for(const s of starfield){const x=(s.x+t*s.speed*1.8)%w,y=(s.y+t*s.speed*.5)%h;ctx.globalAlpha=.25+.5*(.5+.5*Math.sin(t*.5+s.phase));ctx.fillStyle=s.phase%3<1?'#a6c9ff':'#e0ddff';ctx.beginPath();ctx.arc(x+pointer.x*4,y+pointer.y*4,s.r,0,TAU);ctx.fill();}ctx.globalAlpha=1;
// Bright objects are clipped around content; they never cross text, photos or cards.
ctx.save();for(const r of protectedRects){ctx.beginPath();ctx.rect(0,0,w,h);ctx.rect(r.x,r.y,r.width,r.height);ctx.clip('evenodd');}
for(let i=0;i<3;i++){
 const duration=1.35+i*.28,phase=((t+i*4.7)%(13.9+i*1.7))/duration;if(phase>=1)continue;
 const p=phase**1.08,fade=Math.min(1,phase*7)*(1-smoothMeteor(.72,1,phase));
 const x=-100+p*(w+370),y=i===0?80+p*33:h*(.16+i*.23)+p*(100+i*20);
 const angle=.20+i*.085,length=Math.min(340,w*.3+95)*(1-i*.08);
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalCompositeOperation='screen';ctx.globalAlpha=fade;ctx.lineCap='round';
 // Diffuse luminous envelope, a tapering filament and a fine ivory-white core.
 const outer=ctx.createLinearGradient(-length,0,0,0);outer.addColorStop(0,'#a2bce900');outer.addColorStop(.35,'#98b7de08');outer.addColorStop(.78,'#bfd3ec35');outer.addColorStop(1,'#e6efff75');
 ctx.strokeStyle=outer;ctx.lineWidth=3.2;ctx.shadowColor='#c2d4e9';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(-length,0);ctx.quadraticCurveTo(-length*.4,1.2,0,0);ctx.stroke();ctx.shadowBlur=0;
 const filament=ctx.createLinearGradient(-length,0,0,0);filament.addColorStop(0,'#bdc7e900');filament.addColorStop(.42,'#b4c4de18');filament.addColorStop(.83,'#d3e0f29c');filament.addColorStop(1,'#fff1dce8');
 ctx.fillStyle=filament;ctx.beginPath();ctx.moveTo(-length,0);ctx.quadraticCurveTo(-length*.35,-1.45,0,-.48);ctx.lineTo(0,.48);ctx.quadraticCurveTo(-length*.38,2,-length,0);ctx.fill();
 ctx.strokeStyle=filament;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(-length*.77,0);ctx.lineTo(0,0);ctx.stroke();
 const head=ctx.createRadialGradient(0,0,0,0,0,6);head.addColorStop(0,'#fffaf0b0');head.addColorStop(.18,'#e9f0ff70');head.addColorStop(1,'#b5c9e800');ctx.fillStyle=head;ctx.beginPath();ctx.arc(0,0,6,0,TAU);ctx.fill();
 ctx.fillStyle='#fffaf1';ctx.beginPath();ctx.ellipse(0,0,1.05,.65,0,0,TAU);ctx.fill();
 for(let j=0;j<9;j++){const seed=Math.abs(Math.sin(i*19.31+j*7.17)*43758.5453)%1,back=12+seed*length*.8;ctx.globalAlpha=fade*.17*(1-back/length)**1.6;ctx.fillStyle=j%3?'#cbd9ec':'#e5d9ce';ctx.beginPath();ctx.arc(-back,Math.sin(j*4.2+i+phase*3)*(1+seed*2.5),.18+seed*.30,0,TAU);ctx.fill();}
 ctx.restore();
}ctx.restore();}
function smoothMeteor(a,b,x){const f=Math.max(0,Math.min(1,(x-a)/(b-a)));return f*f*(3-2*f);}



const roverImage=new Image();roverImage.onload=()=>{drawn=false;};roverImage.src='assets/rover-cinematic.webp?v=20261025-hd2';
function carSprite(g,x,y,a=0,scale=1,glow=true){g.save();g.translate(x,y);g.rotate(a);g.scale(scale,scale);if(roverImage.complete&&roverImage.naturalWidth){g.shadowColor='#020813a0';g.shadowBlur=6;g.shadowOffsetY=3;g.drawImage(roverImage,123,40,394,257,-49,-32,98,64);g.shadowBlur=0;g.shadowOffsetY=0;}else{g.fillStyle='#738e9d';g.beginPath();g.roundRect(-37,-23,74,46,8);g.fill();g.fillStyle='#0a1521';for(const xx of[-25,18])for(const yy of[-29,22])g.fillRect(xx,yy,15,8);g.fillStyle='#243a4b';g.fillRect(-17,-15,34,30);}g.restore();}

const cards=all('.card-animation');
function industryArt(g,t){
 const W=600,H=240;
 const halo=g.createRadialGradient(320,140,10,320,140,270);halo.addColorStop(0,'#74b3cb15');halo.addColorStop(1,'#74b3cb00');g.fillStyle=halo;g.fillRect(0,0,W,H);
 // Station canopy, overhead lines and layered platform.
 g.strokeStyle='#7894a82c';g.lineWidth=1;g.beginPath();g.moveTo(25,57);g.lineTo(530,57);g.lineTo(570,80);g.lineTo(60,80);g.closePath();g.stroke();
 for(const x of [65,290,515]){g.fillStyle='#243a4b';g.fillRect(x,81,4,105);g.fillStyle='#547181';g.fillRect(x,81,1,105);}
 g.fillStyle='#172c3d';g.beginPath();g.moveTo(25,186);g.lineTo(550,186);g.lineTo(580,208);g.lineTo(53,208);g.closePath();g.fill();
 g.strokeStyle='#6d899b70';g.beginPath();g.moveTo(25,186);g.lineTo(550,186);g.moveTo(53,208);g.lineTo(580,208);g.stroke();
 g.strokeStyle='#cbb78c80';g.setLineDash([4,6]);g.beginPath();g.moveTo(40,192);g.lineTo(558,192);g.stroke();g.setLineDash([]);
 const tx=32+Math.sin(t*.38)*22;g.save();g.translate(tx,0);
 for(let n=0;n<2;n++){const x=65+n*199;const skin=g.createLinearGradient(0,108,0,179);skin.addColorStop(0,'#d2dfe5');skin.addColorStop(.2,'#879fac');skin.addColorStop(.55,'#b5c8d0');skin.addColorStop(1,'#435e70');g.fillStyle=skin;g.strokeStyle='#c0d6df80';g.lineWidth=1;g.beginPath();g.roundRect(x,111,193,65,n===1?[5,22,10,4]:[12,4,4,8]);g.fill();g.stroke();
 g.fillStyle='#132736';g.beginPath();g.roundRect(x+8,121,177,24,4);g.fill();
 const glass=g.createLinearGradient(x,120,x+150,150);glass.addColorStop(0,'#234455');glass.addColorStop(.5,'#426d7b');glass.addColorStop(1,'#152e40');g.fillStyle=glass;
 for(let i=0;i<6;i++){g.fillRect(x+12+i*28,124,23,16);g.fillStyle='#d0e7e322';g.fillRect(x+13+i*28,125,20,1);g.fillStyle=glass;}
 g.fillStyle='#5db8ad';g.fillRect(x+3,149,187,4);g.fillStyle='#d3e6e377';g.fillRect(x+3,154,187,1);
 for(const dx of [53,112]){g.strokeStyle='#456170';g.strokeRect(x+dx,119,20,48);g.fillStyle='#243e4d';g.fillRect(x+dx+3,123,14,20);g.fillStyle='#c2d4d9';g.fillRect(x+dx+15,148,2,6);}
 g.fillStyle='#233948';for(const dx of [27,151]){g.beginPath();g.roundRect(x+dx-12,170,30,10,4);g.fill();for(const d of [0,16]){g.fillStyle='#0a1520';g.beginPath();g.arc(x+dx+d,180,6,0,TAU);g.fill();g.fillStyle='#657b87';g.beginPath();g.arc(x+dx+d,180,2.5,0,TAU);g.fill();}}
 if(n===1){g.fillStyle='#dbf7e9';g.fillRect(x+183,150,6,3);g.fillStyle='#b0e0d745';g.fillRect(x+181,148,9,7);}}
 g.restore();
 // Platform signal cabinet and sequenced indicators.
 const cabinet=g.createLinearGradient(524,108,549,170);cabinet.addColorStop(0,'#617a87');cabinet.addColorStop(1,'#233d4e');g.fillStyle=cabinet;g.beginPath();g.roundRect(524,108,25,65,3);g.fill();g.fillStyle='#0c2030';g.fillRect(528,114,17,22);g.fillStyle='#91dac9';g.fillRect(531,119,11,2);g.fillRect(531,125,8,2);g.fillStyle=Math.sin(t*2)>0?'#9de5cf':'#547e7a';g.beginPath();g.arc(536,146,2,0,TAU);g.fill();g.strokeStyle='#708d9c';for(let i=0;i<3;i++){g.beginPath();g.moveTo(530,155+i*4);g.lineTo(543,155+i*4);g.stroke();}
}
function toolkitArt(g,t){
 const pcb=g.createLinearGradient(125,30,460,210);pcb.addColorStop(0,'#203e49');pcb.addColorStop(.6,'#102a39');pcb.addColorStop(1,'#294453');
 g.fillStyle='#030b1566';g.beginPath();g.roundRect(132,45,340,170,16);g.fill();g.fillStyle=pcb;g.strokeStyle='#9cbac44d';g.lineWidth=1;g.beginPath();g.roundRect(125,31,340,170,14);g.fill();g.stroke();
 for(const [x,y] of [[138,44],[452,44],[138,188],[452,188]]){g.strokeStyle='#7b9aa8';g.beginPath();g.arc(x,y,3,0,TAU);g.stroke();}
 // Routed copper traces and moving data pulses.
 const routes=[[[148,82],[206,82],[226,102],[264,102]],[[148,155],[212,155],[235,132],[264,132]],[[336,94],[369,94],[390,65],[444,65]],[[336,137],[375,137],[395,163],[443,163]],[[280,72],[280,51],[211,51]],[[313,156],[313,181],[365,181]]];
 routes.forEach((pts,i)=>{g.strokeStyle=i%2?'#bba57b66':'#7bb8b577';g.lineWidth=1.3;g.beginPath();pts.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.stroke();const f=(t*.35+i*.17)%1,segment=Math.min(pts.length-2,Math.floor(f*(pts.length-1))),q=f*(pts.length-1)-segment,a=pts[segment],b=pts[segment+1];g.fillStyle=i%2?'#c8b793':'#b6edda';g.beginPath();g.arc(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,2,0,TAU);g.fill();});
 g.fillStyle='#9d987f';for(let i=0;i<10;i++){const v=267+i*7;g.fillRect(v,66,3,10);g.fillRect(v,155,3,10);g.fillRect(252,80+i*7,10,3);g.fillRect(337,80+i*7,10,3);}
 const chip=g.createLinearGradient(258,73,343,157);chip.addColorStop(0,'#607782');chip.addColorStop(.18,'#273d4b');chip.addColorStop(.6,'#101f2d');chip.addColorStop(1,'#425968');g.fillStyle=chip;g.strokeStyle='#a6c0c078';g.beginPath();g.roundRect(261,75,76,80,6);g.fill();g.stroke();g.strokeStyle='#6c8d9b66';g.strokeRect(269,83,60,64);g.font='500 17px system-ui';g.textAlign='center';g.fillStyle='#c8ddd9';g.fillText('</>',299,116);g.font='8px system-ui';g.fillStyle='#94adb8';g.fillText('HARDWARE + CODE',299,133);g.textAlign='left';
 for(const [x,y] of [[160,109],[398,101],[184,174],[403,177],[350,46]]){g.fillStyle='#a7b3ae';g.fillRect(x,y,18,8);g.fillStyle='#263e4a';g.fillRect(x+3,y,12,8);}
 g.fillStyle='#98a48d';for(let i=0;i<8;i++)g.fillRect(151+i*9,35,4,10);
}
function cardArt(t){for(const canvas of cards){const g=canvas.getContext('2d'),W=600,H=240,d=Math.min(3,Math.max(1,canvas.getBoundingClientRect().width*(devicePixelRatio||1)/W)),bw=Math.round(W*d),bh=Math.round(H*d);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}g.setTransform(bw/W,0,0,bh/H,0,0);g.clearRect(0,0,W,H);if(canvas.dataset.scene==='car'){g.beginPath();g.ellipse(300,120,222,70,0,0,TAU);g.strokeStyle='#273854';g.lineWidth=30;g.stroke();g.strokeStyle='#89eadc50';g.lineWidth=1;g.setLineDash([9,9]);g.stroke();g.setLineDash([]);const a=t*.6;carSprite(g,300+222*Math.cos(a),120+70*Math.sin(a),Math.atan2(70*Math.cos(a),-222*Math.sin(a)),.88);g.fillStyle='#728ba8';g.font='11px system-ui';g.textAlign='center';g.fillText('ENCODER → CONTROLLER → MOTOR',300,124);g.textAlign='left';
}else if(canvas.dataset.scene==='industry')industryArt(g,t);else toolkitArt(g,t);}}

const car=$('#car'),c=car?.getContext('2d'),remoteDialog=$('#remote-dialog');let remote={x:220,y:260,a:0},keys=new Set(),remoteDistance=0,remoteTrail=[],carWorldHeight=520;
const labels={distance:'Fixed-distance drive',line:'Line following',remote:'Remote control',vision:'Vision-only concept'};
const descriptions={distance:'Travel a set distance, decelerate and stop at the target. The sequence then restarts.',line:'Follow a curved centre line. The animation highlights the path and the sensor feedback concept.',remote:'You are in control. Use arrow keys / W A S D or hold the buttons below. Steering and motion respond to your commands.',vision:'Proposed camera-only scenario: stop at a red light, continue on green, then follow the right-turn sign. This is a scripted concept, not an operating vision model.'};
const taskCopy={"distance": {"kicker": "TASK 01 / DISTANCE & FEEDBACK", "title": "Set a distance. Stop on target.", "intro": "Wheel-encoder feedback connects motor rotation to a fixed-distance movement, bringing the drive circuit and control logic together.", "tags": ["Encoder feedback", "Motor control", "Target distance"], "sections": [["Work completed", "Built and tested an H-bridge motor driver, then used wheel-encoder feedback for fixed-distance movement, square-path driving and in-place rotation."], ["Engineering focus", "Integrated circuit assembly, programming and vehicle testing. Encoder feedback provides the distance information used by the movement logic."]], "boundary": "The animation illustrates the movement sequence. It uses a scripted trajectory and does not report measured stopping accuracy or a physical encoder loop."}, "line": {"kicker": "TASK 02 / LINE FOLLOWING", "title": "Read the line. Follow the curve.", "intro": "Two-sensor and eight-channel line tracking brought sensing and feedback control together, with PID tuning to improve behaviour through curves.", "tags": ["Line sensors", "PID control", "Path correction"], "sections": [["Work completed", "Implemented two-sensor and eight-channel line tracking and tested the integrated car platform."], ["Problem addressed", "Tuned PID parameters to reduce oscillation, cornering overshoot and track deviation, focusing on how the car responds when the track changes direction."]], "boundary": "The browser car follows a predefined path to illustrate the task. It does not execute the vehicle’s PID controller or measure tracking error."}, "remote": {"kicker": "TASK 03 / REMOTE CONTROL", "title": "Your command. The car responds.", "intro": "A manual-control interface connects directional commands to vehicle motion, with visible command feedback and wireless-control graphics.", "tags": ["Wi-Fi / Bluetooth concept", "Manual commands", "Keyboard & touch"], "sections": [["Control integration", "Keyboard and on-screen commands are mapped to forward/reverse movement and steering. Command status, pressed-button feedback, stop and reset are integrated in one driving station."], ["Project context", "The car project brings together motor driving, programming and peripheral communication through I²C and UART. This interactive module makes the command-to-motion relationship visible."]], "boundary": "This is an interactive browser vehicle. Wi-Fi and Bluetooth graphics represent a control concept; no physical vehicle or wireless hardware link is connected."}, "vision": {"kicker": "TASK 04 / VISION-ONLY PROPOSAL", "title": "See the signal. Choose the next move.", "intro": "Camera-based visual processing extends the car project toward interpreting its surroundings. The traffic scene explores a proposed next step: responding to lights and signs.", "tags": ["Camera-only concept", "Traffic lights", "Road-sign interpretation"], "sections": [["Work completed", "Extended the platform with camera-based visual processing and tested the integrated system."], ["Proposed extension", "Use a camera to identify red/green light states and a right-turn sign, then translate those observations into stop, proceed and turning decisions. The full traffic scenario remains a proposal."]], "boundary": "The scene uses scripted events to explain the proposal. There is no live camera input or running traffic-light/sign recognition model, and the complete traffic scenario is not presented as a verified implementation."}};
function renderTaskInfo(name){const info=taskCopy[name];if(!info||!$('#task-info'))return;$('#task-kicker').textContent=info.kicker;$('#task-title').textContent=info.title;$('#task-intro').textContent=info.intro;$('#task-boundary-copy').textContent=info.boundary;$('#task-tags').replaceChildren(...info.tags.map(t=>{const el=document.createElement('li');el.textContent=t;return el;}));$('#task-sections').replaceChildren(...info.sections.map(([title,body])=>{const section=document.createElement('section');section.className='task-explanation';const h=document.createElement('h4'),p=document.createElement('p');h.textContent=title;p.textContent=body;section.append(h,p);return section;}));}

let lastStatus='';
function reportCar(message){if(message!==lastStatus){$('#car-state').textContent=message;lastStatus=message;}}
function linePosition(p){const a=p*TAU;return{x:450+300*Math.cos(a),y:260+135*Math.sin(a*2),a:Math.atan2(270*Math.cos(a*2),-300*Math.sin(a))};}
function route(g,mode){g.beginPath();if(mode==='line'){for(let i=0;i<=200;i++){const p=linePosition(i/200);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);}}else if(mode==='vision'){g.moveTo(100,260);g.lineTo(520,260);g.quadraticCurveTo(590,260,590,330);g.lineTo(590,415);}else if(mode==='distance'){g.moveTo(160,260);g.lineTo(740,260);}else{g.roundRect(100,100,700,320,25);}}
function road(g,mode){
 const floor=g.createLinearGradient(0,60,900,460);floor.addColorStop(0,'#101f2c');floor.addColorStop(1,'#0a1420');g.fillStyle=floor;g.beginPath();g.roundRect(45,70,810,370,22);g.fill();
 g.strokeStyle='#7793a51c';g.lineWidth=1;g.stroke();
 g.save();g.beginPath();g.roundRect(45,70,810,370,22);g.clip();
 for(let x=65;x<850;x+=24){g.strokeStyle='#a8c9d108';g.beginPath();g.moveTo(x,70);g.lineTo(x,440);g.stroke();}
 for(let y=88;y<440;y+=24){g.beginPath();g.moveTo(45,y);g.lineTo(855,y);g.stroke();}g.restore();
 route(g,mode);g.lineJoin='round';g.lineCap='round';g.strokeStyle='#020813';g.lineWidth=78;g.shadowColor='#0009';g.shadowBlur=10;g.shadowOffsetY=4;g.stroke();g.shadowBlur=0;g.shadowOffsetY=0;
 route(g,mode);g.strokeStyle='#465765';g.lineWidth=72;g.stroke();
 route(g,mode);g.strokeStyle='#172a39';g.lineWidth=65;g.stroke();
 const asphalt=g.createLinearGradient(0,150,0,400);asphalt.addColorStop(0,'#263a49');asphalt.addColorStop(.55,'#1a2b39');asphalt.addColorStop(1,'#233544');
 route(g,mode);g.strokeStyle=asphalt;g.lineWidth=58;g.stroke();
 route(g,mode);g.lineWidth=mode==='line'?2:1.5;g.strokeStyle=mode==='line'?'#9fdfd0':'#bdcbd375';g.setLineDash(mode==='line'?[]:[10,14]);g.stroke();g.setLineDash([]);g.lineCap='butt';
 // Inlaid survey marks frame the test surface without competing with the route.
 g.strokeStyle='#8db2bd66';g.lineWidth=1;for(const [x,y,sx,sy] of [[58,83,1,1],[842,83,-1,1],[58,427,1,-1],[842,427,-1,-1]]){g.beginPath();g.moveTo(x+17*sx,y);g.lineTo(x,y);g.lineTo(x,y+17*sy);g.stroke();}
 g.font='12px system-ui';g.fillStyle='#90a9bb';g.fillText(mode==='line'?'02 / TRACK CIRCUIT':mode==='vision'?'04 / VISION TEST ROUTE':'01 / DISTANCE TEST LANE',68,105);
}
function drawCar(t,dt){const slot=$('#remote-canvas-slot');const targetHeight=task==='remote'&&remoteDialog?.open?Math.max(320,Math.round(slot.clientHeight/Math.max(1,slot.clientWidth)*900)):520;carWorldHeight=targetHeight;const displayWidth=car.getBoundingClientRect().width;const resolution=Math.min(4,Math.max(1,displayWidth*(window.devicePixelRatio||1)/900));const pixelWidth=Math.round(900*resolution),pixelHeight=Math.round(carWorldHeight*resolution);if(car.width!==pixelWidth||car.height!==pixelHeight){car.width=pixelWidth;car.height=pixelHeight;}c.setTransform(pixelWidth/900,0,0,pixelHeight/carWorldHeight,0,0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';const elapsed=t-taskStart,p=(elapsed%12)/12;c.clearRect(0,0,900,carWorldHeight);c.fillStyle='#a6b3cf18';for(let x=20;x<900;x+=30)for(let y=20;y<carWorldHeight;y+=30)c.fillRect(x,y,1,1);if(task==='remote')remoteArena(c,t);else road(c,task);let pos,progress=0;
c.font='14px Arial';c.fillStyle='#97b3ce';if(task!=='remote')c.fillText('SENSE  →  CONTROL  →  MOTION',26,40);
if(task==='distance'){const f=Math.min(elapsed%10/6,1),ease=1-(1-f)**2;pos={x:160+580*ease,y:260,a:0};progress=ease;reportCar(f<1?'DRIVING TO TARGET':'TARGET REACHED · STOPPED');c.strokeStyle='#b29cff';c.lineWidth=2;c.beginPath();c.moveTo(740,210);c.lineTo(740,310);c.stroke();c.fillStyle='#b29cff';c.fillText('TARGET',717,190);c.fillStyle='#a5bed3';c.fillText('START',140,320);c.setLineDash([3,5]);c.strokeStyle='#6c8ea7';c.beginPath();c.moveTo(160,350);c.lineTo(740,350);c.stroke();c.setLineDash([]);c.fillText('PRESET TRAVEL DISTANCE',355,375);
}else if(task==='line'){pos=linePosition(p);progress=p;reportCar('FOLLOWING CENTRE LINE');
}else if(task==='remote'){const turn=(keys.has('right')?1:0)-(keys.has('left')?1:0),drive=(keys.has('up')?1:0)-(keys.has('down')?1:0);remote.a+=turn*dt*2;const speed=drive*120;remote.x=Math.max(75,Math.min(825,remote.x+Math.cos(remote.a)*speed*dt));remote.y=Math.max(85,Math.min(carWorldHeight-85,remote.y+Math.sin(remote.a)*speed*dt));remoteDistance+=Math.abs(speed*dt);if(drive&&dt>0){remoteTrail.push({x:remote.x,y:remote.y});if(remoteTrail.length>180)remoteTrail.shift();}pos=remote;const active=drive||turn;remoteDialog?.classList.toggle('transmitting',!!active);if($('#remote-command'))$('#remote-command').textContent=drive>0?'Forward command → moving':drive<0?'Reverse command → moving':turn<0?'Steering left':turn>0?'Steering right':'Ready — hold ↑ to drive';if($('#remote-travel'))$('#remote-travel').textContent=Math.round(remoteDistance/10)+' units · simulated travel';all('[data-drive]').forEach(b=>b.classList.toggle('pressed',keys.has(b.dataset.drive)));reportCar(drive?'REMOTE COMMAND · MOVING':turn?'REMOTE COMMAND · STEERING':'AWAITING YOUR COMMAND');
}else{const q=elapsed%20;let red=q<7;let phase='';if(q<4){pos={x:100+q*40,y:260,a:0};phase='CAMERA · APPROACH SIGNAL';progress=q/20;}else if(q<7){pos={x:260,y:260,a:0};phase='RED LIGHT · STOP';progress=.2;}else if(q<13){pos={x:260+(q-7)*43.333,y:260,a:0};phase='GREEN LIGHT · CONTINUE';progress=.2+(q-7)*.08;}else if(q<16){const a=(q-13)/3*Math.PI/2;pos={x:520+70*Math.sin(a),y:330-70*Math.cos(a),a};phase='SIGN DETECTED · TURN RIGHT';progress=.68+(q-13)*.08;}else{pos={x:590,y:330+Math.min(q-16,2)*42.5,a:Math.PI/2};phase=q<18?'FOLLOW ROUTE':'ROUTE COMPLETE';progress=Math.min(1,.92+(q-16)*.04);}reportCar(phase);
// Signal and sign are intentionally clear enough to understand without reading telemetry.
c.fillStyle='#080e1b';c.strokeStyle='#6e829c';c.lineWidth=2;c.beginPath();c.roundRect(290,105,35,90,8);c.fill();c.stroke();for(let i=0;i<3;i++){c.fillStyle=(i===0&&red)?'#ff697d':(i===2&&!red)?'#89eadc':'#263245';c.shadowColor=c.fillStyle;c.shadowBlur=((i===0&&red)||(i===2&&!red))?15:0;c.beginPath();c.arc(307,121+i*28,9,0,TAU);c.fill();}c.shadowBlur=0;c.fillStyle='#92a2bb';c.fillRect(304,195,6,30);c.fillStyle='#e8eaf5';c.fillRect(300,226,5,68);c.fillStyle='#143e69';c.strokeStyle='#81c4ff';c.beginPath();c.roundRect(525,130,58,58,6);c.fill();c.stroke();c.fillStyle='#e9f6ff';c.font='34px Arial';c.fillText('↱',539,170);c.font='12px Arial';c.fillStyle='#a8bdd4';c.fillText('RIGHT TURN',524,207);c.strokeStyle='#8adfff35';c.setLineDash([6,5]);c.beginPath();c.moveTo(pos.x+25*Math.cos(pos.a),pos.y+25*Math.sin(pos.a));c.lineTo(307,150);c.lineTo(554,159);c.stroke();c.setLineDash([]);}
if(task==='remote')wirelessLink(c,t,pos);carSprite(c,pos.x,pos.y,pos.a,task==='remote'?1.2:1);c.fillStyle='#8296b0';c.font='13px Arial';if(task!=='remote')c.fillText(task==='vision'?'SCRIPTED VISION-ONLY PROPOSAL / CAMERA CONCEPT':'INTERACTIVE ANIMATION / NOT LIVE VEHICLE TELEMETRY',26,carWorldHeight-29);$('#car-progress').textContent=task==='remote'?'Manual':Math.round(progress*100)+'%';}

function remoteArena(g,t){
 const H=carWorldHeight;remote.y=Math.min(remote.y,H-85);
 const metal=g.createLinearGradient(65,70,835,H-75);metal.addColorStop(0,'#587081');metal.addColorStop(.25,'#263d50');metal.addColorStop(.7,'#172c3d');metal.addColorStop(1,'#5b7583');
 g.fillStyle=metal;g.beginPath();g.roundRect(65,70,770,H-145,24);g.fill();
 const floor=g.createLinearGradient(0,72,0,H-77);floor.addColorStop(0,'#162936');floor.addColorStop(.55,'#0d1d2b');floor.addColorStop(1,'#132632');g.fillStyle=floor;g.beginPath();g.roundRect(68,73,764,H-151,21);g.fill();
 g.save();g.beginPath();g.roundRect(70,75,760,H-155,20);g.clip();
 for(let x=95;x<835;x+=25){g.strokeStyle=(x-95)%100===0?'#9ab9ca15':'#9ab9ca08';g.lineWidth=1;g.beginPath();g.moveTo(x,75);g.lineTo(x,H-75);g.stroke();}
 for(let y=95;y<H-75;y+=25){g.strokeStyle=(y-95)%100===0?'#9ab9ca15':'#9ab9ca08';g.beginPath();g.moveTo(70,y);g.lineTo(830,y);g.stroke();}
 g.strokeStyle='#91b8c638';g.setLineDash([9,7]);g.strokeRect(95,100,710,H-205);g.setLineDash([]);
 // Recessed loading bay with brushed floor, edge lighting and wheel guides.
 const bayY=H-225,bay=g.createLinearGradient(675,bayY,795,bayY+95);bay.addColorStop(0,'#324d5b');bay.addColorStop(1,'#142a37');g.fillStyle=bay;g.strokeStyle='#80b9bd75';g.beginPath();g.roundRect(675,bayY,120,95,9);g.fill();g.stroke();
 g.strokeStyle='#9cb8bd1a';for(let j=8;j<90;j+=7){g.beginPath();g.moveTo(683,bayY+j);g.lineTo(787,bayY+j);g.stroke();}
 g.strokeStyle='#98e5d3';g.lineWidth=2;for(const x of [686,784]){g.beginPath();g.moveTo(x,bayY+10);g.lineTo(x,bayY+26);g.moveTo(x,bayY+69);g.lineTo(x,bayY+85);g.stroke();}
 g.fillStyle='#c0dcd9';g.font='500 12px system-ui';g.textAlign='center';g.fillText('DOCK 01',735,bayY+47);g.font='10px system-ui';g.fillStyle='#88a7b8';g.fillText('PARKING BAY',735,bayY+64);g.textAlign='left';
 g.strokeStyle='#7896a855';g.lineWidth=1;for(let x=120;x<670;x+=70){g.beginPath();g.moveTo(x,H-91);g.lineTo(x,H-86);g.stroke();}
 g.strokeStyle='#9ee5d099';g.lineWidth=1;for(const [x,y,sx,sy] of [[81,86,1,1],[819,86,-1,1],[81,H-91,1,-1],[819,H-91,-1,-1]]){g.beginPath();g.moveTo(x+15*sx,y);g.lineTo(x,y);g.lineTo(x,y+15*sy);g.stroke();}
 g.restore();
 g.lineCap='round';g.strokeStyle='#89d9cc16';g.lineWidth=8;g.beginPath();remoteTrail.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.strokeStyle='#a9e7da70';g.lineWidth=1.4;g.stroke();g.lineCap='butt';
}
function wirelessLink(g,t,pos){
 const x=135,y=145;g.save();g.strokeStyle='#8cebdc';g.lineWidth=2.4;
 for(let i=0;i<3;i++){g.globalAlpha=.35+.5*((t*.7+i*.25)%1);g.beginPath();g.arc(x,y,12+i*10,-2.5,-.64);g.stroke();}g.globalAlpha=1;g.fillStyle='#89eadc';g.beginPath();g.arc(x,y,3,0,TAU);g.fill();
 
 g.strokeStyle='#89eadc28';g.lineWidth=1;g.setLineDash([5,8]);g.beginPath();g.moveTo(x+12,y+12);g.lineTo(pos.x,pos.y);g.stroke();g.setLineDash([]);
 for(let i=0;i<4;i++){const a=(t*.55+i*.25)%1;g.fillStyle=keys.size?'#a2fff0':'#6a9baf';g.beginPath();g.arc(x+(pos.x-x)*a,y+(pos.y-y)*a,keys.size?3.2:2,0,TAU);g.fill();}
 g.translate(pos.x,pos.y-58);g.strokeStyle='#b29cff';g.lineWidth=2;g.beginPath();g.moveTo(-6,-8);g.lineTo(6,4);g.lineTo(0,11);g.lineTo(0,-14);g.lineTo(6,-7);g.lineTo(-6,5);g.stroke();g.restore();
}
function openRemote(){
 if(!remoteDialog||task!=='remote')return;keys.clear();const controls=$('#remote-controls');$('#remote-canvas-slot').append(car);$('#remote-controls-slot').append(controls);controls.hidden=false;$('#reopen-remote').hidden=true;
 if(!remoteDialog.open)remoteDialog.showModal();remoteDialog.append(trail);document.body.classList.add('remote-open');
 if(paused)drawCar(clock,0);requestAnimationFrame(()=>{controls.querySelector('[data-drive="up"]').focus({preventScroll:true});protectContent();});
}
function closeRemote(){if(remoteDialog?.open)remoteDialog.close();}
$('#reopen-remote')?.addEventListener('click',openRemote);$('#close-remote')?.addEventListener('click',closeRemote);
$('#remote-stop')?.addEventListener('click',()=>{keys.clear();drawCar(clock,0);});
remoteDialog?.addEventListener('close',()=>{document.body.append(trail);dust=[];trailPath=[];keys.clear();remoteDialog.classList.remove('transmitting');document.body.classList.remove('remote-open');$('#car-home').after(car);const controls=$('#remote-controls');controls.hidden=true;$('#task-description').after(controls);$('#reopen-remote').hidden=task!=='remote';drawCar(clock,0);$('[data-task="remote"]').focus({preventScroll:true});protectContent();});

all('[data-task]').forEach(b=>b.addEventListener('click',()=>{task=b.dataset.task;taskStart=clock;keys.clear();all('[data-task]').forEach(v=>{v.classList.toggle('active',v===b);v.setAttribute('aria-pressed',String(v===b));});$('#task-label').textContent=labels[task];$('#task-description').textContent=descriptions[task];renderTaskInfo(task);$('#remote-controls').hidden=true;$('#reopen-remote').hidden=true;$('#drive-mode').textContent=task==='remote'?'Manual demo':'Automatic demo';if(task==='remote')openRemote();reportCar(labels[task].toUpperCase());if(paused)drawCar(clock,0);protectContent();}));
const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};
addEventListener('keydown',e=>{if(task!=='remote'||!car||!remoteDialog?.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable||e.metaKey||e.ctrlKey||e.altKey)return;const k=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(k){e.preventDefault();keys.add(k);}});addEventListener('keyup',e=>{keys.delete(keyMap[e.key]||keyMap[e.key.toLowerCase()]);});addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;});
all('[data-drive]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.drive);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.drive));b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();keys.add(b.dataset.drive);}});b.addEventListener('keyup',()=>keys.delete(b.dataset.drive));});
$('#reset-car')?.addEventListener('click',()=>{remote={x:220,y:260,a:0};keys.clear();remoteDistance=0;remoteTrail=[];drawCar(clock,0);});

const ecg=$('#ecg'),ppg=$('#ppg'),art=$('#art');let recording=null,replayStart=0,replayOffset=0,lastNumeric=-1;
function fmt(sec){return Math.floor(sec/60).toString().padStart(2,'0')+':'+Math.floor(sec%60).toString().padStart(2,'0');}
if(ecg){window.loadVitalRecording().then(d=>{for(const name of ['SNUADC/ECG_II','SNUADC/PLETH','SNUADC/ART','Solar8000/HR','Solar8000/ART_SBP','Solar8000/ART_DBP'])if(!d.channels[name]?.values?.length)throw Error('Missing '+name);recording=d;replayStart=clock;$('#replay-status').textContent='CASE 1 · RECORDED REPLAY';protectContent();}).catch(()=>{$('#replay-status').textContent='Recording unavailable. Reload the page to retry.';});}
function numeric(name,time){const ch=recording.channels[name],i=Math.floor(time*ch.hz);for(let j=i;j>=Math.max(0,i-Math.floor(3*ch.hz));j--)if(Number.isFinite(ch.values[j]))return Math.round(ch.values[j]);return '—';}
function recordedWave(canvas,name,end,range,color){
 const g=canvas.getContext('2d'),W=800,H=Number(canvas.dataset.logicalHeight||canvas.getAttribute('height'));canvas.dataset.logicalHeight=H;
 const density=Math.min(4,Math.max(1,canvas.getBoundingClientRect().width*(devicePixelRatio||1)/W));const bw=Math.round(W*density),bh=Math.round(H*density);if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}g.setTransform(bw/W,0,0,bh/H,0,0);g.clearRect(0,0,W,H);
 const ch=recording.channels[name],span=8,start=end-span,left=47,top=12,bottom=H-24,plotW=W-left-15,plotH=bottom-top;
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0c1b29');bg.addColorStop(1,'#08131f');g.fillStyle=bg;g.fillRect(0,0,W,H);
 for(let i=0;i<=32;i++){const x=left+plotW*i/32;g.strokeStyle=i%4?'#86a4bc09':'#86a4bc1d';g.lineWidth=.7;g.beginPath();g.moveTo(x,top);g.lineTo(x,bottom);g.stroke();}
 for(let i=0;i<=8;i++){const y=top+plotH*i/8;g.strokeStyle=i%2?'#86a4bc09':'#86a4bc1d';g.beginPath();g.moveTo(left,y);g.lineTo(W-15,y);g.stroke();}
 g.font='11px system-ui';g.fillStyle='#8ea5b9';g.textAlign='right';for(let i=0;i<=2;i++){const val=range[1]-(range[1]-range[0])*i/2;g.fillText(Number(val.toFixed(1)).toString(),left-9,top+plotH*i/2+4);}g.textAlign='center';for(let i=0;i<=4;i++)g.fillText(i===4?'0 s':String(-8+i*2)+' s',left+plotW*i/4,H-7);g.textAlign='left';
 const trace=new Path2D();let drawing=false,previous=-1,lastY=null;
 g.save();g.beginPath();g.rect(left,top,plotW,plotH);g.clip();
 for(let x=0;x<=plotW;x++){const time=((start+x/plotW*span)%recording.durationSec+recording.durationSec)%recording.durationSec,idx=Math.min(ch.values.length-1,Math.floor(time*ch.hz)),v=ch.values[idx];if(idx<previous)drawing=false;previous=idx;if(!Number.isFinite(v)){drawing=false;lastY=null;continue;}const y=bottom-(v-range[0])/(range[1]-range[0])*plotH;drawing?trace.lineTo(left+x,y):trace.moveTo(left+x,y);drawing=true;lastY=y;}
 g.lineJoin='round';g.lineCap='round';g.strokeStyle=color+'16';g.lineWidth=6;g.stroke(trace);g.strokeStyle=color+'38';g.lineWidth=3;g.stroke(trace);g.strokeStyle=color;g.lineWidth=1.25;g.stroke(trace);
 if(lastY!==null){g.fillStyle='#e9f7ff';g.beginPath();g.arc(W-15,lastY,2,0,TAU);g.fill();}g.restore();
}
function drawWaves(t){if(!recording)return;const time=(replayOffset+t-replayStart)%recording.durationSec,end=time;recordedWave(ecg,'SNUADC/ECG_II',end,[-.6,1.4],'#89eadc');recordedWave(ppg,'SNUADC/PLETH',end,[20,70],'#b29cff');recordedWave(art,'SNUADC/ART',end,[35,145],'#f2b784');$('#replay-time').textContent=fmt(time)+' / 02:00';const second=Math.floor(time);if(second!==lastNumeric){lastNumeric=second;const hr=numeric('Solar8000/HR',time);$('#heart-rate').innerHTML=hr+'<small>bpm · recorded</small>';$('#bp').textContent=numeric('Solar8000/ART_SBP',time)+' / '+numeric('Solar8000/ART_DBP',time);if(typeof hr==='number')$('.heart').style.animationDuration=60/hr+'s';}}
function segment(offset){replayOffset=offset;replayStart=clock;lastNumeric=-1;all('[data-segment]').forEach(b=>{const on=Number(b.dataset.segment)===offset;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});drawWaves(clock);}
all('[data-segment]').forEach(b=>b.addEventListener('click',()=>segment(Number(b.dataset.segment))));$('#restart-replay')?.addEventListener('click',()=>segment(0));
$('#copy-email')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('ssybz5@nottingham.edu.cn');$('#copy-status').textContent='Email copied.';}catch{$('#copy-status').textContent='Please copy: ssybz5@nottingham.edu.cn';}});
function frame(ms){if(ms-lastMediaCheck>200){lastMediaCheck=ms;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced!==systemReduced){systemReduced=reduced;paused=reduced;drawn=false;motionUI();}}paintTrail(ms);const dt=last?Math.min((ms-last)/1000,.05):0;last=ms;if(!paused&&!document.hidden){clock+=dt;drawn=false;}if(!drawn||remoteDialog?.open){galaxy(clock);cardArt(clock);if(car)drawCar(clock,remoteDialog?.open?dt:paused?0:dt);if(ecg)drawWaves(clock);drawn=paused;}requestAnimationFrame(frame);}requestAnimationFrame(frame);
const signalLayout=$('.signal-layout');if(signalLayout){document.body.classList.add('signal-tabs-ready');const tabs=all('[data-signal-view]');function selectSignalView(view){signalLayout.dataset.mobileTab=view;tabs.forEach(b=>{const active=b.dataset.signalView===view;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});protectContent();}tabs.forEach(b=>{b.addEventListener('click',()=>selectSignalView(b.dataset.signalView));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=['ArrowLeft','Home'].includes(e.key)?tabs[0]:tabs[1];selectSignalView(next.dataset.signalView);next.focus();});});}
const compactWave=matchMedia('(max-width:700px)');function setSecondaryWave(){all('[data-mobile-collapse]').forEach(el=>el.open=!compactWave.matches);}setSecondaryWave();compactWave.addEventListener('change',setSecondaryWave);
// Paused pages still redraw after loading data or selecting a different task/segment.
if(ecg)new MutationObserver(()=>{if(paused&&recording){drawWaves(clock);}}).observe($('#replay-status'),{childList:true});
})();
// Dashboard task shortcuts open the selected demonstration directly.
{const target=new URL(location.href).searchParams.get('task');if(['distance','line','remote','vision'].includes(target))document.querySelector('[data-task="'+target+'"]')?.click();}
