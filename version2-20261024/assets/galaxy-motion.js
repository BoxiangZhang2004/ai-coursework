(()=>{'use strict';
const canvas=document.createElement('canvas');canvas.id='galaxy-motion';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
let ready=false,last=-1,viewport=[innerWidth,innerHeight],image;
const geometry=()=>{const [w,h]=viewport,consolePage=document.body.classList.contains('console-site');let width,height,x,y;if(w<=700){if(consolePage){width=1000;height=width*2/3;x=(w-width)*.58;y=-130;}else{height=h;width=h*1.5;x=(w-width)*.65;y=0;}}else if(consolePage){width=Math.max(1100,w);height=width*2/3;x=w-width+80;y=-175;}else{const scale=Math.max(w/1536,h/1024);width=1536*scale;height=1024*scale;x=(w-width)/2;y=(h-height)/2;}return{size:[width,height],offset:[x,y]};};
if(!gl){canvas.remove();return;}
const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const fragment=`precision mediump float;
varying vec2 uv;uniform sampler2D source;uniform vec2 screen;uniform vec2 imageSize;uniform vec2 imageOffset;uniform float time;
mat2 rotation(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
vec3 sampleImage(vec2 p){vec2 edge=smoothstep(vec2(0.),vec2(.025),p)*(1.-smoothstep(vec2(.975),vec2(1.),p));return texture2D(source,vec2(p.x,1.-p.y)).rgb*edge.x*edge.y;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 pixel=vec2(uv.x,1.-uv.y)*screen;vec2 p=(pixel-imageOffset)/imageSize;
 vec2 centre=vec2(.70,.455);vec2 delta=(p-centre)*vec2(1.5,1.);vec2 q=rotation(.62)*delta;q.y/=.70;
 float radius=length(q);float inside=1.-smoothstep(.48,.77,radius);
 // Rotation happens in the galaxy's own tilted plane, with a gentle radial shear.
 float spin=time*.028+.12*sin(time*.055)*(1.-smoothstep(.04,.58,radius));
 vec2 moving=rotation(-spin)*q;moving.y*=.70;moving=rotation(-.62)*moving;vec2 sampleUV=centre+moving/vec2(1.5,1.);
 vec3 base=sampleImage(p),arms=sampleImage(sampleUV);vec3 colour=mix(base,arms,inside);
 // Small dust glints move along the spiral flow, without drawing orbit lines.
 vec2 flow=rotation(-time*.04)*q;vec2 cell=floor(flow*180.);vec2 cellUV=fract(flow*180.)-.5;
 float seed=hash(cell),spark=smoothstep(.990,1.,seed)*(1.-smoothstep(.02,.17,length(cellUV)));
 float twinkle=.45+.55*sin(time*1.3+seed*40.);float dust=spark*twinkle*inside*smoothstep(.04,.14,radius);
 colour+=vec3(.37,.57,.72)*dust*.35;
 float pulse=1.+.025*sin(time*.35+radius*9.);colour*=pulse;
 gl_FragColor=vec4(colour,1.);
}`;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Galaxy shader compilation failed');return s;}
let program;
try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Galaxy program link failed');}catch{canvas.remove();return;}
gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
const uniforms=Object.fromEntries(['screen','imageSize','imageOffset','time','source'].map(n=>[n,gl.getUniformLocation(program,n)]));
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
function resize(){viewport=[innerWidth,innerHeight];const scale=Math.min(devicePixelRatio||1,1.25,1600/innerWidth);canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);gl.viewport(0,0,canvas.width,canvas.height);last=-1;}
resize();addEventListener('resize',resize);
function draw(t){if(!ready||Math.abs(t-last)<1/30)return;last=t;const box=geometry();gl.uniform2f(uniforms.screen,...viewport);gl.uniform2f(uniforms.imageSize,...box.size);gl.uniform2f(uniforms.imageOffset,...box.offset);gl.uniform1f(uniforms.time,t);gl.uniform1i(uniforms.source,0);gl.drawArrays(gl.TRIANGLES,0,6);}
window.portfolioGalaxyFrame=draw;
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;document.body.classList.remove('dynamic-galaxy-ready');});
canvas.addEventListener('webglcontextrestored',()=>{document.body.classList.remove('dynamic-galaxy-ready');});
image=new Image();image.onload=()=>{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;draw(0);document.body.classList.add('dynamic-galaxy-ready');};image.src='assets/galaxy-deep-field.webp';
})();
