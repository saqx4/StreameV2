/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 SnoozeScript
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';

export const ReactiveGridBackground: React.FC = memo(() => {
  // Optimized grid for better performance
  const gridCols = 20;
  const gridRows = 12;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Static gradient background - no animation overhead */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900" />
      
      {/* Simplified grid with CSS animation instead of Framer Motion for better performance */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="grid-background"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${100 / gridCols}% ${100 / gridRows}%`,
            width: '100%',
            height: '100%'
          }}
        />
      </div>

      {/* Reduced animated dots for better performance - only 20 dots instead of 50 */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => {
          const x = (i % 5) * 20 + 10;
          const y = Math.floor(i / 5) * 25 + 10;
          const delay = i * 0.15;
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop"
              }}
            />
          );
        })}
      </div>
    </div>
  );
});
