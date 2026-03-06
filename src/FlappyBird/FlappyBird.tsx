import React, { forwardRef, useCallback } from 'react';
import { useFlappyBird, CHARACTERS, GAME_WIDTH } from './hooks/useFlappyBird';
import { GameScene } from './components/GameScene';
import { resumeAudio, playStartSound } from './utils/sounds';
import './FlappyBird.less';

export interface FlappyBirdProps {
  onGameEnd?: (finalScore: number) => void;
}

const FlappyBird = React.memo(
  forwardRef<HTMLDivElement, FlappyBirdProps>(function FlappyBird(_props, ref) {
    const {
      birdY,
      birdTilt,
      pipes,
      bonuses,
      score,
      highScore,
      phase,
      selectedCharacter,
      groundOffset,
      selectCharacter,
      startGame,
      flap,
      resetGame,
    } = useFlappyBird();

    const handleStart = useCallback(() => {
      resumeAudio();
      playStartSound();
      startGame();
    }, [startGame]);

    const handleReplay = useCallback(() => {
      resumeAudio();
      playStartSound();
      startGame();
    }, [startGame]);

    const getMedal = (s: number) => {
      if (s >= 40) return { emoji: '🏆', label: '传奇' };
      if (s >= 25) return { emoji: '🥇', label: '金牌' };
      if (s >= 15) return { emoji: '🥈', label: '银牌' };
      if (s >= 5) return { emoji: '🥉', label: '铜牌' };
      return null;
    };

    return (
      <div ref={ref} className="fb-game">
        <GameScene
          birdY={birdY}
          birdTilt={birdTilt}
          pipes={pipes}
          bonuses={bonuses}
          score={score}
          highScore={highScore}
          character={selectedCharacter}
          groundOffset={groundOffset}
          phase={phase}
          onTap={flap}
        />

        {/* Start Modal */}
        {phase === 'start' && (
          <div className="fb-modal-overlay">
            <div className="fb-modal fb-modal--start" style={{ maxWidth: GAME_WIDTH - 40 }}>
              <div className="fb-modal__confetti" />
              <h1 className="fb-modal__title">FLAPPY BIRD</h1>
              <p className="fb-modal__subtitle">🐦 飞 行 冒 险 🐦</p>

              <div className="fb-modal__section">
                <h3 className="fb-modal__section-title">选择角色</h3>
                <div className="fb-modal__characters">
                  {CHARACTERS.map((char) => (
                    <div
                      key={char.id}
                      className={`fb-char-card ${selectedCharacter.id === char.id ? 'fb-char-card--selected' : ''}`}
                      onClick={() => selectCharacter(char)}
                    >
                      <img src={char.image} alt={char.name} className="fb-char-card__img" />
                      <span className="fb-char-card__name">{char.name}</span>
                      <span className="fb-char-card__desc">{char.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fb-modal__rules">
                <span>👆 点击屏幕拍翅飞行</span>
                <span>🔰 穿过管道得 1 分</span>
                <span>⭐ 吃角色道具加 3 分</span>
                <span>👻 碰到幽灵扣 5 分</span>
              </div>

              {highScore > 0 && (
                <div className="fb-modal__record">🏆 最高纪录: {highScore}</div>
              )}

              <button className="fb-modal__btn" onClick={handleStart}>
                开始飞行!
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {phase === 'dead' && (
          <div className="fb-modal-overlay fb-modal-overlay--dark">
            <div className="fb-modal fb-modal--dead" style={{ maxWidth: GAME_WIDTH - 40 }}>
              <h2 className="fb-modal__title fb-modal__title--over">GAME OVER</h2>

              <div className="fb-modal__scoreboard">
                {getMedal(score) && (
                  <div className="fb-modal__medal">
                    <span className="fb-modal__medal-emoji">{getMedal(score)!.emoji}</span>
                    <span className="fb-modal__medal-label">{getMedal(score)!.label}</span>
                  </div>
                )}
                <div className="fb-modal__score-row">
                  <span className="fb-modal__score-label">得分</span>
                  <span className="fb-modal__score-value">{score}</span>
                </div>
                <div className="fb-modal__score-row">
                  <span className="fb-modal__score-label">最高</span>
                  <span className="fb-modal__score-value fb-modal__score-value--best">{highScore}</span>
                </div>
                {score >= highScore && score > 0 && (
                  <div className="fb-modal__new-record">NEW RECORD!</div>
                )}
              </div>

              <div className="fb-modal__actions">
                <button className="fb-modal__btn" onClick={handleReplay}>
                  再来一次
                </button>
                <button className="fb-modal__btn fb-modal__btn--secondary" onClick={resetGame}>
                  返回首页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  })
);

FlappyBird.displayName = 'FlappyBird';
export { FlappyBird };
