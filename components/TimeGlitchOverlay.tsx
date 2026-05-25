'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface TimeGlitchOverlayProps {
  isGlitching: boolean;
}

export default function TimeGlitchOverlay({ isGlitching }: TimeGlitchOverlayProps) {
  const [renderGlitch, setRenderGlitch] = useState(false);

  useEffect(() => {
    if (isGlitching) {
      setRenderGlitch(true);
      const timer = setTimeout(() => setRenderGlitch(false), 800); // 800ms glitch duration
      return () => clearTimeout(timer);
    }
  }, [isGlitching]);

  return (
    <AnimatePresence>
      {renderGlitch && (
        <motion.div
          className="time-glitch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          {/* We can add SVG filters or more complex DOM elements here if needed, 
              but the CSS keyframes on the wrapper handle the main VHS effect. */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
