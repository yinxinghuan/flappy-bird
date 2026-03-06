import React, { forwardRef, useCallback } from 'react';
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
      onTap,
    } = props;

    const handleInteraction = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        onTap?.();
      },
      [onTap]
    );

    return (
      <div
        ref={ref}
        className="fb-scene"
        onMouseDown={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div
          className="fb-scene__viewport"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
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
            <Bird y={birdY} tilt={birdTilt} image={character.image} />
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
