'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/* ── ANIMATED BACKGROUND CANVAS ── */
function LoginBG() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')!
    let W = c.width = window.innerWidth
    let H = c.height = window.innerHeight
    const onResize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    /* Particles */
    type P = {x:number;y:number;vx:number;vy:number;r:number;opacity:number;pulse:number}
    const particles: P[] = Array.from({length: 70}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*0.4, vy: (Math.random()-.5)*0.4,
      r: Math.random()*1.8+0.4,
      opacity: Math.random()*0.5+0.1,
      pulse: Math.random()*Math.PI*2,
    }))

    /* Floating orbs */
    type Orb = {x:number;y:number;r:number;vx:number;vy:number;hue:number;phase:number}
    const orbs: Orb[] = [
      {x:W*0.15, y:H*0.3,  r:180, vx:0.15, vy:0.08, hue:145, phase:0},
      {x:W*0.85, y:H*0.7,  r:220, vx:-0.12, vy:0.1, hue:190, phase:1},
      {x:W*0.5,  y:H*0.85, r:150, vx:0.1,  vy:-0.15, hue:160, phase:2},
    ]

    let t = 0, frame: number

    function draw() {
      ctx.clearRect(0,0,W,H)
      t += 0.008

      /* Orb blobs */
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy
        if(o.x < -o.r || o.x > W+o.r) o.vx *= -1
        if(o.y < -o.r || o.y > H+o.r) o.vy *= -1
        const pulse = Math.sin(t + o.phase) * 0.2 + 0.8
        const gr = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r*pulse)
        gr.addColorStop(0, `hsla(${o.hue},100%,60%,0.055)`)
        gr.addColorStop(0.5, `hsla(${o.hue},100%,50%,0.025)`)
        gr.addColorStop(1, 'transparent')
        ctx.fillStyle = gr; ctx.fillRect(0,0,W,H)
      })

      /* Particles */
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.025
        if(p.x < 0) p.x = W; if(p.x > W) p.x = 0
        if(p.y < 0) p.y = H; if(p.y > H) p.y = 0
        const alpha = p.opacity * (Math.sin(p.pulse)*0.3+0.7)
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle = `rgba(0,255,136,${alpha})`
        ctx.fill()
      })

      /* Connection lines */
      for(let i=0;i<particles.length;i++) {
        for(let j=i+1;j<particles.length;j++) {
          const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y
          const d=Math.sqrt(dx*dx+dy*dy)
          if(d<110) {
            ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y)
            ctx.strokeStyle=`rgba(0,255,136,${0.08*(1-d/110)})`; ctx.lineWidth=0.6; ctx.stroke()
          }
        }
      }

      /* Scan lines */
      const scanY = ((t * 80) % (H + 100)) - 50
      const sg = ctx.createLinearGradient(0,scanY-30,0,scanY+30)
      sg.addColorStop(0,'transparent'); sg.addColorStop(0.5,'rgba(0,255,136,0.04)'); sg.addColorStop(1,'transparent')
      ctx.fillStyle=sg; ctx.fillRect(0,scanY-30,W,60)

      /* HEX grid subtle */
      const HEX = 44, HW = HEX*Math.sqrt(3)
      const cols2 = Math.ceil(W/HW)+2, rows2 = Math.ceil(H/HEX)+2
      for(let row=-1;row<rows2;row++){for(let col=-1;col<cols2;col++){
        const x=col*HW+(row%2)*HW/2, y=row*HEX*1.5
        ctx.beginPath()
        for(let k=0;k<6;k++){const a=Math.PI/3*k-Math.PI/6; k===0?ctx.moveTo(x+HEX*0.42*Math.cos(a),y+HEX*0.42*Math.sin(a)):ctx.lineTo(x+HEX*0.42*Math.cos(a),y+HEX*0.42*Math.sin(a))}
        ctx.closePath(); ctx.strokeStyle='rgba(0,255,136,0.028)'; ctx.lineWidth=0.5; ctx.stroke()
      }}

      /* Vignette */
      const vig = ctx.createRadialGradient(W/2,H/2,H*0.1,W/2,H/2,H*0.85)
      vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(3,4,8,0.6)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)

      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize',onResize) }
  }, [])
  return <canvas ref={ref} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>
}

/* ── FLOATING CODE SNIPPETS (decorative) ── */
function FloatingCode() {
  const snippets = [
    'SELECT * FROM users WHERE id=?',
    'os.environ.get("SECRET_KEY")',
    'cursor.execute(query, params)',
    'Path.resolve().startswith(safe)',
    'OWASP A01: Broken Access Control',
    'CVSS Score: 9.8 CRITICAL',
    '# FIXED: parameterized query',
    'hash = bcrypt.hashpw(pwd, salt)',
  ]
  return (
    <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
      {snippets.map((s,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:`${5 + (i*12)%85}%`,
          top:`${8 + (i*17)%80}%`,
          fontSize:'10px',
          fontFamily:"'JetBrains Mono',monospace",
          color:'rgba(0,255,136,0.07)',
          whiteSpace:'nowrap',
          animation:`float${i%3} ${8+i%4}s ease infinite`,
          animationDelay:`${i*0.7}s`,
          transform:`rotate(${-15+i*5}deg)`,
        }}>{s}</div>
      ))}
    </div>
  )
}

/* ── MAIN ── */
export default function LoginPage() {
  const router = useRouter()
  const [email,setEmail]       = useState('')
  const [password,setPassword] = useState('')
  const [showPw,setShowPw]     = useState(false)
  const [isSignUp,setIsSignUp] = useState(false)
  const [loading,setLoading]   = useState(false)
  const [message,setMessage]   = useState<{type:'error'|'success';text:string}|null>(null)
  const [mounted,setMounted]   = useState(false)

  useEffect(()=>{ setTimeout(()=>setMounted(true),100) },[])

  const handleAuth = async () => {
    if(!email||!password){setMessage({type:'error',text:'Please fill in all fields'});return}
    setLoading(true); setMessage(null)
    try {
      if(isSignUp){
        const {error}=await supabase.auth.signUp({email,password})
        if(error) setMessage({type:'error',text:error.message})
        else setMessage({type:'success',text:'Account created! Check your email or sign in directly.'})
      } else {
        const {error}=await supabase.auth.signInWithPassword({email,password})
        if(error) setMessage({type:'error',text:error.message})
        else router.push('/scan')
      }
    } catch { setMessage({type:'error',text:'Something went wrong'}) }
    setLoading(false)
  }

  const handleForgot = async () => {
    if(!email){setMessage({type:'error',text:'Enter your email above first'});return}
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/scan`})
    setMessage(error?{type:'error',text:error.message}:{type:'success',text:'Password reset email sent!'})
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#030408;color:white;font-family:'Outfit',sans-serif;overflow:hidden;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float0{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-12px) rotate(-8deg)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(5deg)}50%{transform:translateY(-16px) rotate(5deg)}}
        @keyframes float2{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(-3deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glowBorder{0%,100%{border-color:rgba(0,255,136,0.15)}50%{border-color:rgba(0,255,136,0.45)}}
        @keyframes shimmerText{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes cardPop{0%{opacity:0;transform:translateY(30px) scale(0.97)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes radarPing{0%{transform:scale(0.5);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes scanLine{0%{top:-2px}100%{top:100%}}

        .page{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;overflow:hidden;}

        /* LEFT side branding */
        .left-brand{position:fixed;left:56px;top:50%;transform:translateY(-50%);z-index:10;max-width:380px;display:flex;flex-direction:column;gap:24px;animation:fadeUp 0.8s ease 0.2s both;}
        .brand-logo{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
        .brand-icon{width:52px;height:52px;border-radius:16px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.25);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 40px rgba(0,255,136,0.15);}
        .brand-name{font-size:26px;font-weight:900;letter-spacing:-0.03em;}
        .brand-tagline{font-size:36px;font-weight:900;line-height:1.15;letter-spacing:-0.035em;color:white;}
        .brand-tagline .g{background:linear-gradient(120deg,#00ff88,#00ccff,#00ff88);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmerText 4s linear infinite;}
        .brand-sub{font-size:15px;color:rgba(255,255,255,0.35);line-height:1.7;font-family:'JetBrains Mono',monospace;max-width:320px;}

        /* Stats row */
        .stats-row{display:flex;gap:16px;flex-wrap:wrap;}
        .stat-chip{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:10px 14px;text-align:center;}
        .stat-n{font-size:20px;font-weight:800;color:#00ff88;letter-spacing:-0.03em;}
        .stat-l{font-size:10px;color:rgba(255,255,255,0.25);font-family:'JetBrains Mono',monospace;margin-top:2px;}

        /* Radar decoration */
        .radar-deco{position:absolute;left:220px;bottom:-60px;width:180px;height:180px;opacity:0.12;}
        .ping{position:absolute;inset:0;border-radius:50%;border:1px solid #00ff88;animation:radarPing 3s ease-out infinite;}
        .ping2{animation-delay:1s;}.ping3{animation-delay:2s;}

        /* LOGIN CARD */
        .card{position:relative;z-index:10;width:100%;max-width:460px;background:rgba(8,10,18,0.85);border:1px solid rgba(255,255,255,0.08);border-radius:28px;padding:40px;backdrop-filter:blur(40px);box-shadow:0 40px 120px rgba(0,0,0,0.8),0 0 60px rgba(0,255,136,0.04);animation:${mounted?'cardPop 0.6s cubic-bezier(0.34,1.4,0.64,1) both':'none'};overflow:hidden;}
        .card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,136,0.4),transparent);}
        .card-scan{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,136,0.25),transparent);animation:scanLine 4s ease infinite;}

        .card-logo{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
        .cico{width:38px;height:38px;border-radius:11px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.22);display:flex;align-items:center;justify-content:center;font-size:17px;}
        .cname{font-size:17px;font-weight:800;letter-spacing:-0.02em;}

        .card-title{font-size:28px;font-weight:900;letter-spacing:-0.03em;margin-bottom:6px;}
        .card-sub{font-size:14px;color:rgba(255,255,255,0.35);margin-bottom:28px;font-family:'JetBrains Mono',monospace;}

        .field{margin-bottom:16px;}
        .field-label{font-size:12px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;margin-bottom:8px;display:block;}
        .input-wrap{position:relative;}
        .field-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 18px;color:white;font-size:15px;font-family:'Outfit',sans-serif;outline:none;transition:all 0.25s;font-weight:500;}
        .field-input::placeholder{color:rgba(255,255,255,0.22);}
        .field-input:focus{border-color:rgba(0,255,136,0.45);background:rgba(0,255,136,0.03);box-shadow:0 0 0 4px rgba(0,255,136,0.07);}
        .pw-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.3);font-size:18px;padding:4px;transition:color 0.2s;}
        .pw-toggle:hover{color:rgba(255,255,255,0.7);}

        .forgot{display:block;text-align:right;color:#00ff88;font-size:13px;font-weight:600;cursor:pointer;margin-top:-6px;margin-bottom:22px;background:none;border:none;font-family:'Outfit',sans-serif;transition:opacity 0.2s;}
        .forgot:hover{opacity:0.7;}

        .submit-btn{width:100%;background:linear-gradient(135deg,#00ff88,#00cc6a);color:#000;border:none;padding:16px;border-radius:16px;font-weight:900;font-size:17px;cursor:pointer;transition:all 0.25s;font-family:'Outfit',sans-serif;letter-spacing:-0.01em;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 28px rgba(0,255,136,0.3);margin-bottom:16px;}
        .submit-btn:hover{transform:translateY(-3px);box-shadow:0 12px 44px rgba(0,255,136,0.45);}
        .submit-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .spinner{width:18px;height:18px;border:2.5px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:spin 0.7s linear infinite;}

        .divider{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
        .divider-line{flex:1;height:1px;background:rgba(255,255,255,0.06);}
        .divider-text{font-size:12px;color:rgba(255,255,255,0.2);font-family:'JetBrains Mono',monospace;}

        .skip-btn{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);padding:13px;border-radius:14px;font-weight:600;font-size:14px;cursor:pointer;transition:all 0.2s;font-family:'Outfit',sans-serif;margin-bottom:20px;}
        .skip-btn:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.7);}

        .toggle-mode{text-align:center;font-size:14px;color:rgba(255,255,255,0.3);}
        .toggle-link{color:#00ff88;cursor:pointer;font-weight:700;background:none;border:none;font-size:14px;font-family:'Outfit',sans-serif;margin-left:4px;transition:opacity 0.2s;}
        .toggle-link:hover{opacity:0.7;}

        .msg{border-radius:12px;padding:12px 16px;font-size:13px;margin-bottom:16px;display:flex;align-items:flex-start;gap:10px;font-family:'JetBrains Mono',monospace;line-height:1.55;animation:fadeIn 0.3s ease;}
        .msg-error{background:rgba(255,68,102,0.08);border:1px solid rgba(255,68,102,0.22);color:#ff8899;}
        .msg-success{background:rgba(0,255,136,0.07);border:1px solid rgba(0,255,136,0.22);color:#00ff88;}

        /* Security badges on card */
        .sec-badges{display:flex;gap:6px;margin-bottom:24px;flex-wrap:wrap;}
        .sec-badge{font-size:10px;background:rgba(0,255,136,0.05);border:1px solid rgba(0,255,136,0.12);color:rgba(0,255,136,0.6);padding:3px 9px;border-radius:20px;font-family:'JetBrains Mono',monospace;}

        /* Back button */
        .back-btn{position:fixed;top:24px;left:24px;z-index:20;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);padding:9px 16px;border-radius:10px;cursor:pointer;font-size:14px;font-family:'Outfit',sans-serif;font-weight:600;transition:all 0.2s;display:flex;align-items:center;gap:6px;}
        .back-btn:hover{background:rgba(255,255,255,0.09);color:white;}

        @media(max-width:900px){.left-brand{display:none;}.page{justify-content:center;}}
        @media(max-width:500px){.card{padding:28px 22px;}.card-title{font-size:24px;}}
      `}</style>

      <LoginBG/>
      <FloatingCode/>

      {/* Back button */}
      <button className="back-btn" onClick={()=>router.push('/')}>← Back</button>

      {/* Left branding panel */}
      <div className="left-brand">
        <div>
          <div className="brand-logo">
            <div className="brand-icon">🛡</div>
            <span className="brand-name">Cyber<span style={{color:'#00ff88'}}>Sentry</span> <span style={{fontSize:'12px',background:'rgba(0,255,136,0.1)',border:'1px solid rgba(0,255,136,0.25)',color:'#00ff88',padding:'2px 8px',borderRadius:'20px',fontWeight:700,verticalAlign:'middle'}}>AI</span></span>
          </div>
          <div className="brand-tagline">
            Secure your code<br/>with <span className="g">AI-powered</span><br/>intelligence
          </div>
        </div>
        <div className="brand-sub">
          Autonomous agent that scans, reasons,<br/>patches and verifies your code instantly.
        </div>
        <div className="stats-row">
          {[{n:'OWASP',l:'Top 10'},{n:'96/100',l:'Max Score'},{n:'<5s',l:'Scan Time'},{n:'9 langs',l:'Supported'}].map((s,i)=>(
            <div className="stat-chip" key={i}>
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="radar-deco">
          <div className="ping"/><div className="ping ping2"/><div className="ping ping3"/>
        </div>
      </div>

      {/* Login card */}
      <div className="page" style={{justifyContent:'flex-end',paddingRight:'8vw'}}>
        <div className="card">
          <div className="card-scan" style={{top: 0}}/>

          <div className="card-logo">
            <div className="cico">🛡</div>
            <span className="cname">Cyber<span style={{color:'#00ff88'}}>Sentry</span></span>
            <span style={{fontSize:'11px',background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.2)',color:'#00ff88',padding:'2px 8px',borderRadius:'20px',fontWeight:700,marginLeft:'4px',fontFamily:"'JetBrains Mono',monospace"}}>AI</span>
          </div>

          <div className="card-title">{isSignUp?'Create Account':'Welcome Back'}</div>
          <div className="card-sub">{isSignUp?'Start securing your codebase today':'Continue securing your codebase'}</div>

          <div className="sec-badges">
            <span className="sec-badge">🔐 SSL Encrypted</span>
            <span className="sec-badge">🛡 OWASP Compliant</span>
            <span className="sec-badge">⚡ Instant Access</span>
          </div>

          {message&&(
            <div className={`msg ${message.type==='error'?'msg-error':'msg-success'}`}>
              <span>{message.type==='error'?'⚠️':'✅'}</span>
              <span>{message.text}</span>
            </div>
          )}

          <div className="field">
            <label className="field-label">Email</label>
            <div className="input-wrap">
              <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleAuth()} placeholder="you@example.com"/>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <input className="field-input" type={showPw?'text':'password'} value={password}
                onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAuth()}
                placeholder="••••••••" style={{paddingRight:'48px'}}/>
              <button className="pw-toggle" onClick={()=>setShowPw(p=>!p)}>{showPw?'🙈':'👁'}</button>
            </div>
          </div>

          {!isSignUp&&<button className="forgot" onClick={handleForgot}>Forgot password?</button>}

          <button className="submit-btn" onClick={handleAuth} disabled={loading}>
            {loading?<><span className="spinner"/>Processing...</>:<>{isSignUp?'Create Account →':'Sign In →'}</>}
          </button>

          <div className="divider"><div className="divider-line"/><div className="divider-text">or</div><div className="divider-line"/></div>

          <button className="skip-btn" onClick={()=>router.push('/scan')}>
            👁 Skip — View Demo (No account needed)
          </button>

          <div className="toggle-mode">
            {isSignUp?'Already have an account?':'Don\'t have an account?'}
            <button className="toggle-link" onClick={()=>{setIsSignUp(p=>!p);setMessage(null)}}>
              {isSignUp?'Sign In':'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}