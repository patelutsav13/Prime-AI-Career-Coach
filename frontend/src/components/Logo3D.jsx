import React from 'react';
import { motion } from 'framer-motion';

export default function Logo3D({ size = 'medium', showText = true }) {
  // Size configurations
  const iconDimensions = {
    small: 'w-9 h-9',
    medium: 'w-11 h-11',
    large: 'w-16 h-16',
  };

  const primeTextSizes = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-3xl',
  };

  const subTextSizes = {
    small: 'text-[8px]',
    medium: 'text-[9px]',
    large: 'text-[11px]',
  };

  return (
    <div className="flex items-center space-x-3 group cursor-pointer [perspective:1000px] select-none">
      {/* 3D Animated Gold & Silver Brain Shield Emblem (Matching reference image 1) */}
      <motion.div
        whileHover={{
          rotateY: 20,
          rotateX: -10,
          scale: 1.08,
          transition: { type: 'spring', stiffness: 380, damping: 22 }
        }}
        className={`relative ${iconDimensions[size]} flex items-center justify-center [transform-style:preserve-3d] transition-all duration-300`}
      >
        {/* Continuous Ambient Lighting Pulse Glow */}
        <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md animate-logo-pulse" />

        {/* 3D Shield & Neural AI Brain Emblem SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate-logo-pulse [transform:translateZ(10px)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Silver Gradient */}
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#cbd5e1" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>

            {/* Metallic Gold Gradient */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="75%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>

            {/* Glowing Core Radial */}
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Shield Frame (Silver & Gold Dual Metallic Border) */}
          <path
            d="M50 8 L82 20 V48 C82 68 68 84 50 92 C32 84 18 68 18 48 V20 L50 8 Z"
            fill="url(#coreGlow)"
            stroke="url(#silverGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Bevel Accent */}
          <path
            d="M50 14 L76 24 V46 C76 63 64 77 50 84 C36 77 24 63 24 46 V24 L50 14 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Neural Brain Circuit Network Lines */}
          <g stroke="url(#silverGrad)" strokeWidth="1.2" opacity="0.85">
            <line x1="34" y1="36" x2="50" y2="28" />
            <line x1="66" y1="36" x2="50" y2="28" />
            <line x1="34" y1="36" x2="30" y2="52" />
            <line x1="66" y1="36" x2="70" y2="52" />
            <line x1="30" y1="52" x2="50" y2="68" />
            <line x1="70" y1="52" x2="50" y2="68" />
            <line x1="50" y1="28" x2="50" y2="68" />
            <line x1="34" y1="36" x2="66" y2="36" />
          </g>

          {/* Glowing Neural Spheres / Nodes */}
          <circle cx="50" cy="28" r="3.5" fill="url(#goldGrad)" />
          <circle cx="34" cy="36" r="3" fill="url(#silverGrad)" />
          <circle cx="66" cy="36" r="3" fill="url(#silverGrad)" />
          <circle cx="30" cy="52" r="3" fill="url(#goldGrad)" />
          <circle cx="70" cy="52" r="3" fill="url(#goldGrad)" />
          <circle cx="50" cy="68" r="4" fill="url(#goldGrad)" />

          {/* Center 3D Gold "AI" Emblem Text */}
          <text
            x="50"
            y="54"
            textAnchor="middle"
            dominantBaseline="central"
            fill="url(#goldGrad)"
            fontSize="22"
            fontWeight="900"
            fontFamily="'Orbitron', sans-serif"
            stroke="#451a03"
            strokeWidth="0.8"
            style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
          >
            AI
          </text>
        </svg>

        {/* Glossy Sheen Highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
      </motion.div>

      {/* 3D Typography with Left-to-Right P-to-I Lighting Sweep */}
      {showText && (
        <div className="flex flex-col relative overflow-hidden py-0.5">
          {/* Continuous Left to Right Shine Shadow / Light Beam Sweep (P to I) */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="w-12 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-logo-shine opacity-75" />
          </div>

          <div className="flex items-center space-x-1.5 leading-none">
            {/* PRIME: 3D Metallic Silver */}
            <span
              className={`${primeTextSizes[size]} font-black font-orbitron tracking-wider bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent`}
              style={{
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.9)'
              }}
            >
              PRIME
            </span>

            {/* AI: 3D Metallic Gold */}
            <span
              className={`${primeTextSizes[size]} font-black font-orbitron tracking-wider bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent`}
              style={{
                textShadow: '0 2px 8px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(0, 0, 0, 0.9)'
              }}
            >
              AI
            </span>
          </div>

          {/* CAREER COACH: Metallic Gold Subtitle with Lighting Glow */}
          <span className={`${subTextSizes[size]} text-amber-300/90 font-bold uppercase tracking-[0.25em] font-orbitron mt-1 flex items-center space-x-1.5`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-cyan-300 bg-clip-text text-transparent">
              CAREER COACH
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
