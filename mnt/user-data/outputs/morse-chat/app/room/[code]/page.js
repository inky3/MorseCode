'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { encode, decode } from '@/lib/morse';
import MorseKey from '@/components/MorseKey';
import Guide from '@/components/Guide';

function Msg({ m, mine }) {
  const [translated, setTranslated] = useState(false);
  return (
    <div className={mine ? 'msg me' : 'msg'}>
      <small>{m.from}</small>
      <p>{translated ? decode(m.morse) : m.morse}</p>
      <button onClick={() => setTranslated(!translated)}>{translated ? 'Show Morse' : 'Translate'}</button>
    </div>
  );
}

export default function Room() {
  const { code } = useParams();
  const [name, setName] = useState(null); // null = loading, '' = ask
  const [tmp, setTmp] = useState('');
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [copied, setCopied] = useState(false);
  const channel = useRef(null);
  const end = useRef(null);

  useEffect(() => { setName(localStorage.getItem('morse-name') || ''); }, []);

  useEffect(() => {
    if (!name) return;
    const c = supabase.channel('room:' + code, { config: { broadcast: { self: true } } });
    c.on('broadcast', { event: 'msg' }, ({ payload }) => setMsgs((m) => [...m, payload])).subscribe();
    channel.current = c;
    return () => { supabase.removeChannel(c); };
  }, [name, code]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    channel.current.send({
      type: 'broadcast', event: 'msg',
      payload: { id: crypto.randomUUID(), from: name, morse: encode(text) },
    });
    setDraft('');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (name === null) return null;
  if (!name) {
    return (
      <main className="home">
        <h1>Pick a username</h1>
        <input value={tmp} maxLength={16} onChange={(e) => setTmp(e.target.value)} />
        <button className="big" onClick={() => { const n = tmp.trim(); if (n) { localStorage.setItem('morse-name', n); setName(n); } }}>
          Join room {code}
        </button>
      </main>
    );
  }

  return (
    <main>
      <Guide />
      <div className="row">
        <strong style={{ flex: 2, alignSelf: 'center' }}>Room {code}</strong>
        <button onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</button>
      </div>
      <div className="msgs">
        {msgs.map((m) => <Msg key={m.id} m={m} mine={m.from === name} />)}
        <div ref={end} />
      </div>
      <div className="box">{draft || 'Tap the key to write…'}</div>
      <div className="row">
        <button onClick={() => setDraft((d) => d.slice(0, -1))}>Delete</button>
        <button className="big" onClick={send}>Send</button>
      </div>
      <MorseKey
        onLetter={(ch) => setDraft((d) => d + ch)}
        onSpace={() => setDraft((d) => (d && !d.endsWith(' ') ? d + ' ' : d))}
      />
    </main>
  );
}
