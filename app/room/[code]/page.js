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
  const [live, setLive] = useState(false); // instant updates connected
  const [dbOk, setDbOk] = useState(null); // true / false once the database answers
  const [detail, setDetail] = useState('');
  const end = useRef(null);

  const add = (rows) => setMsgs((m) => {
    const seen = new Set(m.map((x) => x.id));
    return [...m, ...rows.filter((r) => !seen.has(r.id)).map((r) => ({ id: r.id, from: r.username, morse: r.morse }))];
  });

  const load = async () => {
    const { data, error } = await supabase.from('messages').select('*').eq('room', code).order('created_at').limit(200);
    if (error) { setDbOk(false); setDetail('Loading messages: ' + error.message); }
    else { setDbOk(true); setDetail(''); add(data); }
  };

  useEffect(() => { setName(localStorage.getItem('morse-name') || ''); }, []);

  useEffect(() => {
    if (!name) return;
    load();
    const poll = setInterval(load, 3000); // backup: works even if instant updates are blocked
    const c = supabase.channel('room:' + code)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${code}` },
        (p) => add([p.new]))
      .subscribe((st) => setLive(st === 'SUBSCRIBED'));
    return () => { clearInterval(poll); supabase.removeChannel(c); };
  }, [name, code]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    const row = { id: crypto.randomUUID(), room: code, username: name, morse: encode(text) };
    add([row]); // shows instantly; the saved copy is ignored because the id matches
    setDraft('');
    const { error } = await supabase.from('messages').insert(row);
    if (error) { setDbOk(false); setDetail('Sending: ' + error.message); }
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

  const label = dbOk === false ? "Can't reach the database. Check your Supabase setup."
    : live ? 'Online' : dbOk ? 'Online (updates every few seconds)' : 'Connecting…';

  return (
    <main>
      <Guide />
      <div className="row">
        <div style={{ flex: 2 }}>
          <strong>Room {code}</strong><br />
          <small className={'status ' + (dbOk === false ? 'error' : dbOk ? 'online' : 'connecting')}>{label}</small>
          {dbOk === false && detail && <><br /><small className="status error">{detail}</small></>}
        </div>
        <button onClick={copy}>{copied ? 'Link copied' : 'Copy link'}</button>
      </div>
      <div className="msgs">
        {msgs.map((m) => <Msg key={m.id} m={m} mine={m.from === name} />)}
        <div ref={end} />
      </div>
      <div className="composer">
        <div className="box">{draft || <span className="ph">Your message appears here</span>}</div>
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