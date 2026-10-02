export const MORSE = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
const REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

export const decodeLetter = (pattern) => REV[pattern];
// "HI MOM" -> ".... .. / -- --- --"
export const encode = (text) =>
  text.toUpperCase().split(' ').filter(Boolean)
    .map((w) => [...w].map((c) => MORSE[c]).filter(Boolean).join(' ')).join(' / ');
export const decode = (morse) =>
  morse.split(' / ').map((w) => w.split(' ').map((p) => REV[p] || '?').join('')).join(' ');
