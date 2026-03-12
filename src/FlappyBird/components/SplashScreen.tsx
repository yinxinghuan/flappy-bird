import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import posterImg from '../img/poster.png';

import guitaristImg from '../img/guitarist.png';
import coderImg from '../img/coder.png';
import hackerImg from '../img/hacker.png';
import ghostImg from '../img/ghost.png';
import guitaristSideImg from '../img/guitarist_side.png';
import coderSideImg from '../img/coder_side.png';
import hackerSideImg from '../img/hacker_side.png';
import ghostSideImg from '../img/ghost_side.png';
import aigramLogo from '../img/aigram.svg';

import './SplashScreen.less';

const GAME_IMAGES: string[] = [
  guitaristImg,
  coderImg,
  hackerImg,
  ghostImg,
  guitaristSideImg,
  coderSideImg,
  hackerSideImg,
  ghostSideImg,
  aigramLogo,
];

const MIN_MS = 2200;
const MAX_ASSET_MS = 10000;

export interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = React.memo(
  forwardRef<HTMLDivElement, SplashScreenProps>(function SplashScreen({ onDone }, ref) {
    const [posterReady, setPosterReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fading, setFading] = useState(false);
    const [minDone, setMinDone] = useState(false);
    const [assetsDone, setAssetsDone] = useState(false);

    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;
    const fadingStarted = useRef(false);

    // Min timer: start when poster is ready
    useEffect(() => {
      if (!posterReady) return;
      const id = setTimeout(() => setMinDone(true), MIN_MS);
      return () => clearTimeout(id);
    }, [posterReady]);

    // Preload game images once poster is ready
    useEffect(() => {
      if (!posterReady) return;

      let loaded = 0;
      const total = GAME_IMAGES.length;

      // Safety timeout
      const timeout = setTimeout(() => {
        setProgress(100);
        setAssetsDone(true);
      }, MAX_ASSET_MS);

      const tick = () => {
        loaded++;
        setProgress(Math.round((loaded / total) * 100));
        if (loaded >= total) {
          clearTimeout(timeout);
          setAssetsDone(true);
        }
      };

      GAME_IMAGES.forEach((src) => {
        const img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = src;
      });

      return () => clearTimeout(timeout);
    }, [posterReady]);

    // Fade out when both conditions met
    const tryFade = useCallback(() => {
      if (fadingStarted.current) return;
      fadingStarted.current = true;
      setFading(true);
      setTimeout(() => onDoneRef.current(), 500);
    }, []);

    useEffect(() => {
      if (minDone && assetsDone) tryFade();
    }, [minDone, assetsDone, tryFade]);

    return (
      <div
        ref={ref}
        className={`fb-splash${fading ? ' fb-splash--fading' : ''}`}
      >
        <img
          className={`fb-splash__img${posterReady ? ' fb-splash__img--visible' : ''}`}
          src={posterImg}
          alt="Flappy Bird"
          draggable={false}
          onLoad={() => setPosterReady(true)}
        />
        <div className="fb-splash__bar-track">
          <div
            className="fb-splash__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  })
);

SplashScreen.displayName = 'SplashScreen';
export default SplashScreen;
