'use client';

import React from 'react';

export default function CRTOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanlines-overlay opacity-30 mix-blend-overlay"></div>
      
      {/* CRT Flicker & Phosphor */}
      <div className="fixed inset-0 pointer-events-none z-[101] crt-flicker opacity-[0.03]"></div>
      
      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[102] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,10,15,0.8)_100%)]"></div>
    </>
  );
}
