'use client';
import { useEffect, useRef, useState } from 'react';
import { decodeLetter } from '@/lib/morse';
import MorseTree from '@/components/MorseTree';

// Real Morse timing, 1 unit = T ms: dot = 1, dash = 3,
// gap between letters = 3, gap between words = 7.
// Holding 2 units or more counts as a dash. T is set by the speed buttons in the ? guide.
const getT = () => Number(localStorage.getItem('morse-T')) || 400;

export default function MorseKey({ onLetter, onSpace, onMiss, hint = '' }) {
  const cb = useRef({});
  cb.current = { onLetter, onSpace, onMiss };
  const [pattern, setPattern] = useState('');
  const [held, setHeld] = useState(null); // ms held, null when not pressed
  const [T, setT] = useState(400);
  const pat = useRef('');
  const t0 = useRef(0);
  const unit = useRef(400);
  const isDown = useRef(false);
  const tick = useRef(null);
  const timers = useRef([]);

  const press = () => {
    if (isDown.current) return;
    isDown.current = true;
    timers.current.forEach(clearTimeout);
    unit.current = getT();
    setT(unit.current);
    t0.current = Date.now();
    setHeld(0);
    tick.current = setInterval(() => setHeld(Date.now() - t0.current), 40);
  };

  const release = () => {
    if (!isDown.current) return;
    isDown.current = false;
    clearInterval(tick.current);
    setHeld(null);
    const u = unit.current;
    pat.current += Date.now() - t0.current < 2 * u ? '.' : '-';
    setPattern(pat.current);
    timers.current = [
      setTimeout(() => {
        const ch = decodeLetter(pat.current);
        if (ch) cb.current.onLetter(ch);
        else cb.current.onMiss?.();
        pat.current = '';
        setPattern('');
      }, 3 * u),
      setTimeout(() => cb.current.onSpace?.(), 7 * u),
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
    return () => {
      removeEventListener('keydown', dn);
      removeEventListener('keyup', up);
      clearInterval(tick.current);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const down = held !== null;
  const long = down && held >= 2 * T;
  const progress = down ? Math.min(held / (2 * T), 1) : 0;

  return (
    <div className="keyzone">
      <MorseTree pattern={pattern} pending={down ? (long ? '-' : '.') : ''} hint={hint} />
      <div className="wait">
        {pattern && !down && <i key={pattern} style={{ animationDuration: 3 * T + 'ms' }} />}
      </div>
      <button
        className={'tap' + (down ? ' on' : '') + (long ? ' long' : '')}
        style={{ '--p': progress }}
        onPointerDown={press}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span>{down ? (long ? 'Dash' : 'Dot') : 'Tap or hold'}</span>
      </button>
    </div>
  );
}
