'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MorseKey from '@/components/MorseKey';
import Guide from '@/components/Guide';
import { MORSE } from '@/lib/morse';

const LEVELS = {
  Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  Numbers: '0123456789'.split(''),
  Words: ['SOS', 'HI', 'OK', 'CAT', 'CODE', 'MORSE', 'LIGHT', 'HELLO'],
};
const pick = (list, last) => {
  let t;
  do { t = list[Math.floor(Math.random() * list.length)]; } while (t === last && list.length > 1);
  return t;
};

export default function Train() {
  const [level, setLevel] = useState('Letters');
  const [target, setTarget] = useState('');
  const [pos, setPos] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(0);
  const [hint, setHint] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { setTarget(pick(LEVELS[level])); setPos(0); }, [level]);

  const miss = (ch) => {
    setStreak(0);
    setMsg(ch ? `That was ${ch}. Try ${target[pos]} again.` : `Not a letter. Try ${target[pos]} again.`);
  };

  const onLetter = (ch) => {
    if (ch !== target[pos]) return miss(ch);
    if (pos + 1 < target.length) { setPos(pos + 1); setMsg('Good. Keep going.'); return; }
    const n = streak + 1;
    setStreak(n); setBest(Math.max(best, n)); setDone(done + 1);
    setMsg('Correct!');
    setTarget(pick(LEVELS[level], target)); setPos(0);
  };

  return (
    <main>
      <Guide />
      <div className="row">
        <Link href="/" className="linkbtn">Back</Link>
        {Object.keys(LEVELS).map((l) => (
          <button key={l} className={l === level ? 'big' : ''} onClick={() => setLevel(l)}>{l}</button>
        ))}
      </div>
      <div className="stats"><span>Streak {streak}</span><span>Best {best}</span><span>Done {done}</span></div>
      <div className="goal">
        <div className="target">
          {[...target].map((c, i) => <span key={i} className={i < pos ? 'got' : ''}>{c}</span>)}
        </div>
        {hint && <p className="hint">{[...target].map((c) => MORSE[c]).join('   ')}</p>}
        <p aria-live="polite">{msg || 'Tap out the letters above.'}</p>
        <button onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Show hint'}</button>
      </div>
      <MorseKey onLetter={onLetter} onMiss={() => miss()} hint={hint && target ? MORSE[target[pos]] : ''} />
    </main>
  );
}
