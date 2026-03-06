import React, { forwardRef } from 'react';
import { BIRD_SIZE, BIRD_X } from '../hooks/useFlappyBird';
import './Bird.less';

export interface BirdProps {
  y?: number;
  tilt?: number;
  image?: string;
  isFlapping?: boolean;
}

const Bird = React.memo(
  forwardRef<HTMLDivElement, BirdProps>(function Bird(props, ref) {
    const { y = 300, tilt = 0, image = '' } = props;

    return (
      <div
        ref={ref}
        className="fb-bird"
        style={{
          left: BIRD_X,
          top: y,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          transform: `rotate(${tilt}deg)`,
        }}
      >
        <img
          src={image}
          alt="bird"
          className="fb-bird__img"
          draggable={false}
        />
      </div>
    );
  })
);

Bird.displayName = 'Bird';
export { Bird };
