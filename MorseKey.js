'use client';
import { useEffect, useRef, useState } from 'react';
import { decodeLetter } from '@/lib/morse';

// International Morse timing, 1 unit = T ms:
// dot = 1, dash = 3, gap between letters = 3, gap between words = 7
const T = 150;

export default function MorseKey({ onLetter, onSpace, onMiss }) {
  const cb = useRef({});
  cb.current = { onLetter, onSpace, onMiss };
  const [pattern, setPattern] = useState('');
  const [down, setDown] = useState(false);
  const pat = useRef('');
  const t0 = useRef(0);
  const isDown = useRef(false);
  const timers = useRef([]);

  const press = () => {
    if (isDown.current) return;
    isDown.current = true;
    setDown(true);
    timers.current.forEach(clearTimeout);
    t0.current = Date.now();
  };

  const release = () => {
    if (!isDown.current) return;
    isDown.current = false;
    setDown(false);
    pat.current += Date.now() - t0.current < 2 * T ? '.' : '-';
    setPattern(pat.current);
    timers.current = [
      setTimeout(() => {
        const ch = decodeLetter(pat.current);
        if (ch) cb.current.onLetter(ch);
        else cb.current.onMiss?.();
        pat.current = '';
        setPattern('');
      }, 3 * T),
      setTimeout(() => cb.current.onSpace?.(), 7 * T),
    ];
  };

  // Space bar works as the key on desktop
  useEffect(() => {
    const dn = (e) => {
      if (e.code !== 'Space' || e.repeat || e.target.tagName === 'INPUT') return;
      e.preventDefault();
      press();
    };
    const up = (e) => e.code === 'Space' && release();
    addEventListener('keydown', dn);
    addEventListener('keyup', up);
    return () => { removeEventListener('keydown', dn); removeEventListener('keyup', up); };
  }, []);

  return (
    <div>
      <div className="lights" aria-live="polite">
        {[...pattern].map((s, i) => <i key={i} className={s === '.' ? 'dot' : 'dash'} />)}
        {pattern && <b>{decodeLetter(pattern) || '?'}</b>}
      </div>
      <button
        className={down ? 'tap on' : 'tap'}
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onContextMenu={(e) => e.preventDefault()}
      >
        {down ? '' : 'Tap · hold'}
      </button>
    </div>
  );
}
