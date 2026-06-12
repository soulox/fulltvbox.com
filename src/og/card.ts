import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Read vendored static fonts from the project root (reliable at build time).
const fontDir = join(process.cwd(), 'src', 'og', 'fonts');
const archivo = readFileSync(join(fontDir, 'ArchivoBlack-Regular.ttf'));
const mono = readFileSync(join(fontDir, 'IBMPlexMono-Medium.ttf'));

const C = {
  void: '#06080b', line: '#1d2731', ink: '#e8eae3',
  muted: '#8b97a1', dim: '#737f8a', signal: '#a8e84d',
};
const SMPTE = ['#b9b9b9', '#c9c40e', '#1fbcc9', '#1faf3a', '#c92191', '#c92121', '#2433c0'];

type El = any;
const el = (type: string, style: Record<string, any>, children?: any): El =>
  ({ type, props: { style, ...(children !== undefined ? { children } : {}) } });

const smpte = (height: number): El =>
  el('div', { display: 'flex', width: '100%', height }, SMPTE.map(c => el('div', { flex: 1, background: c })));

function seg(state: 'on' | 'half' | 'off'): El {
  if (state === 'half') {
    return el('div', { display: 'flex', width: 34, height: 66, border: `2px solid ${C.signal}`, background: '#131a20' },
      [el('div', { display: 'flex', width: '50%', height: '100%', background: C.signal })]);
  }
  const on = state === 'on';
  return el('div', { display: 'flex', width: 34, height: 66, border: `2px solid ${on ? C.signal : C.line}`, background: on ? C.signal : '#131a20' });
}

function meter(rating: number): El {
  const segs: El[] = [];
  for (let i = 0; i < 5; i++) {
    segs.push(seg(rating >= i + 1 ? 'on' : rating >= i + 0.5 ? 'half' : 'off'));
  }
  return el('div', { display: 'flex', gap: 8 }, segs);
}

export interface OgOpts {
  kind?: string;     // REVIEW | GUIDE | TUTORIAL | ''
  title: string;
  rating?: number;   // reviews only
  meta?: string;     // tagline / difficulty·duration
}

export async function renderOg(opts: OgOpts): Promise<Buffer> {
  const len = opts.title.length;
  const titleSize = len > 64 ? 46 : len > 42 ? 56 : 68;

  const wordmark = el('div', { display: 'flex', alignItems: 'center', fontFamily: 'Archivo Black', fontSize: 34 }, [
    el('div', { display: 'flex', width: 16, height: 16, borderRadius: 8, background: C.signal, marginRight: 16 }),
    el('div', { display: 'flex', color: C.ink }, 'FULL'),
    el('div', { display: 'flex', color: C.signal }, 'TV'),
    el('div', { display: 'flex', color: C.ink }, 'BOX'),
  ]);

  const scoreOrMeta = opts.rating !== undefined
    ? el('div', { display: 'flex', alignItems: 'flex-end', marginTop: 40, gap: 26 }, [
        meter(opts.rating),
        el('div', { display: 'flex', alignItems: 'flex-end' }, [
          el('div', { display: 'flex', fontFamily: 'Archivo Black', fontSize: 76, color: C.signal, lineHeight: 1 }, opts.rating.toFixed(1)),
          el('div', { display: 'flex', color: C.dim, fontSize: 26, marginBottom: 10, marginLeft: 10 }, '/ 5.0'),
        ]),
      ])
    : opts.meta
      ? el('div', { display: 'flex', color: C.muted, fontSize: 27, marginTop: 30, maxWidth: 1010, lineHeight: 1.4 }, opts.meta)
      : el('div', { display: 'flex' });

  const tree = el('div', {
    display: 'flex', flexDirection: 'column', width: 1200, height: 630,
    background: C.void, color: C.ink, fontFamily: 'IBM Plex Mono',
  }, [
    smpte(12),
    el('div', { display: 'flex', flexDirection: 'column', flex: 1, padding: 64, justifyContent: 'space-between' }, [
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [
        wordmark,
        el('div', { display: 'flex', color: C.dim, fontSize: 20, letterSpacing: 4 }, 'AV TEST LAB'),
      ]),
      el('div', { display: 'flex', flexDirection: 'column' }, [
        opts.kind
          ? el('div', { display: 'flex', color: C.signal, fontSize: 22, letterSpacing: 6, marginBottom: 22 }, `// ${opts.kind}`)
          : el('div', { display: 'flex' }),
        el('div', { display: 'flex', fontFamily: 'Archivo Black', fontSize: titleSize, lineHeight: 1.04, color: C.ink, maxWidth: 1040 }, opts.title),
        scoreOrMeta,
      ]),
      el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.dim, fontSize: 22 }, [
        el('div', { display: 'flex' }, 'fulltvbox.com'),
        el('div', { display: 'flex' }, 'Tested on the bench · rated without mercy'),
      ]),
    ]),
    smpte(12),
  ]);

  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Archivo Black', data: archivo, weight: 400, style: 'normal' },
      { name: 'IBM Plex Mono', data: mono, weight: 500, style: 'normal' },
    ],
  });

  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
