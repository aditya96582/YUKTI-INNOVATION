import React from "react";

const AnimatedGridBg: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    {/* Mesh gradient orbs */}
    <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[100px] animate-float" />
    <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
    <div className="absolute top-[60%] left-[50%] w-[350px] h-[350px] bg-purple-500/[0.03] rounded-full blur-[100px] animate-float" style={{ animationDelay: '5s' }} />
    {/* Dot grid */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
      <defs>
        <pattern id="dotgrid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid)" />
    </svg>
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
  </div>
);

export default AnimatedGridBg;
