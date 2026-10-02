'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MORSE } from '@/lib/morse';

export default function Guide() {
  const [open, setOpen] = useState(false);
  const [speed, setSpeed] = useState(400);
  useEffect(() => { setSpeed(Number(localStorage.getItem('morse-T')) || 400); }, []);
  const pick = (v) => { localStorage.setItem('morse-T', v); setSpeed(v); };
  return (
    <>
      <button className="help" aria-label="How to use" onClick={() => setOpen(true)}>?</button>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>How to use</h2>
            <ol>
              <li><b>Tap</b> the key for a dot. <b>Hold</b> it for a dash: the ring fills, and when it turns solid it counts as a dash.</li>
              <li>The tree shows where you are. Circles are dots, bars are dashes. Green is your spot, and bright outlines are what you can reach next.</li>
              <li>Let go and wait. The bar under the tree drains, then the letter drops into the text box. Wait a little longer for a space.</li>
              <li>Press <b>Send</b> when the text looks right. <b>Delete</b> removes the last letter.</li>
              <li>Messages arrive as Morse. Press <b>Translate</b> to read them.</li>
            </ol>
            <div className="chart">
              {Object.entries(MORSE).map(([k, v]) => <span key={k}><b>{k}</b> {v}</span>)}
            </div>
            <p style={{ margin: '12px 0 6px' }}>Key speed</p>
            <div className="row">
              {[['Beginner', 400], ['Slow', 300], ['Normal', 220], ['Fast', 140]].map(([n, v]) => (
                <button key={n} className={speed === v ? 'big' : ''} onClick={() => pick(v)}>{n}</button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <Link href="/train" className="linkbtn" onClick={() => setOpen(false)}>Practice in training mode</Link>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
