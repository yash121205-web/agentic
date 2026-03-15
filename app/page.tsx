'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const TYPING = [
  "🔍 Scanning Flask app for vulnerabilities...",
  "🧠 Reasoning: f-string in SQL = injection vector",
  "🚨 CRITICAL: SQL Injection at line 18 — CVSS 9.8",
  "🚨 HIGH: Hardcoded secret_key — CVSS 8.2",
  "🔧 Generating parameterized query patch...",
  "🔄 Re-verifying patched codebase...",
  "✅ Security score: 4 → 96 | All clear 🎉",
]

/* ── SPLASH MATRIX ── */
function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    c.width = window.innerWidth; c.height = window.innerHeight
    const cols = Math.floor(c.width / 18)
    const drops: number[] = Array(cols).fill(1)
    const chars = '01アイウエカキクケコセキュリティ脆弱性SECURE{}[]</>$#@'
    const draw = () => {
      ctx.fillStyle = 'rgba(5,5,8,0.055)'; ctx.fillRect(0,0,c.width,c.height)
      drops.forEach((y,i) => {
        const bright = Math.random() > 0.95
        ctx.fillStyle = bright ? '#fff' : '#00ff88'
        ctx.font = `${bright?'bold ':''}13px monospace`
        ctx.globalAlpha = bright ? 0.8 : 0.22
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*18, y*18)
        ctx.globalAlpha = 1
        if(y*18 > c.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
    }
    const id = setInterval(draw, 45)
    return () => clearInterval(id)
  }, [])
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>
}

/* ── HERO BG: HEX GRID + RADAR + NODES + ORBS ── */
function HeroBG({ mx = 0, my = 0 }: { mx?: number; my?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: mx, y: my })
  
  useEffect(() => {
    mouseRef.current = { x: mx, y: my }
  }, [mx, my])

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; initNodes() }
    window.addEventListener('resize', onResize)

    const HEX = 40, HW = HEX * Math.sqrt(3)
    function hexPath(x:number,y:number,s:number) {
      ctx.beginPath()
      for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;i===0?ctx.moveTo(x+s*Math.cos(a),y+s*Math.sin(a)):ctx.lineTo(x+s*Math.cos(a),y+s*Math.sin(a))}
      ctx.closePath()
    }

    type Node={x:number;y:number;vx:number;vy:number;r:number;type:string;pulse:number}
    const COLS:Record<string,string>={critical:'255,68,102',high:'255,149,0',medium:'255,200,0',info:'68,136,255'}
    const TYPES=['critical','high','medium','info']
    let nodes:Node[]=[]
    function initNodes(){nodes=Array.from({length:18},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.35,vy:(Math.random()-.5)*0.35,r:Math.random()*2.5+1.5,type:TYPES[Math.floor(Math.random()*4)],pulse:Math.random()*Math.PI*2}))}
    initNodes()

    /* Orbs */
    const orbs=[
      {x:W*0.15,y:H*0.25,vx:0.18,vy:0.1,r:280,phase:0},
      {x:W*0.88,y:H*0.65,vx:-0.14,vy:0.12,r:320,phase:2},
    ]

    let t=0, frame:number
    const CX=()=>W/2, CY=()=>H*0.44
    let curMx = 0, curMy = 0

    function draw(){
      ctx.clearRect(0,0,W,H); t++
      const angle=t*0.007
      curMx += (mouseRef.current.x - curMx) * 0.08
      curMy += (mouseRef.current.y - curMy) * 0.08

      /* Orbs */
      orbs.forEach(o=>{
        o.x+=o.vx; o.y+=o.vy
        if(o.x<-o.r||o.x>W+o.r)o.vx*=-1
        if(o.y<-o.r||o.y>H+o.r)o.vy*=-1
        const pulse=Math.sin(t*0.01+o.phase)*0.2+0.8
        const px = o.x + curMx * -80
        const py = o.y + curMy * -80
        const g=ctx.createRadialGradient(px,py,0,px,py,o.r*pulse)
        g.addColorStop(0,'rgba(0,255,136,0.045)'); g.addColorStop(0.5,'rgba(0,200,255,0.018)'); g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
      })

      /* Hex grid */
      const cols2=Math.ceil(W/HW)+2, rows2=Math.ceil(H/HEX)+2
      for(let row=-1;row<rows2;row++){for(let col=-1;col<cols2;col++){
        const base_x=col*HW+(row%2)*HW/2, base_y=row*HEX*1.5
        const px = base_x + curMx * 30, py = base_y + curMy * 30
        const dx=px-CX(), dy=py-CY(), dist=Math.sqrt(dx*dx+dy*dy)
        const fade=Math.max(0,1-dist/(Math.max(W,H)*0.66))
        const na=Math.atan2(dy,dx)
        let da=((na-angle+Math.PI*3)%(Math.PI*2))-Math.PI
        const swept=da<0&&da>-0.26
        hexPath(px,py,HEX*0.44)
        ctx.strokeStyle=`rgba(0,255,136,${(0.04+(swept?0.2:0))*fade})`
        ctx.lineWidth=swept?1.1:0.5; ctx.stroke()
        if(swept&&fade>0.25){ctx.fillStyle=`rgba(0,255,136,${0.038*fade})`;ctx.fill()}
      }}

      /* Radar sweep */
      const R=Math.min(W,H)*0.52
      ctx.save(); ctx.translate(CX() + curMx * 15, CY() + curMy * 15)
      for(let i=0;i<38;i++){const a=angle-0.55*(i/38);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,a-0.018,a,false);ctx.closePath();ctx.fillStyle=`rgba(0,255,136,${(1-i/38)*0.09})`;ctx.fill()}
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(angle)*R,Math.sin(angle)*R)
      ctx.strokeStyle='rgba(0,255,136,0.65)';ctx.lineWidth=1.5;ctx.shadowColor='#00ff88';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0
      ;[0.28,0.52,0.76,1].forEach(f=>{ctx.beginPath();ctx.arc(0,0,R*f,0,Math.PI*2);ctx.strokeStyle='rgba(0,255,136,0.05)';ctx.lineWidth=0.5;ctx.stroke()})
      ctx.restore()

      /* Threat nodes */
      nodes.forEach(n=>{
        n.x+=n.vx;n.y+=n.vy;n.pulse+=0.04
        if(n.x<0)n.x=W;if(n.x>W)n.x=0;if(n.y<0)n.y=H;if(n.y>H)n.y=0
        const px = n.x + curMx * 45, py = n.y + curMy * 45
        const dx2=px-(CX() + curMx * 15), dy2=py-(CY() + curMy * 15)
        if(Math.sqrt(dx2*dx2+dy2*dy2)>R)return
        const na2=Math.atan2(dy2,dx2)
        let da2=((na2-angle+Math.PI*3)%(Math.PI*2))-Math.PI
        const lit=da2<0&&da2>-1.1
        const col=COLS[n.type], pulse=Math.sin(n.pulse)*0.5+0.5
        if(lit){ctx.beginPath();ctx.arc(px,py,n.r+12+pulse*8,0,Math.PI*2);ctx.strokeStyle=`rgba(${col},${0.22*pulse})`;ctx.lineWidth=1;ctx.stroke()}
        ctx.beginPath();ctx.arc(px,py,n.r+pulse,0,Math.PI*2)
        ctx.fillStyle=`rgba(${col},${lit?0.9:0.25})`;ctx.shadowColor=`rgba(${col},0.8)`;ctx.shadowBlur=lit?14:3;ctx.fill();ctx.shadowBlur=0
        if(lit){ctx.font='10px JetBrains Mono,monospace';ctx.fillStyle=`rgba(${col},0.75)`;ctx.fillText(n.type.toUpperCase(),px+n.r+7,py+3)}
      })

      /* Node connections */
      nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
        const ax = a.x + curMx * 45, ay = a.y + curMy * 45;
        const bx = b.x + curMx * 45, by = b.y + curMy * 45;
        const dx=ax-bx, dy=ay-by, d=Math.sqrt(dx*dx+dy*dy);
        if(d<160){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle=`rgba(0,255,136,${0.055*(1-d/160)})`;ctx.lineWidth=0.5;ctx.stroke()}
      }))

      /* Scan line across full page */
      const scanY=((t*0.6)%(H+60))-30
      const sg=ctx.createLinearGradient(0,scanY-20,0,scanY+20)
      sg.addColorStop(0,'transparent');sg.addColorStop(0.5,'rgba(0,255,136,0.025)');sg.addColorStop(1,'transparent')
      ctx.fillStyle=sg;ctx.fillRect(0,scanY-20,W,40)

      /* 3D PARALLAX OVERLAY (subtle noise) */
      ctx.globalAlpha = 0.015
      for(let i=0; i<6; i++) {
        ctx.fillStyle='#00ff88'
        ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1)
      }
      ctx.globalAlpha = 1

      /* Vignette */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*0.82)
      vig.addColorStop(0,'transparent');vig.addColorStop(1,'rgba(3,4,8,0.72)')
      ctx.fillStyle=vig;ctx.fillRect(0,0,W,H)

      frame=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',onResize)}
  },[])
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1}}/>
}

/* ── GLITCH TEXT ── */
function Glitch({text}:{text:string}) {
  const [g,setG]=useState(false)
  useEffect(()=>{
    const fire=()=>{setG(true);setTimeout(()=>setG(false),160);setTimeout(fire,3500+Math.random()*3500)}
    const id=setTimeout(fire,2500); return()=>clearTimeout(id)
  },[])
  return (
    <span style={{position:'relative',display:'inline-block'}}>
      {text}
      {g&&<>
        <span style={{position:'absolute',inset:0,color:'#ff4466',clipPath:'inset(20% 0 55% 0)',transform:'translate(-4px)',mixBlendMode:'screen'}}>{text}</span>
        <span style={{position:'absolute',inset:0,color:'#00aaff',clipPath:'inset(55% 0 15% 0)',transform:'translate(4px)',mixBlendMode:'screen'}}>{text}</span>
      </>}
    </span>
  )
}

/* ── LIVE COUNTER ── */
function LiveCounter(){const [n,setN]=useState(12847);useEffect(()=>{const id=setInterval(()=>setN(c=>c+Math.floor(Math.random()*3)),2000);return()=>clearInterval(id)},[]);return <span>{n.toLocaleString()}</span>}

/* ── SCROLL REVEAL ── */
function Reveal({children,delay=0,direction='up',distance=40}:{children:React.ReactNode;delay?:number;direction?:'up'|'down'|'left'|'right';distance?:number}){
  const ref=useRef<HTMLDivElement>(null);const [v,setV]=useState(false)
  useEffect(()=>{const el=ref.current;if(!el)return;const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);obs.disconnect()}},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});obs.observe(el);return()=>obs.disconnect()},[])
  
  let transform = `translateY(${distance}px)`
  if(direction==='down') transform = `translateY(-${distance}px)`
  if(direction==='left') transform = `translateX(${distance}px)`
  if(direction==='right') transform = `translateX(-${distance}px)`
  
  return <div ref={ref} style={{
    opacity:v?1:0,
    filter:v?'blur(0)':'blur(12px)',
    transform:v?'translate(0,0)':transform,
    transition:`all 1.1s cubic-bezier(0.19, 1, 0.22, 1) ${delay}s`
  }}>{children}</div>
}

/* ── 3D TILT CARD ── */
function TiltCard({children, className=''}:{children:React.ReactNode, className?:string}){
  const ref=useRef<HTMLDivElement>(null)
  const [style,setStyle]=useState({transform:'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'})
  const [glow,setGlow]=useState({opacity:0,x:0,y:0})

  const onMouseMove=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(!ref.current)return
    const rect=ref.current.getBoundingClientRect()
    const x=e.clientX-rect.left
    const y=e.clientY-rect.top
    const mx=(x/rect.width-0.5)*2
    const my=(y/rect.height-0.5)*2
    setStyle({transform:`perspective(1000px) rotateX(${-my*8}deg) rotateY(${mx*8}deg) scale3d(1.02,1.02,1.02)`})
    setGlow({opacity:1,x,y})
  }
  const onMouseLeave=()=>{
    setStyle({transform:'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'})
    setGlow(p=>({...p,opacity:0}))
  }
  const onMouseDown=()=>{
    setStyle(p=>({...p,transform:`${p.transform.replace(/scale3d\([^)]+\)/,'')} scale3d(0.97,0.97,0.97)`}))
  }
  const onMouseUp=(e:React.MouseEvent<HTMLDivElement>)=>onMouseMove(e)

  return (
    <div ref={ref} className={`tilt-wrap ${className}`} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp} style={{...style,transition:style.transform.includes('rotateX(0deg)')?'all 0.5s cubic-bezier(0.2,0.8,0.2,1)':'transform 0.1s ease'}}>
      {children}
      <div className="tilt-glow" style={{opacity:glow.opacity,background:`radial-gradient(circle at ${glow.x}px ${glow.y}px, rgba(0,255,136,0.15), transparent 40%)`}}/>
    </div>
  )
}

/* ── ANIMATED BUTTON ── */
function AnimatedButton({children, onClick, className='', variant='primary'}:{children:React.ReactNode, onClick?:()=>void, className?:string, variant?:'primary'|'outline'}) {
  const [ripples,setRipples]=useState<{x:number,y:number,id:number}[]>([])
  const onMouseDown=(e:React.MouseEvent<HTMLButtonElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect()
    const x=e.clientX-rect.left
    const y=e.clientY-rect.top
    const id=Date.now()
    setRipples(p=>[...p,{x,y,id}])
    setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==id)),600)
  }
  return (
    <button onClick={onClick} onMouseDown={onMouseDown} className={`btn-anim btn-${variant} ${className}`}>
      <span style={{position:'relative',zIndex:2}}>{children}</span>
      {ripples.map(r=><span key={r.id} className="ripple" style={{left:r.x,top:r.y}}/>)}
    </button>
  )
}

/* ── IMMERSIVE BACKGROUND ── */
function ImmersiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    
    const particles: {x:number,y:number,vx:number,vy:number,s:number}[] = []
    for(let i=0; i<60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 1.5 + 0.5
      })
    }

    const shapes: {x:number,y:number,r:number,vr:number,t:number,s:number}[] = []
    for(let i=0; i<4; i++) {
      shapes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0,
        vr: (Math.random() - 0.5) * 0.005,
        t: Math.random() * 100,
        s: Math.random() * 40 + 30
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0,0,w,h)
      
      // Particles
      ctx.fillStyle = 'rgba(0, 255, 136, 0.15)'
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if(p.x < 0) p.x = w
        if(p.x > w) p.x = 0
        if(p.y < 0) p.y = h
        if(p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2)
        ctx.fill()
      })

      // Wireframe Shapes
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.08)'
      ctx.lineWidth = 1
      shapes.forEach(s => {
        s.r += s.vr
        s.y += Math.sin(frame * 0.01 + s.t) * 0.2
        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.r)
        ctx.beginPath()
        for(let i=0; i<6; i++) {
          const ang = (i / 6) * Math.PI * 2
          const px = Math.cos(ang) * s.s
          const py = Math.sin(ang) * s.s
          if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.restore()
      })

      frame++
      requestAnimationFrame(animate)
    }
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    animate()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}} />
  )
}

/* ── PROXIMITY GLOW ── */
function ProximityGlow({children, className=''}:{children:React.ReactNode, className?:string}){
  const ref=useRef<HTMLDivElement>(null)
  const [dist,setDist]=useState(1) // 1 = far, 0 = close

  useEffect(()=>{
    const handleMove=(e:MouseEvent)=>{
      if(!ref.current)return
      const rect=ref.current.getBoundingClientRect()
      const cx=rect.left+rect.width/2
      const cy=rect.top+rect.height/2
      const d=Math.sqrt((e.clientX-cx)**2 + (e.clientY-cy)**2)
      const max=300
      setDist(Math.min(1, d/max))
    }
    window.addEventListener('mousemove', handleMove)
    return ()=>window.removeEventListener('mousemove', handleMove)
  },[])

  return (
    <div ref={ref} className={className} style={{
      boxShadow: `0 0 ${60*(1-dist)}px rgba(0,255,136,${0.2*(1-dist)})`,
      transition: 'box-shadow 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
      borderRadius: 'inherit'
    }}>{children}</div>
  )
}

/* ── SECTION OBSERVER ── */
function SectionObserver({onVisible, children}:{onVisible:(v:boolean)=>void, children:React.ReactNode}){
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!ref.current)return
    const obs=new IntersectionObserver(([e])=>{onVisible(e.isIntersecting)},{threshold:0.1})
    obs.observe(ref.current)
    return()=>obs.disconnect()
  },[onVisible])
  return <div ref={ref}>{children}</div>
}

/* ── MAIN ── */
export default function Home() {
  const router=useRouter()
  const [splash,setSplash]=useState(true)
  const [splashFade,setSplashFade]=useState(false)
  const [visible,setVisible]=useState(false)
  const [lineIdx,setLineIdx]=useState(0)
  const [text,setText]=useState('')
  const [charIdx,setCharIdx]=useState(0)
  const [done,setDone]=useState<string[]>([])
  const [mousePos,setMousePos]=useState({x:0,y:0})
  const [scrolled,setScrolled]=useState(false)
  const [activeSec,setActiveSec]=useState(0) // 0: hero, 1: stats, 2: how, 3: vulns, 4: stack, 5: cta

  useEffect(()=>{
    const t1=setTimeout(()=>setSplashFade(true),2200)
    const t2=setTimeout(()=>{setSplash(false);setVisible(true)},3000)
    const handleScroll=()=>{setScrolled(window.scrollY > 20)}
    window.addEventListener('scroll', handleScroll)
    return()=>{clearTimeout(t1);clearTimeout(t2);window.removeEventListener('scroll', handleScroll)}
  },[])

  useEffect(()=>{
    if(splash)return
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  },[splash])

  useEffect(()=>{
    if(splash)return
    const line=TYPING[lineIdx]
    if(charIdx<line.length){const t=setTimeout(()=>{setText(p=>p+line[charIdx]);setCharIdx(c=>c+1)},26);return()=>clearTimeout(t)}
    else{const t=setTimeout(()=>{setDone(p=>[...p.slice(-5),line]);setText('');setCharIdx(0);setLineIdx(i=>(i+1)%TYPING.length)},900);return()=>clearTimeout(t)}
  },[charIdx,lineIdx,splash])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#030408;color:white;font-family:'Outfit',sans-serif;overflow-x:hidden;scroll-behavior:smooth;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#050508;}::-webkit-scrollbar-thumb{background:#1a2a1a;border-radius:3px;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(32px);filter:blur(8px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes pulseCTA{0%{box-shadow:0 0 0 0 rgba(0,255,136,0.5)}70%{box-shadow:0 0 0 16px rgba(0,255,136,0)}100%{box-shadow:0 0 0 0 rgba(0,255,136,0)}}
        @keyframes bGlowFloat{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-2%,4%) scale(1.05);}}
        .bg-glow{position:fixed;border-radius:50%;filter:blur(90px);z-index:0;pointer-events:none;transition:transform 0.4s cubic-bezier(0.2,0.8,0.2,1);mix-blend-mode:screen;}
        .bg-glow-inner{width:100%;height:100%;border-radius:50%;animation:bGlowFloat 14s ease-in-out infinite;}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes glow{0%,100%{box-shadow:0 0 14px rgba(0,255,136,0.18)}50%{box-shadow:0 0 48px rgba(0,255,136,0.55),0 0 90px rgba(0,255,136,0.08)}}
        @keyframes loadBar{from{width:0}to{width:100%}}
        @keyframes ringPop{0%{transform:scale(0) rotate(-180deg);opacity:0}65%{transform:scale(1.1) rotate(6deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes ringPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.14);opacity:0}}
        @keyframes scanLine{0%{transform:translateY(-100%)}100%{transform:translateY(1400%)}}
        @keyframes shimmer{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(0,255,136,0.14)}50%{border-color:rgba(0,255,136,0.45)}}
        @keyframes radarPing{0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(2.4);opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes countUp{0%{transform:scale(1.2);color:#00ff88}100%{transform:scale(1)}}
        @keyframes rippleExpand{0%{transform:scale(0);opacity:0.5}100%{transform:scale(4);opacity:0}}

        /* BUTTONS */
        .btn-anim{position:relative;overflow:hidden;border:none;cursor:pointer;font-family:'Outfit',sans-serif;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);display:inline-flex;align-items:center;justify-content:center;gap:8px;}
        .btn-anim:hover{transform:scale(1.05);}
        .btn-anim:active{transform:scale(0.95);}
        .ripple{position:absolute;width:100px;height:100px;background:rgba(255,255,255,0.4);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;animation:rippleExpand 0.6s ease-out forwards;}
        
        .btn-primary{background:linear-gradient(135deg,#00ff88 0%,#00cc99 100%);color:#000;padding:15px 36px;border-radius:14px;font-weight:900;font-size:16px;box-shadow:0 4px 28px rgba(0,255,136,0.32);animation:pulseCTA 2.5s infinite;}
        .btn-primary:hover{box-shadow:0 12px 44px rgba(0,255,136,0.5), inset 0 0 12px rgba(255,255,255,0.4);background:linear-gradient(135deg,#11ffaa 0%,#00ff88 100%);}
        .btn-primary .ripple{background:rgba(255,255,255,0.6);}
        
        .btn-outline{background:transparent;color:white;border:1px solid rgba(255,255,255,0.13);padding:15px 28px;border-radius:14px;font-weight:700;font-size:16px;}
        .btn-outline:hover{border-color:#00ff88;background:rgba(0,255,136,0.05);box-shadow:0 0 20px rgba(0,255,136,0.2), inset 0 0 10px rgba(0,255,136,0.1);color:#00ff88;}
        .btn-outline .ripple{background:rgba(0,255,136,0.4);}

        /* NAVBAR */
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:24px 5%;display:flex;align-items:center;justify-content:space-between;transition:all 0.5s cubic-bezier(0.2,0.8,0.2,1);}
        nav.scrolled{padding:14px 5%;background:rgba(3,4,8,0.7);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.05);box-shadow:0 10px 30px rgba(0,0,0,0.3);}
        
        .nlogo{display:flex;align-items:center;gap:10px;cursor:pointer;}
        .nico{width:36px;height:36px;border-radius:10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-size:16px;animation:glow 4s ease infinite;}
        .nbadge{font-size:10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.22);color:#00ff88;padding:2px 9px;border-radius:20px;font-weight:700;letter-spacing:0.06em;font-family:'JetBrains Mono',monospace;}
        
        .nlinks{display:flex;gap:8px;align-items:center;}
        .nlink{color:rgba(255,255,255,0.4);border-radius:8px;font-size:14px;font-weight:600;position:relative;background:none;border:none;cursor:pointer;}
        .nlink::after{content:'';position:absolute;bottom:4px;left:50%;width:0;height:1px;background:#00ff88;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);transform:translateX(-50%);}
        .nlink:hover{color:white;transform:none !important;}
        .nlink:hover::after{width:20px;}
        .nstart{padding:10px 22px;border-radius:12px;font-size:14px;animation:none;}

        .nico:hover{transform:scale(1.1) rotate(10deg);transition:transform 0.3s cubic-bezier(0.2,0.8,0.2,1);}

        /* BACKGROUND ELEMENTS */
        .blob{position:fixed;width:500px;height:500px;background:radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%);filter:blur(60px);z-index:0;pointer-events:none;border-radius:50%;will-change:transform;}
        .b1{top:-100px;right:-100px;animation:floatBlob 20s infinite alternate;}
        .b2{bottom:-100px;left:-100px;animation:floatBlob 25s infinite alternate-reverse;}
        @keyframes floatBlob{from{transform:translate(0,0) scale(1)}to{transform:translate(100px, 50px) scale(1.1)}}

        /* SPLASH */
        .splash{position:fixed;inset:0;z-index:9999;background:#030408;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity 0.8s ease;}
        .splash.fade{opacity:0;pointer-events:none;}
        .sc{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:20px;}
        .sring{width:110px;height:110px;border-radius:50%;border:2px solid transparent;background:linear-gradient(#030408,#030408) padding-box,linear-gradient(135deg,#00ff88,#00ccff,#ff4466,#00ff88) border-box;display:flex;align-items:center;justify-content:center;position:relative;animation:ringPop 0.9s cubic-bezier(0.34,1.56,0.64,1) both;box-shadow:0 0 80px rgba(0,255,136,0.12);}
        .sring::before{content:'';position:absolute;inset:-8px;border-radius:50%;border:1px solid rgba(0,255,136,0.18);animation:ringPulse 2s ease infinite;}
        .sring::after{content:'';position:absolute;inset:-18px;border-radius:50%;border:1px solid rgba(0,255,136,0.07);animation:ringPulse 2s ease 0.5s infinite;}
        .sicon{font-size:44px;filter:drop-shadow(0 0 22px rgba(0,255,136,0.8));}
        .sname{font-size:30px;font-weight:900;letter-spacing:-0.03em;animation:fadeUp 0.5s ease 0.5s both;}
        .stag{font-size:11px;color:rgba(255,255,255,0.22);letter-spacing:0.22em;text-transform:uppercase;font-weight:600;animation:fadeUp 0.5s ease 0.7s both;font-family:'JetBrains Mono',monospace;}
        .sbar{width:180px;animation:fadeUp 0.5s ease 0.9s both;}
        .strack{height:2px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;}
        .sfill{height:100%;background:linear-gradient(90deg,#00ff88,#00ccff);border-radius:2px;animation:loadBar 2s cubic-bezier(0.4,0,0.2,1) forwards;box-shadow:0 0 10px rgba(0,255,136,0.6);}
        .spct{text-align:right;font-family:'JetBrains Mono',monospace;font-size:11px;color:#00ff88;margin-top:5px;}

        .page{opacity:0;transition:opacity 1s ease;}
        .page.show{opacity:1;}

        nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:16px 52px;background:rgba(3,4,8,0.75);backdrop-filter:blur(28px);border-bottom:1px solid rgba(0,255,136,0.06);}
        .nlogo{display:flex;align-items:center;gap:10px;cursor:pointer;}
        .nico{width:36px;height:36px;border-radius:10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);display:flex;align-items:center;justify-content:center;font-size:16px;animation:glow 4s ease infinite;transition:all 0.4s cubic-bezier(0.19, 1, 0.22, 1);}
        .nlogo:hover .nico{transform:scale(1.15) rotate(12deg);background:rgba(0,255,136,0.14);box-shadow:0 0 25px rgba(0,255,136,0.3);}
        .nbadge{font-size:10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.22);color:#00ff88;padding:2px 9px;border-radius:20px;font-weight:700;letter-spacing:0.06em;font-family:'JetBrains Mono',monospace;}
        .nlink{color:rgba(255,255,255,0.35);padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;}
        .nlink:hover{color:white;background:rgba(255,255,255,0.05);transform:scale(1);}
        .nstart{padding:10px 22px;border-radius:12px;font-size:14px;animation:none;}

        .ticker{position:relative;z-index:10;background:rgba(0,255,136,0.025);border-bottom:1px solid rgba(0,255,136,0.07);padding:9px 0;overflow:hidden;margin-top:68px;}
        .ttrack{display:flex;width:max-content;animation:ticker 26s linear infinite;}
        .titem{display:flex;align-items:center;gap:8px;padding:0 44px;font-size:12px;font-family:'JetBrains Mono',monospace;color:rgba(255,255,255,0.26);white-space:nowrap;}
        .tdot{width:5px;height:5px;border-radius:50%;}

        .hero{position:relative;z-index:10;min-height:calc(100vh - 115px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:50px 24px 40px;}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.16);border-radius:100px;padding:7px 20px;margin-bottom:28px;animation:borderGlow 4s ease infinite,fadeUp 0.7s ease 0.15s both;}
        .pdot{width:7px;height:7px;border-radius:50%;background:#00ff88;animation:blink 1.8s ease infinite;}
        h1{font-size:clamp(46px,8.5vw,94px);font-weight:900;line-height:1.01;letter-spacing:-0.04em;margin-bottom:22px;animation:fadeUp 1.1s cubic-bezier(0.19, 1, 0.22, 1) 0.25s both;}
        .grad{background:linear-gradient(105deg,#00ff88 0%,#00ddff 25%,#ff4466 50%,#00ddff 75%,#00ff88 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 6s linear infinite;}
        .hsub{font-size:clamp(14px,1.8vw,18px);color:rgba(255,255,255,0.36);max-width:520px;line-height:1.88;margin-bottom:38px;animation:fadeUp 0.7s ease 0.35s both;font-family:'JetBrains Mono',monospace;}
        .ctas{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:48px;animation:fadeUp 0.7s ease 0.45s both;}

        .twrap{width:100%;max-width:700px;animation:fadeUp 0.7s ease 0.55s both;}
        .terminal{background:#060810;border:1px solid rgba(0,255,136,0.12);border-radius:18px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,0.9),0 0 60px rgba(0,255,136,0.04);position:relative;}
        .terminal::before{content:'';position:absolute;left:0;right:0;height:1px;top:0;background:linear-gradient(90deg,transparent,rgba(0,255,136,0.5),transparent);animation:scanLine 5s ease infinite;}
        .tbar{background:#0c0f1a;padding:13px 18px;display:flex;align-items:center;gap:7px;border-bottom:1px solid rgba(255,255,255,0.04);}
        .dot{width:11px;height:11px;border-radius:50%;}
        .ttitle{margin-left:10px;font-size:12px;color:rgba(255,255,255,0.16);font-family:'JetBrains Mono',monospace;}
        .tbody{padding:18px 22px;min-height:140px;display:flex;flex-direction:column;gap:4px;}
        .tline{font-size:13px;font-family:'JetBrains Mono',monospace;padding:2px 0;line-height:1.55;}
        .tdone{opacity:0.35;}.tok{color:#00ff88;opacity:1;}.terr{color:#ff4466;opacity:1;}.twarn{color:#ff9500;opacity:1;}
        .cursor{display:inline-block;width:8px;height:14px;background:#00ff88;vertical-align:middle;margin-left:2px;animation:blink 1s ease infinite;}

        .stats{position:relative;z-index:10;padding:44px 52px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:1000px;margin:0 auto;border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04);}
        .stat{text-align:center;padding:16px;border-radius:16px;background:rgba(255,255,255,0.012);border:1px solid rgba(255,255,255,0.05);transition:all 0.3s;}
        .stat:hover{border-color:rgba(0,255,136,0.22);background:rgba(0,255,136,0.03);transform:translateY(-3px);}
        .sn{font-size:32px;font-weight:900;color:#00ff88;letter-spacing:-0.03em;margin-bottom:4px;}
        .sl{font-size:12px;color:rgba(255,255,255,0.26);font-family:'JetBrains Mono',monospace;}

        .section{position:relative;z-index:10;padding:96px 52px;text-align:center;}
        .sec-tag{font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#00ff88;margin-bottom:14px;font-family:'JetBrains Mono',monospace;}
        .sec-title{font-size:clamp(28px,4vw,52px);font-weight:900;letter-spacing:-0.03em;margin-bottom:14px;line-height:1.08;}
        .sec-sub{font-size:16px;color:rgba(255,255,255,0.32);max-width:500px;line-height:1.8;margin:0 auto 52px;font-family:'JetBrains Mono',monospace;}

        .tilt-wrap{position:relative;transform-style:preserve-3d;will-change:transform;}
        .tilt-glow{position:absolute;inset:0;pointer-events:none;transition:opacity 0.4s;border-radius:inherit;z-index:2;mix-blend-mode:screen;}

        .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:1080px;margin:0 auto;}
        .card{background:rgba(255,255,255,0.013);border:1px solid rgba(255,255,255,0.06);border-radius:22px;padding:32px;transition:all 0.5s cubic-bezier(0.2,0.8,0.2,1);cursor:pointer;position:relative;overflow:hidden;height:100%;}
        .tilt-wrap:hover .card{border-color:rgba(0,255,136,0.4);box-shadow:0 24px 48px rgba(0,0,0,0.8),0 0 40px rgba(0,255,136,0.08);}
        .cico{width:52px;height:52px;border-radius:14px;background:rgba(0,255,136,0.07);border:1px solid rgba(0,255,136,0.16);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:18px;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);}
        .tilt-wrap:hover .cico{background:rgba(0,255,136,0.18);transform:scale(1.12) rotate(6deg);box-shadow:0 0 20px rgba(0,255,136,0.2);}
        .cnum{font-size:56px;font-weight:900;color:rgba(255,255,255,0.022);float:right;line-height:1;letter-spacing:-0.04em;}
        .ctit{font-size:18px;font-weight:800;margin-bottom:10px;letter-spacing:-0.02em;transform:translateZ(10px);}
        .cdesc{font-size:13px;color:rgba(255,255,255,0.32);line-height:1.8;font-family:'JetBrains Mono',monospace;transform:translateZ(5px);}

        .vwrap{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:860px;margin:0 auto 52px;}
        .vb{padding:9px 18px;border-radius:100px;font-size:12px;font-weight:700;cursor:default;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);border-width:1px;border-style:solid;font-family:'JetBrains Mono',monospace;}
        .vb:hover{transform:translateY(-5px) scale(1.06);}
        .vc{background:rgba(255,68,102,0.07);border-color:rgba(255,68,102,0.25);color:#ff4466;}
        .vh{background:rgba(255,149,0,0.07);border-color:rgba(255,149,0,0.25);color:#ff9500;}
        .vm{background:rgba(255,200,0,0.07);border-color:rgba(255,200,0,0.25);color:#ffc800;}

        .cgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;max-width:940px;margin:0 auto;}
        .ccard{background:rgba(255,255,255,0.016);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:18px;display:flex;align-items:center;gap:14px;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);cursor:pointer;height:100%;}
        .tilt-wrap:hover .ccard{border-color:rgba(0,255,136,0.3);box-shadow:0 16px 48px rgba(0,0,0,0.6),0 0 20px rgba(0,255,136,0.05);}
        .tilt-wrap:hover .csco{transform:scale(1.08);}
        .csco{min-width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;font-family:'JetBrains Mono',monospace;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);}
        .cna{font-size:13px;font-weight:800;margin-bottom:3px;letter-spacing:-0.01em;transform:translateZ(6px);}
        .cds{font-size:11px;color:rgba(255,255,255,0.27);font-family:'JetBrains Mono',monospace;transform:translateZ(3px);}

        .tech-row{display:flex;flex-wrap:wrap;justify-content:center;gap:48px;align-items:center;}
        .tech-item{color:rgba(255,255,255,0.17);font-weight:700;font-size:14px;cursor:default;transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1);font-family:'JetBrains Mono',monospace;}
        .tech-item:hover{color:rgba(255,255,255,0.75);transform:translateY(-2px);}

        .cta-wrap{position:relative;z-index:10;text-align:center;padding:96px 52px;}
        .cta-box{max-width:680px;margin:0 auto;background:rgba(0,255,136,0.018);border:1px solid rgba(0,255,136,0.1);border-radius:32px;padding:76px 56px;position:relative;overflow:hidden;animation:borderGlow 4s ease infinite;}
        .cta-box::before{content:'';position:absolute;top:-100px;left:50%;transform:translateX(-50%);width:460px;height:460px;border-radius:50%;background:radial-gradient(circle,rgba(0,255,136,0.055),transparent 70%);}
        .cta-title{font-size:clamp(26px,3.8vw,44px);font-weight:900;letter-spacing:-0.03em;margin-bottom:14px;}
        .cta-sub{font-size:16px;color:rgba(255,255,255,0.32);margin-bottom:38px;line-height:1.7;font-family:'JetBrains Mono',monospace;}

        footer{position:relative;z-index:10;border-top:1px solid rgba(255,255,255,0.05);padding:28px 52px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,0.15);font-family:'JetBrains Mono',monospace;}
        .fbrand{color:#00ff88;font-weight:700;}

        @media(max-width:768px){nav{padding:14px 20px;}.section{padding:60px 20px;}.stats{grid-template-columns:repeat(2,1fr);padding:32px 20px;}.cta-box{padding:44px 24px;}footer{flex-direction:column;gap:8px;text-align:center;}}
      `}</style>

      {/* SPLASH */}
      {splash&&(
        <div className={`splash${splashFade?' fade':''}`}>
          <MatrixRain/>
          <div className="sc">
            <div className="sring"><span className="sicon">🛡</span></div>
            <div className="sname">Cyber<span style={{color:'#00ff88'}}>Sentry</span>
              <span style={{fontSize:'13px',marginLeft:'10px',background:'rgba(0,255,136,0.1)',color:'#00ff88',padding:'3px 10px',borderRadius:'20px',border:'1px solid rgba(0,255,136,0.28)',fontWeight:700,verticalAlign:'middle',fontFamily:"'JetBrains Mono',monospace"}}>AI</span>
            </div>
            <div className="stag">Agentic Security · OWASP Top 10</div>
            <div className="sbar">
              <div className="strack"><div className="sfill"/></div>
              <div className="spct">Loading...</div>
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED BG */}
      {!splash&&(
        <>
          <div className="bg-glow" style={{
            top:activeSec===0?'20%':activeSec===2?'60%':activeSec===4?'10%':'40%',
            left:activeSec===0?'25%':activeSec===3?'60%':activeSec===5?'30%':'10%',
            width:'45vw',height:'45vw',
            transform:`translate(${mousePos.x*-30}px, ${mousePos.y*-30}px)`,
            transition: 'all 2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <div className="bg-glow-inner" style={{
              background:`radial-gradient(circle, ${activeSec%2===0?'rgba(0,255,136,0.15)':'rgba(0,200,255,0.15)'}, transparent 70%)`,
              animationDelay:'0s'
            }}/>
          </div>
          <div className="bg-glow" style={{
            bottom:activeSec===0?'10%':activeSec===3?'70%':activeSec===5?'5%':'30%',
            right:activeSec===0?'15%':activeSec===2?'50%':activeSec===4?'80%':'10%',
            width:'55vw',height:'55vw',
            transform:`translate(${mousePos.x*40}px, ${mousePos.y*40}px)`,
            transition: 'all 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>
            <div className="bg-glow-inner" style={{
              background:`radial-gradient(circle, ${activeSec%3===0?'rgba(0,200,255,0.12)':'rgba(0,255,136,0.12)'}, transparent 70%)`,
              animationDelay:'-7s'
            }}/>
          </div>
          <HeroBG mx={mousePos.x} my={mousePos.y}/>
        </>
      )}

      {/* NAV */}
      <nav className={scrolled?'scrolled':''} style={{opacity:visible?1:0,pointerEvents:visible?'auto':'none'}}>
        <div className="nlogo" onClick={()=>router.push('/')}>
          <div className="nico">🛡</div>
          <span style={{fontSize:'17px',fontWeight:900,letterSpacing:'-0.02em'}}>Cyber<span style={{color:'#00ff88'}}>Sentry</span></span>
          <span className="nbadge">AI</span>
        </div>
        <div className="nlinks">
          <ProximityGlow><AnimatedButton variant="outline" className="nlink" onClick={()=>router.push('/login')}>Login</AnimatedButton></ProximityGlow>
          <ProximityGlow><AnimatedButton variant="primary" className="nstart" onClick={()=>router.push('/login')}>Start Free →</AnimatedButton></ProximityGlow>
        </div>
      </nav>

      {/* LIVE TICKER */}
      <div className="ticker" style={{opacity:visible?1:0,transition:'opacity 0.9s ease 0.3s'}}>
        <div className="ttrack">
          {[...Array(2)].map((_,rep)=>(
            <span key={rep} style={{display:'contents'}}>
              {[
                {dot:'#00ff88',txt:'Vulnerabilities today: ',val:<LiveCounter/>},
                {dot:'#ff9500',txt:'Agent status: ',val:<span style={{color:'#ff9500'}}>ONLINE</span>},
                {dot:'#4488ff',txt:'OWASP coverage: ',val:<span style={{color:'#4488ff'}}>100%</span>},
                {dot:'#ff4466',txt:'Critical blocked: ',val:<span style={{color:'#ff4466'}}>2,341</span>},
                {dot:'#00ff88',txt:'Avg scan time: ',val:<span style={{color:'#00ff88'}}>&lt;4.2s</span>},
                {dot:'#ffc800',txt:'Languages: ',val:<span style={{color:'#ffc800'}}>9</span>},
              ].map((item,i)=>(
                <div key={`${rep}-${i}`} className="titem">
                  <div className="tdot" style={{background:item.dot}}/>
                  <span>{item.txt}<span style={{fontWeight:700,color:'white'}}>{item.val}</span></span>
                  <span style={{opacity:0.18,marginLeft:'18px'}}>◆</span>
                </div>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* PAGE */}
      <div className={`page${visible?' show':''}`}>

        {/* HERO */}
        <SectionObserver onVisible={(v)=>v && setActiveSec(0)}>
          <div className="hero">
            <Reveal delay={0.1}><div className="eyebrow">
              <div className="pdot"/>
              <span style={{fontSize:'12px',color:'#00ff88',fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>Agentic AI · Chain-of-Thought · OWASP Top 10</span>
            </div></Reveal>
            <Reveal delay={0.25}><h1>Your Code's<br/><span className="grad"><Glitch text="AI Security Guard"/></span></h1></Reveal>
            <Reveal delay={0.4}><p className="hsub">An autonomous agent that thinks like a<br/>senior security engineer — in real time.</p></Reveal>
            <Reveal delay={0.55}><div className="ctas">
              <AnimatedButton variant="primary" onClick={()=>router.push('/login')}>🛡 Scan My Code Free</AnimatedButton>
              <AnimatedButton variant="outline" onClick={()=>router.push('/scan')}>👁 Live Demo</AnimatedButton>
            </div></Reveal>
            <Reveal delay={0.7}><div className="twrap">
              <div className="terminal">
                <div className="tbar">
                  <div className="dot" style={{background:'#ff5f56'}}/><div className="dot" style={{background:'#ffbd2e'}}/><div className="dot" style={{background:'#27c93f'}}/>
                  <span className="ttitle">cyber-sentry — agent output [live]</span>
                </div>
                <div className="tbody">
                  {done.map((l,i)=><div key={i} className={`tline tdone ${l.includes('✅')||l.includes('🎉')?'tok':l.includes('🚨')?'terr':l.includes('🔧')||l.includes('🔄')?'twarn':''}`}>{l}</div>)}
                  <div className="tline" style={{color:'#00ff88'}}>{text}<span className="cursor"/></div>
                </div>
              </div>
            </div></Reveal>
          </div>
        </SectionObserver>

        {/* STATS */}
        <Reveal>
          <div className="stats">
            {[{n:'OWASP',l:'Top 10 Covered'},{n:'3-Step',l:'Agentic Loop'},{n:'4→96',l:'Score Delta'},{n:'<5s',l:'Scan Speed'}].map((s,i)=>(
              <div className="stat" key={i}><div className="sn">{s.n}</div><div className="sl">{s.l}</div></div>
            ))}
          </div>
        </Reveal>

        {/* HOW IT WORKS */}
        <SectionObserver onVisible={(v)=>v && setActiveSec(2)}>
          <div className="section">
            <Reveal><p className="sec-tag">The Agent Loop</p></Reveal>
            <Reveal delay={0.1}><h2 className="sec-title">How CyberSentry <Glitch text="Thinks"/></h2></Reveal>
            <Reveal delay={0.15}><p className="sec-sub">Watch AI reason through every vulnerability — not just detect, but explain and patch</p></Reveal>
            <div className="cards">
              {[
                {i:'🔍',n:'01',t:'Analyze & Reason',d:'Scans full codebase, builds vulnerability map via chain-of-thought — every decision visible in real time.'},
                {i:'⚡',n:'02',t:'Generate Patches',d:'Writes production-ready secure code with parameterized queries, env variables, path validation, explaining each change.'},
                {i:'🔒',n:'03',t:'Verify & Score',d:'Re-scans patched code to confirm all fixes, issues an industry-standard CVSS security score showing exact improvement.'},
              ].map((c,i)=>(
                <Reveal key={i} delay={i*0.12}>
                  <ProximityGlow className="card-box-glow">
                    <TiltCard className="card-box">
                      <div className="card">
                        <span className="cnum">{c.n}</span>
                        <div className="cico">{c.i}</div>
                        <div className="ctit">{c.t}</div>
                        <div className="cdesc">{c.d}</div>
                      </div>
                    </TiltCard>
                  </ProximityGlow>
                </Reveal>
              ))}
            </div>
          </div>
        </SectionObserver>

        {/* VULNS + CVSS */}
        <div className="section" style={{background:'rgba(255,255,255,0.007)',borderTop:'1px solid rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          <Reveal><p className="sec-tag">Detection Coverage</p></Reveal>
          <Reveal delay={0.1}><h2 className="sec-title">What We Find</h2></Reveal>
          <Reveal delay={0.15}><p className="sec-sub">Full OWASP Top 10 · 9 languages · CVSS scoring</p></Reveal>
          
          <div className="vwrap">
            {[{n:'SQL Injection',s:'c'},{n:'XSS',s:'h'},{n:'Path Traversal',s:'h'},{n:'Hardcoded Secrets',s:'h'},{n:'Command Injection',s:'c'},{n:'CSRF',s:'m'},{n:'Broken Auth',s:'c'},{n:'Insecure Deserialization',s:'h'},{n:'Security Misconfiguration',s:'m'},{n:'Sensitive Data Exposure',s:'h'}].map((v,i)=>(
              <Reveal key={i} delay={0.1 + i * 0.04} distance={20} direction="up">
                <span className={`vb v${v.s}`}>{v.n}</span>
              </Reveal>
            ))}
          </div>
          
          <Reveal delay={0.2}><p className="sec-tag" style={{marginBottom:'22px'}}>CVSS Industry Scoring</p></Reveal>
          <div className="cgrid">
            {[
              {s:'9.8',n:'SQL Injection',     d:'Remote code execution',   bg:'rgba(255,68,102,0.08)', b:'rgba(255,68,102,0.22)', c:'#ff4466'},
              {s:'9.0',n:'Command Injection', d:'Arbitrary code execution', bg:'rgba(255,68,102,0.06)', b:'rgba(255,68,102,0.18)', c:'#ff4466'},
              {s:'8.2',n:'Hardcoded Secrets', d:'Credential exposure',     bg:'rgba(255,149,0,0.08)',  b:'rgba(255,149,0,0.22)',  c:'#ff9500'},
              {s:'7.5',n:'Path Traversal',    d:'File system bypass',      bg:'rgba(255,149,0,0.06)',  b:'rgba(255,149,0,0.18)',  c:'#ff9500'},
              {s:'6.1',n:'XSS',               d:'Client-side injection',   bg:'rgba(255,200,0,0.07)',  b:'rgba(255,200,0,0.2)',   c:'#ffc800'},
              {s:'5.3',n:'CSRF',              d:'Cross-site forgery',      bg:'rgba(68,136,255,0.07)', b:'rgba(68,136,255,0.2)',  c:'#4488ff'},
            ].map((cv,i)=>(
              <Reveal key={i} delay={0.15 + i * 0.08} distance={30} direction="up">
                <ProximityGlow className="ccard-box-glow">
                  <TiltCard className="ccard-box">
                    <div className="ccard">
                      <div className="csco" style={{background:cv.bg,border:`1px solid ${cv.b}`,color:cv.c}}>{cv.s}</div>
                      <div><div className="cna">{cv.n}</div><div className="cds">{cv.d}</div></div>
                    </div>
                  </TiltCard>
                </ProximityGlow>
              </Reveal>
            ))}
          </div>
        </div>

        {/* TECH STACK */}
        <div className="section" style={{paddingTop:'60px',paddingBottom:'60px'}}>
          <Reveal>
            <p style={{fontSize:'10px',letterSpacing:'0.24em',textTransform:'uppercase',color:'rgba(255,255,255,0.13)',marginBottom:'32px',fontFamily:"'JetBrains Mono',monospace"}}>Powered By</p>
          </Reveal>
          <div className="tech-row">
            {['Next.js 14','Claude API','Supabase','TypeScript','Vercel','Tailwind CSS'].map((t,i)=>(
              <Reveal key={i} delay={0.1 + i * 0.08} distance={20} direction="up">
                <span className="tech-item">{t}</span>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <SectionObserver onVisible={(v)=>v && setActiveSec(5)}>
          <div className="cta-wrap">
            <Reveal>
              <div className="cta-box">
                <p className="sec-tag" style={{marginBottom:'18px'}}>Get Started Free</p>
                <h2 className="cta-title">Ready to <Glitch text="Secure"/> Your Code?</h2>
                <p className="cta-sub">Paste code, watch the AI agent work in real-time,<br/>get production-ready patches in seconds.</p>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <AnimatedButton variant="primary" onClick={()=>router.push('/login')} className="nstart">
                    Start Scanning Free →
                  </AnimatedButton>
                </div>
              </div>
            </Reveal>
          </div>
        </SectionObserver>

        <footer>
          <span>© 2026 <span className="fbrand">CyberSentry AI</span></span>
          <span>Built for Hackathon · Nischay Bansal</span>
        </footer>
      </div>
    </>
  )
}