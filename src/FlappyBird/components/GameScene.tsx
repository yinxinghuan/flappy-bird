import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import type { PipeState, BonusState } from '../types';
import type { BirdCharacter } from '../types';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT } from '../hooks/useFlappyBird';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { BonusItem } from './BonusItem';
import './GameScene.less';

export interface GameSceneProps {
  birdY?: number;
  birdTilt?: number;
  pipes?: PipeState[];
  bonuses?: BonusState[];
  score?: number;
  highScore?: number;
  character?: BirdCharacter;
  groundOffset?: number;
  phase?: 'start' | 'playing' | 'dead';
  isFlapping?: boolean;
  onTap?: () => void;
}

const GameScene = React.memo(
  forwardRef<HTMLDivElement, GameSceneProps>(function GameScene(props, ref) {
    const {
      birdY = 300,
      birdTilt = 0,
      pipes = [],
      bonuses = [],
      score = 0,
      highScore = 0,
      character,
      groundOffset = 0,
      phase = 'start',
      isFlapping = false,
      onTap,
    } = props;

    const [scale, setScale] = useState(1);

    useEffect(() => {
      const updateScale = () => {
        const s = Math.min(1, window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT);
        setScale(s);
      };
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, []);

    const handleInteraction = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        onTap?.();
      },
      [onTap]
    );

    return (
      <div
        ref={ref}
        className="fb-scene"
        onPointerDown={handleInteraction}
      >
        <div
          className="fb-scene__viewport"
          style={{
            width: GAME_WIDTH,
            height: GAME_HEIGHT,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Sky background */}
          <div className="fb-scene__sky" />

          {/* Clouds */}
          <div className="fb-scene__clouds">
            <div className="fb-scene__cloud fb-scene__cloud--1" />
            <div className="fb-scene__cloud fb-scene__cloud--2" />
            <div className="fb-scene__cloud fb-scene__cloud--3" />
          </div>

          {/* Pipes */}
          {pipes.map((pipe) => (
            <Pipe key={pipe.id} pipe={pipe} />
          ))}

          {/* Bonuses */}
          {bonuses.map((bonus) => (
            <BonusItem key={bonus.id} bonus={bonus} />
          ))}

          {/* Bird */}
          {phase !== 'start' && character && (
            <Bird y={birdY} tilt={birdTilt} image={character.sideImage} isFlapping={isFlapping} />
          )}

          {/* Ground */}
          <div
            className="fb-scene__ground"
            style={{
              height: GROUND_HEIGHT,
              backgroundPositionX: -groundOffset,
            }}
          />

          {/* Score HUD */}
          {phase === 'playing' && (
            <div className="fb-scene__hud">
              <div className="fb-scene__score">{score}</div>
              {highScore > 0 && (
                <div className="fb-scene__high-score">Best: {highScore}</div>
              )}
            </div>
          )}

          {/* Tap hint */}
          {phase === 'playing' && score === 0 && pipes.length <= 1 && (
            <div className="fb-scene__tap-hint">Tap!</div>
          )}
        </div>
      </div>
    );
  })
);

GameScene.displayName = 'GameScene';
export { GameScene };
