(() => {
'use strict';

// Tiny, deterministic starfield for the old-school CRT attract screen.
const starsCanvas = document.getElementById('stars');
const starsCtx = starsCanvas?.getContext('2d');
let stars = [];
function randomFrom(seed) {let s = seed >>> 0;return () => {s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function paintStars() {
  if (!starsCanvas || !starsCtx) return;
  const dpr = Math.min(2,window.devicePixelRatio||1);
  const w=window.innerWidth,h=window.innerHeight;
  starsCanvas.width=Math.round(w*dpr);starsCanvas.height=Math.round(h*dpr);
  starsCtx.setTransform(dpr,0,0,dpr,0,0);
  starsCtx.clearRect(0,0,w,h);
  const rnd=randomFrom(1983);
  const palette=['#63d9ff','#c675e9','#ff9d4d','#f7db54','#ea668c','#8dcbdd'];
  stars=[];
  for(let i=0;i<Math.max(65,Math.floor(w*h/11000));i++){
    const x=rnd()*w,y=rnd()*h,size=.8+rnd()*1.6;
    const colour=palette[Math.floor(rnd()*palette.length)];
    const opacity=.16+rnd()*.32;
    stars.push({x,y,size,colour,opacity});
    starsCtx.globalAlpha=opacity;starsCtx.fillStyle=colour;starsCtx.fillRect(Math.round(x),Math.round(y),Math.ceil(size),Math.ceil(size));
  }
  starsCtx.globalAlpha=1;
}
window.addEventListener('resize',paintStars,{passive:true});
paintStars();

const titleCanvas=document.getElementById('introTitle');
if (!titleCanvas) return; // 404 uses this same script for background stars only.
const titleCtx=titleCanvas.getContext('2d');
const glyphs={
 'A':['01110','10001','10001','11111','10001','10001','10001'],
 'B':['11110','10001','10001','11110','10001','10001','11110'],
 'C':['01111','10000','10000','10000','10000','10000','01111'],
 'D':['11110','10001','10001','10001','10001','10001','11110'],
 'E':['11111','10000','10000','11110','10000','10000','11111'],
 'F':['11111','10000','10000','11110','10000','10000','10000'],
 'G':['01111','10000','10000','10111','10001','10001','01111'],
 'H':['10001','10001','10001','11111','10001','10001','10001'],
 'I':['11111','00100','00100','00100','00100','00100','11111'],
 'J':['00111','00010','00010','00010','10010','10010','01100'],
 'K':['10001','10010','10100','11000','10100','10010','10001'],
 'L':['10000','10000','10000','10000','10000','10000','11111'],
 'M':['10001','11011','10101','10101','10001','10001','10001'],
 'N':['10001','11001','10101','10011','10001','10001','10001'],
 'O':['01110','10001','10001','10001','10001','10001','01110'],
 'P':['11110','10001','10001','11110','10000','10000','10000'],
 'Q':['01110','10001','10001','10001','10101','10010','01101'],
 'R':['11110','10001','10001','11110','10100','10010','10001'],
 'S':['01111','10000','10000','01110','00001','00001','11110'],
 'T':['11111','00100','00100','00100','00100','00100','00100'],
 'U':['10001','10001','10001','10001','10001','10001','01110'],
 'V':['10001','10001','10001','10001','10001','01010','00100'],
 'W':['10001','10001','10001','10101','10101','10101','01010'],
 'X':['10001','10001','01010','00100','01010','10001','10001'],
 'Y':['10001','10001','01010','00100','00100','00100','00100'],
 'Z':['11111','00001','00010','00100','01000','10000','11111'],
 ' ':['00000','00000','00000','00000','00000','00000','00000']
};
function paintPixelTitle(text){
 const unit=4,step=6,margin=6;
 const width=text.length*step*unit+margin*2-unit;
 titleCanvas.width=width;titleCanvas.height=7*unit+margin*2+3;
 titleCtx.clearRect(0,0,titleCanvas.width,titleCanvas.height);
 const cells=[];
 for(let c=0;c<text.length;c++){
   const gl=glyphs[text[c]]||glyphs[' '];
   for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(gl[y][x]==='1')cells.push([margin+(c*step+x)*unit,margin+y*unit]);
 }
 function layer(dx,dy,color,alpha=1){titleCtx.fillStyle=color;titleCtx.globalAlpha=alpha;for(const [x,y] of cells)titleCtx.fillRect(x+dx,y+dy,unit,unit);titleCtx.globalAlpha=1;}
 // Pixel-sharp magenta and blue registration offsets emulate CRT cabinet type.
 layer(3,3,'#f045a1');layer(-2,-2,'#6de9ff');layer(0,0,'#f8f9eb');
 layer(0,1,'#ffcf25');layer(0,0,'#ffea43');
}
paintPixelTitle('COMING SOON');
const attract=document.getElementById('attract');
const reveal=document.getElementById('reveal');
const soundButton=document.getElementById('sound');
const gameCanvas=document.getElementById('game');
const gameCtx=gameCanvas.getContext('2d',{alpha:false});
const gameMessage=document.getElementById('gameMessage');
const gameTitle=document.getElementById('gameTitle');
const gameSubtitle=document.getElementById('gameSubtitle');
const scoreElement=document.getElementById('score');
const bestElement=document.getElementById('best');
let audioMuted=false,audioContext=null;
function audio(){try{if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});return audioContext;}catch{return null;}}
function blip(freq,duration=.09,kind='square',gain=.035,delay=0){if(audioMuted)return;const ac=audio();if(!ac)return;const t=ac.currentTime+delay;const osc=ac.createOscillator(),vol=ac.createGain();osc.type=kind;osc.frequency.setValueAtTime(freq,t);vol.gain.setValueAtTime(.0001,t);vol.gain.exponentialRampToValueAtTime(gain,t+.008);vol.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(vol);vol.connect(ac.destination);osc.start(t);osc.stop(t+duration+.015);}
function coinSound(){blip(620,.09,'square',.025);blip(920,.14,'square',.022,.10);}
function jumpSound(){blip(310,.09,'square',.025);blip(440,.13,'square',.018,.06)}
function hitSound(){blip(160,.18,'sawtooth',.048);blip(85,.3,'square',.028,.12)}
soundButton.addEventListener('click',()=>{audioMuted=!audioMuted;soundButton.textContent=audioMuted?'SFX OFF':'SFX ON';soundButton.setAttribute('aria-pressed',String(audioMuted));soundButton.setAttribute('aria-label',audioMuted?'Enable sound effects':'Mute sound effects');});
let opened=false;
function openPreview(){if(opened)return;opened=true;coinSound();attract.hidden=true;reveal.hidden=false;document.body.classList.add('is-open');resizeGame();render(performance.now());window.scrollTo({top:0,behavior:'instant'});}
attract.addEventListener('click',openPreview);
attract.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();openPreview();}});

const STORE='ah-arcade-coming-soon-runner-best';
let best=0;
try{best=Number(localStorage.getItem(STORE))||0;}catch{}
let W=960,H=338,GROUND=286,playerX=132,player={y:248,vy:0,ground:true};
const PLAYER_W=29,PLAYER_H=38,GRAVITY=1300,JUMP=-475;
let mode='ready',time=0,distance=0,score=0,coins=0,obstacles=[],pickups=[],particles=[],spawn=1.55,last=0,raf=0,accumulator=0;
let speed=260;
const STEP=1/120; // stable physics independent of screen refresh rate
let sceneDistance=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pad=n=>String(Math.max(0,Math.floor(n))).padStart(5,'0');
function syncHud(){scoreElement.textContent=pad(score);bestElement.textContent=pad(best);}
function resizeGame(){
 const narrow=window.innerWidth<560;
 const prevW=W;
 W=narrow?660:960;
 gameCanvas.width=W;gameCanvas.height=H;
 playerX=narrow?105:132;
 if(prevW!==W){obstacles=[];pickups=[];spawn=1.5;}
}
window.addEventListener('resize',()=>{if(opened){resizeGame();render(performance.now());}},{passive:true});
function rect(x,y,w,h,c){gameCtx.fillStyle=c;gameCtx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function showMessage(title,subtitle){gameTitle.textContent=title;gameSubtitle.textContent=subtitle;gameMessage.hidden=false;}
function begin(){mode='running';time=0;distance=0;score=0;coins=0;spawn=1.3;speed=260;last=0;accumulator=0;obstacles=[];pickups=[];particles=[];player.y=GROUND-PLAYER_H;player.prevY=player.y;player.vy=0;player.ground=true;gameMessage.hidden=true;syncHud();}
function jump(){if(mode!=='running'||!player.ground)return;player.ground=false;player.vy=JUMP;jumpSound();dust(playerX+PLAYER_W/2,GROUND,5,'#6ddfff');}
function action(){if(!opened)return;if(mode==='ready'||mode==='over'){begin();return;}if(mode==='paused'){mode='running';gameMessage.hidden=true;last=0;accumulator=0;return;}jump();}
function pause(){if(mode==='running'){mode='paused';showMessage('PAUSED','P TO RESUME');}else if(mode==='paused'){mode='running';gameMessage.hidden=true;last=0;accumulator=0;}}
function end(){if(mode!=='running')return;mode='over';hitSound();dust(playerX+PLAYER_W/2,player.y+PLAYER_H/2,16,'#ff638e');if(score>best)best=Math.floor(score);try{localStorage.setItem(STORE,String(best));}catch{}syncHud();showMessage('GAME OVER','SPACE / TAP TO RETRY');}
function dust(x,y,n,color){for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-115,115),vy:rnd(-145,25),life:rnd(.15,.48),c:color,s:rnd(2,6)});}
gameCanvas.addEventListener('pointerdown',e=>{e.preventDefault();action();gameCanvas.focus({preventScroll:true});});
document.addEventListener('keydown',e=>{
 if(e.altKey||e.ctrlKey||e.metaKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName||''))return;
 const k=e.key.toLowerCase();
 if(!opened){if(k==='enter'||k===' '){e.preventDefault();openPreview();}return;}
 if(k===' '||k==='arrowup'||k==='w'){if(e.target===soundButton)return;e.preventDefault();if(!e.repeat)action();}
 else if(k==='p'&&!e.repeat){e.preventDefault();pause();}
 else if(k==='r'&&!e.repeat){e.preventDefault();begin();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='running')pause();last=0;accumulator=0;});
function obstacle(){
 const type=Math.random()>.45?'cabinet':'glitch';
 const w=type==='cabinet'?36:43,h=type==='cabinet'?48:39;
 const x=W+32;
 obstacles.push({x,w,h,type});
 if(Math.random()>.22)pickups.push({x:x+w+rnd(65,105),y:GROUND-rnd(86,109),phase:rnd(0,6.28)});
 spawn=rnd(1.27,1.77)*(270/Math.max(270,speed))+.34;
}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function tick(dt){
 if(mode!=='running')return;
 player.prevY=player.y;
 for(const o of obstacles)o.prevX=o.x;
 for(const c of pickups)c.prevX=c.x;
 time+=dt;speed=Math.min(445,260+time*4.5);distance+=speed*dt;score+=dt*(19+time*.13);
 player.vy+=GRAVITY*dt;player.y+=player.vy*dt;
 if(player.y>=GROUND-PLAYER_H){if(!player.ground)dust(playerX+12,GROUND,3,'#61d5fa');player.y=GROUND-PLAYER_H;player.vy=0;player.ground=true;}
 spawn-=dt;if(spawn<=0)obstacle();
 const pbox={x:playerX+5,y:player.y+4,w:PLAYER_W-10,h:PLAYER_H-6};
 for(const o of obstacles){o.x-=speed*dt;if(hit(pbox,{x:o.x+4,y:GROUND-o.h+3,w:o.w-8,h:o.h-5})){end();break;}}
 obstacles=obstacles.filter(o=>o.x+o.w>-25);
 for(const c of pickups){c.x-=speed*dt;if(hit(pbox,{x:c.x-13,y:c.y-13,w:26,h:26})){c.got=true;score+=50;coins++;coinSound();dust(c.x,c.y,9,'#ffda54');}}
 pickups=pickups.filter(c=>!c.got&&c.x>-25);
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=250*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);
 if(Math.floor(score)>best)best=Math.floor(score);
 syncHud();
}
function drawSky(t){
 const g=gameCtx.createLinearGradient(0,0,0,GROUND);
 g.addColorStop(0,'#030716');g.addColorStop(.65,'#07172e');g.addColorStop(1,'#122947');
 gameCtx.fillStyle=g;gameCtx.fillRect(0,0,W,H);
 // A quiet pixel moon; no flashing sun, fast-moving starfield or rainbow skyline.
 const mx=W*.80,my=77;
 rect(mx-22,my-24,44,48,'#1d3054');rect(mx-25,my-15,50,30,'#a8bed9');
 rect(mx-18,my-21,36,42,'#c4d3e4');rect(mx-6,my-9,6,6,'#94abc6');rect(mx+8,my+6,7,5,'#94abc6');
 for(let i=0;i<22;i++){
   const x=((i*191+47-sceneDistance*.022)%(W+90)+(W+90))%(W+90);
   const y=17+(i*71)%168;
   rect(x,y,i%6===0?3:2,2,i%4===0?'#567598':'#314e76');
 }
 rect(0,221,W,65,'#07172d');
 // Two restrained layers of distant buildings, drifting at different speeds.
 for(let layer=0;layer<2;layer++){
  const buildingWidth=layer===0?58:44,offset=sceneDistance*(layer===0?.045:.095);
  const base=layer===0?242:265;
  for(let i=-2;i<Math.ceil(W/buildingWidth)+4;i++){
   const worldIndex=i+Math.floor(offset/buildingWidth);
   const x=i*buildingWidth-(offset%buildingWidth);
   const height=(layer===0?28:37)+((Math.abs(worldIndex*17+layer*41)%5)*11);
   rect(x,base-height,buildingWidth-5,height+GROUND-base,layer===0?'#091e36':'#0c203c');
   rect(x,base-height,buildingWidth-5,2,layer===0?'#203754':'#172f52');
   if(layer===1){
    for(let wy=base-height+10;wy<base-2;wy+=14)
     for(let wx=x+6;wx<x+buildingWidth-10;wx+=12)
      if((worldIndex*11+wy+wx)%5===0)rect(wx,wy,3,4,'#416083');
   }
  }
 }
 rect(0,GROUND-4,W,4,'#437da9');
 rect(0,GROUND,W,H-GROUND,'#081528');
 const off=sceneDistance%48;
 for(let x=-48-off;x<W+48;x+=48){rect(x,GROUND+12,34,3,'#1b3453');rect(x+16,GROUND+29,9,3,'#1d3150');rect(x+2,GROUND+43,4,3,'#152841');}
}
function drawPlayer(t,alpha=1){
 const x=Math.round(playerX),y=Math.round((player.prevY??player.y)*(1-alpha)+player.y*alpha),stride=mode==='running'&&player.ground?Math.floor(t*13)%2:0;
 // Shadow, chunky shoes, jacket, visor and glowing square eyes.
 rect(x+3,GROUND+2,26,4,'#030710');
 rect(x+5,y+30+(stride?2:0),8,8,'#385dc2');rect(x+16,y+30+(stride?0:2),8,8,'#385dc2');
 rect(x+2,y+17,26,17,'#4c7cf1');rect(x,y+20,5,10,'#2857af');rect(x+25,y+20,5,10,'#2857af');
 rect(x+6,y+1,18,19,'#ffdb59');rect(x+4,y+5,22,13,'#ffdb59');
 rect(x+7,y+8,16,8,'#19274a');rect(x+9,y+10,4,4,'#84e7ff');rect(x+18,y+10,4,4,'#84e7ff');
 rect(x+9,y+19,12,3,'#d94e87');
}
function drawObstacle(o,alpha=1){
 const x=Math.round((o.prevX??o.x)*(1-alpha)+o.x*alpha),y=GROUND-o.h;
 if(o.type==='cabinet'){
  rect(x+4,y,29,5,'#7f41b4');rect(x,y+5,37,31,'#9c54d7');rect(x+4,y+11,29,21,'#07102a');
  rect(x+8,y+15,21,11,'#1c6aba');rect(x+10,y+16,17,5,'#69d8ef');
  rect(x+6,y+37,25,8,'#3b296b');rect(x+5,y+43,7,5,'#362255');rect(x+25,y+43,7,5,'#362255');
 }else{
  rect(x,y,43,38,'#fd5b90');rect(x+5,y+5,33,28,'#932866');rect(x+10,y+10,23,18,'#ffb45a');
  rect(x+13,y+13,6,6,'#411a5a');rect(x+24,y+19,5,5,'#411a5a');
  rect(x+8,y+31,5,6,'#f8bd72');rect(x+30,y+2,5,5,'#f8bd72');
 }
}
function drawCoins(t,alpha=1){
 for(const c of pickups){const x=Math.round((c.prevX??c.x)*(1-alpha)+c.x*alpha),y=Math.round(c.y+Math.sin(t*4+c.phase)*3);const width=5+Math.abs(Math.sin(t*3+c.phase))*15;rect(x-width/2-2,y-13,width+4,26,'#9c5c22');rect(x-width/2,y-11,width,22,'#ffd349');rect(x-width/2+2,y-7,Math.max(1,width-4),14,'#ffe99b');if(width>10)rect(x-2,y-5,4,10,'#c88b2a');}
}
function drawParticles(){for(const p of particles){gameCtx.globalAlpha=Math.max(0,p.life/.48);rect(p.x,p.y,p.s,p.s,p.c);}gameCtx.globalAlpha=1;}
function render(stamp,alpha=1){const t=stamp/1000;sceneDistance=distance+speed*STEP*alpha*(mode==='running'?1:0);drawSky(t);for(const o of obstacles)drawObstacle(o,alpha);drawCoins(t,alpha);drawPlayer(t,alpha);drawParticles();}
function loop(stamp){
 if(!last)last=stamp;
 const frameTime=Math.min((stamp-last)/1000,.05);last=stamp;
 if(opened){
   if(mode==='running'){
     accumulator+=frameTime;
     let steps=0;
     while(accumulator>=STEP&&steps<7&&mode==='running'){
       tick(STEP);accumulator-=STEP;steps++;
     }
     if(steps===7)accumulator=Math.min(accumulator,STEP);
   }else accumulator=0;
   render(stamp,Math.min(1,accumulator/STEP));
 }
 raf=requestAnimationFrame(loop);
}
syncHud();resizeGame();showMessage('PRESS START','SPACE / ↑ / TAP');raf=requestAnimationFrame(loop);
})();
