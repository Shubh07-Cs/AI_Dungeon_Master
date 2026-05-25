'use client';

import { useState, useEffect, useRef } from 'react';

export function useTypewriter(
  text: string,
  speed: number = 30,
  enabled: boolean = true
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Start fresh
    setDisplayedText('');
    indexRef.current = 0;
    setIsTyping(true);

    if (!text) {
      setIsTyping(false);
      return;
    }

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isTyping };
}
