import React, { forwardRef } from 'react';
import type { PipeState } from '../types';
import { GAME_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH } from '../hooks/useFlappyBird';
import './Pipe.less';

export interface PipeProps {
  pipe?: PipeState;
}

const defaultPipe: PipeState = {
  id: 0,
  x: 400,
  gapY: 300,
  gapSize: 160,
  passed: false,
};

const Pipe = React.memo(
  forwardRef<HTMLDivElement, PipeProps>(function Pipe(props, ref) {
    const { pipe = defaultPipe } = props;
    const topHeight = pipe.gapY - pipe.gapSize / 2;
    const bottomTop = pipe.gapY + pipe.gapSize / 2;
    const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomTop;

    return (
      <div ref={ref} className="fb-pipe-pair" style={{ left: pipe.x }}>
        {/* Top pipe */}
        <div
          className="fb-pipe fb-pipe--top"
          style={{ height: Math.max(0, topHeight), width: PIPE_WIDTH }}
        >
          <div className="fb-pipe__cap" />
        </div>
        {/* Bottom pipe */}
        <div
          className="fb-pipe fb-pipe--bottom"
          style={{
            top: bottomTop,
            height: Math.max(0, bottomHeight),
            width: PIPE_WIDTH,
          }}
        >
          <div className="fb-pipe__cap" />
        </div>
      </div>
    );
  })
);

Pipe.displayName = 'Pipe';
export { Pipe };
