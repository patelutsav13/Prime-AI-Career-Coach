import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

export default function Logo3D({ size = 'medium', showText = true }) {
  // Size presets
  const iconSizes = {
    small: 'w-8 h-8 text-base',
    medium: 'w-10 h-10 text-xl',
    large: 'w-14 h-14 text-2xl',
  };

  const textSizes = {
    small: 'text-base',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  const subTextSizes = {
    small: 'text-[9px]',
    medium: 'text-[10px]',
    large: 'text-[12px]',
  };

  return (
    <div className="flex items-center space-x-3 group cursor-pointer [perspective:1000px]">
      {/* 3D Animated Emblem Badge */}
      <motion.div
        whileHover={{
          rotateY: 18,
          rotateX: -12,
          scale: 1.1,
          transition: { type: 'spring', stiffness: 400, damping: 20 }
        }}
        className={`relative ${iconSizes[size]} rounded-xl flex items-center justify-center transition-all duration-300 [transform-style:preserve-3d] shadow-[0_0_20px_rgba(0,210,255,0.4)] group-hover:shadow-[0_0_30px_rgba(210,0,255,0.6)]`}
      >
        {/* Background Metallic & Glowing Pedestal Gradients */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg">
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#12002b] via-[#090018] to-[#030014] flex items-center justify-center relative overflow-hidden">
            {/* Glowing Circuit Lines overlay */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00f6ff_1px,transparent_1px)] [background-size:6px_6px]" />
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-400/30 rounded-full blur-sm animate-pulse" />
            <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-purple-500/30 rounded-full blur-sm animate-pulse" />
          </div>
        </div>

        {/* 3D Chip Core Icon */}
        <div className="relative z-10 flex items-center justify-center [transform:translateZ(15px)]">
          <FiCpu className="text-white drop-shadow-[0_0_8px_rgba(0,246,255,0.9)] animate-pulse" />
        </div>

        {/* Glossy Reflection Sheen */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
      </motion.div>

      {/* 3D Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-extrabold tracking-wider font-orbitron bg-gradient-to-r from-amber-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,210,255,0.3)] transition-all duration-300 group-hover:brightness-125`}>
            PRIME AI
          </span>
          <span className={`${subTextSizes[size]} text-cyan-400 uppercase tracking-widest font-semibold leading-none flex items-center space-x-1`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
            Career Coach
          </span>
        </div>
      )}
    </div>
  );
}
