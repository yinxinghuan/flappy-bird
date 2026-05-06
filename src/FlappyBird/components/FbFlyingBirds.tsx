import guitaristImg from '../img/guitarist.png';
import coderImg from '../img/coder.png';
import hackerImg from '../img/hacker.png';
import ghostImg from '../img/ghost.png';
import './FbFlyingBirds.less';

const CHARS = [guitaristImg, coderImg, hackerImg, ghostImg];

interface BirdSlot {
  yPct: number;
  charIdx: number;
  delay: number;
  duration: number;
  size: number;
  bobAmp: number;     // px of vertical bobbing
  direction: 'rtl' | 'ltr';
}

const BIRDS: BirdSlot[] = [
  { yPct: 12,  charIdx: 0, delay: 0.0, duration: 13, size: 44, bobAmp: 6,  direction: 'rtl' },
  { yPct: 22,  charIdx: 2, delay: 4.0, duration: 11, size: 36, bobAmp: 8,  direction: 'rtl' },
  { yPct: 28,  charIdx: 1, delay: 7.5, duration: 14, size: 40, bobAmp: 5,  direction: 'ltr' },
  { yPct: 70,  charIdx: 3, delay: 2.0, duration: 12, size: 38, bobAmp: 7,  direction: 'rtl' },
  { yPct: 78,  charIdx: 0, delay: 6.5, duration: 15, size: 32, bobAmp: 6,  direction: 'ltr' },
  { yPct: 86,  charIdx: 2, delay: 9.0, duration: 13, size: 42, bobAmp: 5,  direction: 'rtl' },
];

const CLOUDS = [
  { yPct: 5,  delay: 0,  duration: 28, size: 90, opacity: 0.5 },
  { yPct: 18, delay: 11, duration: 35, size: 70, opacity: 0.4 },
  { yPct: 42, delay: 5,  duration: 32, size: 110, opacity: 0.3 },
  { yPct: 60, delay: 18, duration: 30, size: 80, opacity: 0.35 },
];

export default function FbFlyingBirds() {
  return (
    <div className="fb-sky" aria-hidden>
      {/* Soft sky gradient base */}
      <div className="fb-sky__gradient" />

      {/* Drifting clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className="fb-sky__cloud"
          style={{
            top: `${c.yPct}%`,
            width: `${c.size}px`,
            height: `${c.size * 0.55}px`,
            opacity: c.opacity,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      {/* Flying characters */}
      {BIRDS.map((b, i) => (
        <div
          key={`bird-${i}`}
          className={`fb-sky__bird fb-sky__bird--${b.direction}`}
          style={{
            top: `${b.yPct}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            ['--bob-amp' as string]: `${b.bobAmp}px`,
          }}
        >
          <img src={CHARS[b.charIdx]} alt="" draggable={false} className="fb-sky__bird-img" />
        </div>
      ))}
    </div>
  );
}
