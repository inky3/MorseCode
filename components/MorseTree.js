import { MORSE, decodeLetter } from '@/lib/morse';

// [column, row] for every letter, laid out like the Morse board:
// dashes branch left of the start, dots branch right.
const POS = {
  O: [0, 0], M: [1, 0], T: [2, 0], E: [4, 0], I: [5, 0], S: [6, 0], H: [7, 0],
  Q: [0, 1], G: [1, 1], U: [5, 1], V: [6, 1], Z: [1, 2], F: [5, 2],
  Y: [0, 3], K: [1, 3], N: [2, 3], A: [4, 3], R: [5, 3], L: [6, 3],
  C: [1, 4], X: [1, 5], D: [2, 5], W: [4, 5], P: [5, 5], B: [2, 6], J: [4, 6],
};
const ROOT = [3, 0];
const C = 44, PAD = 26;
const at = ([c, r]) => [PAD + c * C, PAD + r * C];
const parentOf = (L) => {
  const pc = MORSE[L].slice(0, -1);
  return pc ? POS[decodeLetter(pc)] : ROOT;
};

export default function MorseTree({ pattern = '', pending = '', hint = '' }) {
  const next = pending ? decodeLetter(pattern + pending) : undefined;
  const letters = Object.keys(POS);
  const lit = (L) => pattern.startsWith(MORSE[L]);
  const kid = (L) => MORSE[L].length === pattern.length + 1 && MORSE[L].startsWith(pattern);
  const [rx, ry] = at(ROOT);

  return (
    <svg className="tree" viewBox={`0 0 ${2 * PAD + 7 * C} ${2 * PAD + 6 * C}`} role="img"
         aria-label={'Morse tree, current position ' + (pattern || 'start')}>
      {letters.map((L) => {
        const [x, y] = at(POS[L]);
        const [px, py] = at(parentOf(L));
        return <line key={'e' + L} x1={px} y1={py} x2={x} y2={y} className={lit(L) ? 'te lit' : 'te'} />;
      })}
      <g>
        <circle cx={rx} cy={ry} r="11" className={pattern === '' ? 'tn cur' : 'tn'} />
        <path d={`M${rx - 5} ${ry - 4}H${rx + 5}L${rx} ${ry + 4}Z`} className="root-mark" />
      </g>
      {letters.map((L) => {
        const [x, y] = at(POS[L]);
        const [px] = at(parentOf(L));
        const dash = MORSE[L].endsWith('-');
        const horiz = x !== px;
        const cls = ['tn', kid(L) && 'kid', hint && hint.startsWith(MORSE[L]) && 'hint',
          lit(L) && 'lit', MORSE[L] === pattern && 'cur', next === L && 'pre'].filter(Boolean).join(' ');
        const w = horiz ? 34 : 24, h = horiz ? 24 : 34;
        return (
          <g key={L}>
            {dash
              ? <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="7" className={cls} />
              : <circle cx={x} cy={y} r="13" className={cls} />}
            <text x={x} y={y} className={lit(L) ? 'tl lit' : 'tl'}>{L}</text>
          </g>
        );
      })}
    </svg>
  );
}
