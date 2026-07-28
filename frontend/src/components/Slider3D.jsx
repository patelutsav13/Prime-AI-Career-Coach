import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi';

export default function Slider3D({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full py-6 sm:py-10 [perspective:1200px] overflow-hidden">
      {/* 3D Container */}
      <div className="relative h-[380px] sm:h-[480px] w-full max-w-5xl mx-auto flex items-center justify-center [transform-style:preserve-3d]">
        {slides.map((slide, idx) => {
          // Calculate offset relative to current active slide
          let offset = idx - currentIndex;
          if (offset < -1) offset += slides.length;
          if (offset > 1) offset -= slides.length;

          const isActive = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;
          const isHidden = !isActive && !isLeft && !isRight;

          if (isHidden) return null;

          // 3D Transforms based on position
          let rotateY = 0;
          let translateX = '0%';
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;

          if (isLeft) {
            rotateY = 35;
            translateX = '-65%';
            scale = 0.8;
            opacity = 0.5;
            zIndex = 10;
          } else if (isRight) {
            rotateY = -35;
            translateX = '65%';
            scale = 0.8;
            opacity = 0.5;
            zIndex = 10;
          }

          return (
            <motion.div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              initial={false}
              animate={{
                rotateY,
                x: translateX,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 25,
              }}
              className={`absolute w-[88%] sm:w-[65%] h-[320px] sm:h-[420px] rounded-3xl overflow-hidden glass-panel border transition-all duration-500 cursor-pointer shadow-2xl ${
                isActive
                  ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(0,210,255,0.3)] ring-1 ring-cyan-400/30'
                  : 'border-white/10 hover:border-white/20 filter brightness-60'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Image with 3D Depth Overlay */}
              <div className="relative w-full h-3/5 overflow-hidden">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/30 to-transparent" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 text-[10px] font-bold font-orbitron text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
                  <FiZap className="animate-pulse" />
                  <span>{slide.tag || 'Tech Sector'}</span>
                </div>
              </div>

              {/* Content Box */}
              <div className="p-4 sm:p-6 bg-[#030014]/90 backdrop-blur-md h-2/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-2xl font-extrabold font-orbitron text-white tracking-wide">
                    {slide.title}
                  </h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300 font-light line-clamp-2 leading-relaxed">
                    {slide.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] sm:text-xs text-cyan-400 font-orbitron uppercase tracking-widest">
                  <span>3D Interactive Orbit</span>
                  <span className="text-gray-500">{idx + 1} / {slides.length}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls & Navigation */}
      <div className="flex items-center justify-center space-x-6 mt-4 z-40 relative">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-gray-300 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95"
          title="Previous Slide"
        >
          <FiChevronLeft className="text-xl" />
        </button>

        {/* Indicator Pills */}
        <div className="flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'bg-gradient-to-r from-cyan-400 to-purple-500 w-8' : 'bg-white/20 w-2.5 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-gray-300 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95"
          title="Next Slide"
        >
          <FiChevronRight className="text-xl" />
        </button>
      </div>
    </div>
  );
}
