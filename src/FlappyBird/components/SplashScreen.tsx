import React, { forwardRef } from 'react';
import posterImg from '../img/poster.png';
import './SplashScreen.less';

export interface SplashScreenProps {
  onDone: () => void;
}

const SplashScreen = React.memo(
  forwardRef<HTMLDivElement, SplashScreenProps>(function SplashScreen({ onDone }, ref) {
    return (
      <div className="fb-splash" ref={ref}>
        <img
          className="fb-splash__img"
          src={posterImg}
          alt="Flappy Bird"
          draggable={false}
          onAnimationEnd={onDone}
        />
      </div>
    );
  })
);

SplashScreen.displayName = 'SplashScreen';
export default SplashScreen;
