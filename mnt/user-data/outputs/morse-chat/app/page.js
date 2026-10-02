'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Guide from '@/components/Guide';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const create = () =>
    router.push('/room/' + Math.random().toString(36).slice(2, 8).toUpperCase());

  return (
    <main className="home">
      <Guide />
      <h1>Morse Chat</h1>
      <p>One key. Talk in dots and dashes.</p>
      <button className="big" onClick={create}>Create room</button>
      <div className="row">
        <input placeholder="Room code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <button onClick={() => code && router.push('/room/' + code)}>Join room</button>
      </div>
      <button onClick={() => router.push('/train')}>Training mode</button>
    </main>
  );
}
