'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MORSE } from '@/lib/morse';

export default function Guide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="help" aria-label="How to use" onClick={() => setOpen(true)}>?</button>
      {open && (
        <div className="overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>How to use</h2>
            <ol>
              <li><b>Tap</b> quickly for a dot (.). <b>Hold</b> a little longer for a dash (-).</li>
              <li>Pause about half a second to finish a letter. Pause about one second to add a space.</li>
              <li>The lights show your dots and dashes, and the letter they make.</li>
              <li>Check the text box, then press <b>Send</b>. <b>Delete</b> removes the last letter.</li>
              <li>Messages arrive as Morse. Press <b>Translate</b> to read them.</li>
            </ol>
            <div className="chart">
              {Object.entries(MORSE).map(([k, v]) => <span key={k}><b>{k}</b> {v}</span>)}
            </div>
            <div className="row">
              <Link href="/train" className="linkbtn" onClick={() => setOpen(false)}>Practice in training mode</Link>
              <button onClick={() => setOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
