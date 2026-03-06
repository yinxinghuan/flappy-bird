import React, { forwardRef, useCallback, useState } from 'react';
import { useFlappyBird, CHARACTERS, GAME_WIDTH } from './hooks/useFlappyBird';
import { GameScene } from './components/GameScene';
import SplashScreen from './components/SplashScreen';
import { resumeAudio, playStartSound } from './utils/sounds';
import { useLocale } from './i18n';
import aigramLogo from './img/aigram.svg';
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
      isFlapping,
      selectCharacter,
      startGame,
      flap,
      resetGame,
    } = useFlappyBird();

    const { t } = useLocale();
    const [showSplash, setShowSplash] = useState(true);

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
      if (s >= 40) return { emoji: '🏆', label: t('medal.legend') };
      if (s >= 25) return { emoji: '🥇', label: t('medal.gold') };
      if (s >= 15) return { emoji: '🥈', label: t('medal.silver') };
      if (s >= 5)  return { emoji: '🥉', label: t('medal.bronze') };
      return null;
    };

    return (
      <div ref={ref} className="fb-game">
        <img className="fb-game__watermark" src={aigramLogo} alt="Aigram" draggable={false} />
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

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
          isFlapping={isFlapping}
          onTap={flap}
          t={t}
        />

        {/* Start Modal */}
        {phase === 'start' && (
          <div className="fb-modal-overlay">
            <div className="fb-modal fb-modal--start" style={{ maxWidth: GAME_WIDTH - 40 }}>
              <div className="fb-modal__confetti" />
              <h1 className="fb-modal__title">FLAPPY BIRD</h1>
              <p className="fb-modal__subtitle">{t('subtitle')}</p>

              <div className="fb-modal__section">
                <h3 className="fb-modal__section-title">{t('selectChar')}</h3>
                <div className="fb-modal__characters">
                  {CHARACTERS.map((char) => (
                    <div
                      key={char.id}
                      className={`fb-char-card ${selectedCharacter.id === char.id ? 'fb-char-card--selected' : ''}`}
                      onClick={() => selectCharacter(char)}
                    >
                      <img src={char.image} alt={t(`char.${char.id}.name`)} className="fb-char-card__img" />
                      <span className="fb-char-card__name">{t(`char.${char.id}.name`)}</span>
                      <span className="fb-char-card__desc">{t(`char.${char.id}.desc`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fb-modal__rules">
                <span>{t('rule1')}</span>
                <span>{t('rule2')}</span>
                <span>{t('rule3')}</span>
                <span>{t('rule4')}</span>
              </div>

              {highScore > 0 && (
                <div className="fb-modal__record">{t('highRecord', { n: highScore })}</div>
              )}

              <button className="fb-modal__btn" onClick={handleStart}>
                {t('startBtn')}
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
                  <span className="fb-modal__score-label">{t('scoreLabel')}</span>
                  <span className="fb-modal__score-value">{score}</span>
                </div>
                <div className="fb-modal__score-row">
                  <span className="fb-modal__score-label">{t('bestLabel')}</span>
                  <span className="fb-modal__score-value fb-modal__score-value--best">{highScore}</span>
                </div>
                {score >= highScore && score > 0 && (
                  <div className="fb-modal__new-record">NEW RECORD!</div>
                )}
              </div>

              <div className="fb-modal__actions">
                <button className="fb-modal__btn" onClick={handleReplay}>
                  {t('replayBtn')}
                </button>
                <button className="fb-modal__btn fb-modal__btn--secondary" onClick={resetGame}>
                  {t('homeBtn')}
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
