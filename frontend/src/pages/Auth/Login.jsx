import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
const Login = () => {
  const [stage, setStage] = useState('off'); // 'off' | 'pulling' | 'on'
  const [ropeOffset, setRopeOffset] = useState(0); // how far rope is pulled (px)
  const [isDragging, setIsDragging] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dragStartY = useRef(0);
  const navigate = useNavigate();

  const lampOn = stage === 'on';
  const baseRope = 55;
  const ropeLength = baseRope + ropeOffset;
  
  // --- Drag handlers (works for mouse + touch) ---
  const handleDragStart = (e) => {
    if (stage === 'pulling') return;
    setIsDragging(true);
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = Math.max(0, Math.min(80, clientY - dragStartY.current));

    // If lamp is ON, allow pulling only if they pull DOWN (to turn off)
    setRopeOffset(delta);

    // If we cross threshold and lamp is OFF → turn ON
    if (delta > 40 && stage === 'off') {
      setStage('pulling');
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (stage === 'pulling') {
      // Complete the pull
      setTimeout(() => {
        setStage('on');
        setRopeOffset(0);
      }, 150);
    } else if (stage === 'on' && ropeOffset > 30) {
      // Turn OFF
      setStage('off');
      setRopeOffset(0);
    } else {
      // Snap back
      setRopeOffset(0);
    }
  };

  // Global listeners so drag continues even if cursor leaves the rope
  useEffect(() => {
    const onMove = (e) => handleDragMove(e);
    const onUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, stage, ropeOffset]);
   const { login, getDashboardPath } = useAuth();
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Login failed');
      return;
    }

    login(data.user, data.token);
    navigate(getDashboardPath(data.user.role));
  } catch (err) {
    alert('Server error. Is backend running?');
  }
};
  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-slate-900">

      {/* ==================== LEFT SIDE: LAMP SCENE ==================== */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center relative overflow-hidden select-none">

        {/* Twinkling stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${(i * 43) % 75}%`,
              left: `${(i * 61) % 100}%`,
              opacity: 0.2 + ((i * 7) % 60) / 100,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}

        {/* Title */}
        <div className="absolute top-10 left-0 right-0 text-center z-30 pointer-events-none">
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Department Management System
          </h1>
          <p className="mt-2 text-slate-400 text-sm transition-all duration-500">
            {stage === 'off' && !isDragging && 'Pull the cord to reveal login 🔌'}
            {isDragging && '🪢 Keep pulling...'}
            {stage === 'pulling' && '🪢 Almost there...'}
            {stage === 'on' && 'Let there be light ✨'}
          </p>
        </div>

        {/* Lamp scene container */}
        <div className="relative z-20" style={{ width: 420, height: 520 }}>

          {/* Ambient glow behind lamp (only when ON) */}
          <div
            className="absolute pointer-events-none transition-all duration-1000 ease-out"
            style={{
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 600,
              height: 600,
              opacity: lampOn ? 1 : 0,
              background:
                'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(253,224,71,0.15) 35%, transparent 70%)',
            }}
          ></div>

          {/* Light cone shining down */}
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-1000"
            style={{
              top: 215,
              width: 0,
              height: 0,
              borderLeft: '140px solid transparent',
              borderRight: '140px solid transparent',
              borderTop: '260px solid rgba(253,224,71,0.25)',
              filter: 'blur(4px)',
              opacity: lampOn ? 1 : 0,
            }}
          ></div>

          {/* ==================== SVG LAMP ==================== */}
          <svg
            viewBox="0 0 400 500"
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          >
            {/* Warm inner glow inside the shade when ON */}
            {lampOn && (
              <ellipse
                cx="200"
                cy="215"
                rx="115"
                ry="30"
                fill="#FDE047"
                opacity="0.95"
              />
            )}

            {/* Lampshade body — trapezoid */}
            <path
              d="M 130 110 L 270 110 L 320 215 L 80 215 Z"
              fill={lampOn ? '#7BC96F' : '#2A2F3A'}
              stroke={lampOn ? '#4E8B45' : '#1A1F28'}
              strokeWidth="3"
              strokeLinejoin="round"
              style={{ transition: 'all 800ms ease' }}
            />

            {/* Shade top ellipse */}
            <ellipse
              cx="200"
              cy="110"
              rx="70"
              ry="10"
              fill={lampOn ? '#6BB860' : '#232832'}
              stroke={lampOn ? '#4E8B45' : '#1A1F28'}
              strokeWidth="3"
              style={{ transition: 'all 800ms ease' }}
            />

            {/* Shade bottom rim */}
            <ellipse
              cx="200"
              cy="215"
              rx="120"
              ry="18"
              fill={lampOn ? '#5AA050' : '#1F242E'}
              stroke={lampOn ? '#4E8B45' : '#1A1F28'}
              strokeWidth="3"
              style={{ transition: 'all 800ms ease' }}
            />

            {/* FACE — Sleepy (OFF) */}
            <g
              style={{
                opacity: lampOn ? 0 : 1,
                transition: 'opacity 500ms ease',
              }}
            >
              <path
                d="M 165 155 Q 178 165 191 155"
                stroke="#4A5260"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 209 155 Q 222 165 235 155"
                stroke="#4A5260"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* FACE — Happy (ON) */}
            <g
              style={{
                opacity: lampOn ? 1 : 0,
                transition: 'opacity 500ms ease',
              }}
            >
              <ellipse cx="178" cy="155" rx="7" ry="10" fill="#1F2937" />
              <circle cx="180" cy="152" r="2.5" fill="white" />
              <ellipse cx="222" cy="155" rx="7" ry="10" fill="#1F2937" />
              <circle cx="224" cy="152" r="2.5" fill="white" />
              <path
                d="M 185 178 Q 200 192 215 178"
                stroke="#1F2937"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="160" cy="178" rx="6" ry="3" fill="#FF9AA2" opacity="0.6" />
              <ellipse cx="240" cy="178" rx="6" ry="3" fill="#FF9AA2" opacity="0.6" />
            </g>

            {/* Pole */}
            <rect
              x="195"
              y="215"
              width="10"
              height="180"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="290"
              r="5"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="1"
            />

            {/* Base */}
            <ellipse
              cx="200"
              cy="395"
              rx="75"
              ry="12"
              fill="#D1D5DB"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <ellipse
              cx="200"
              cy="390"
              rx="75"
              ry="12"
              fill="#F3F4F6"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Rope — stretches when dragging */}
            <rect
              x="99"
              y="215"
              width="2.5"
              height={ropeLength}
              fill="#1F2937"
              style={{
                transition: isDragging ? 'none' : 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />

            {/* Rope knob */}
            <circle
              cx="100.25"
              cy={215 + ropeLength + 5}
              r="7"
              fill="#FBBF24"
              stroke="#D97706"
              strokeWidth="1.5"
              style={{
                transition: isDragging ? 'none' : 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: isDragging ? 'drop-shadow(0 0 10px rgba(251,191,36,0.9))' : 'none',
              }}
            />
          </svg>

          {/* ==================== ROPE DRAG HANDLE ==================== */}
          {/* This is the invisible grab area the user's real cursor drags */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            className="absolute z-40"
            style={{
              left: 70,
              top: 240,
              width: 60,
              height: ropeLength + 40,
              cursor:
                stage === 'pulling'
                  ? 'grabbing'
                  : lampOn
                  ? 'grab'
                  : 'grab',
              transition: isDragging
                ? 'none'
                : 'height 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Pulsing ring hint (only when OFF) */}
            {stage === 'off' && !isDragging && (
              <>
                <span
                  className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-yellow-400/20 animate-ping"
                  style={{ bottom: -20 }}
                ></span>
                <span
                  className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-yellow-400/60"
                  style={{ bottom: -12 }}
                ></span>
              </>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <p className="absolute bottom-8 text-slate-500 text-sm z-30 pointer-events-none">
          {stage === 'off' && !isDragging && '👉 Drag the cord down'}
          {isDragging && stage === 'off' && '🪢 Pull harder...'}
          {stage === 'pulling' && '💡 Turning on...'}
          {stage === 'on' && '💡 Drag the cord again to turn off'}
        </p>
      </div>

      {/* ==================== RIGHT SIDE: LOGIN FORM ==================== */}
      <div
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 transition-all duration-1000 ease-out"
        style={{
          opacity: lampOn ? 1 : 0,
          transform: lampOn ? 'translateX(0)' : 'translateX(60px)',
          pointerEvents: lampOn ? 'auto' : 'none',
        }}
      >
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-slate-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@dms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
             Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
             Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;