import { useCallback, useEffect, useRef, useState } from 'react';
import type { BirdCharacter, PipeState, BonusState } from '../types';
import {
  playFlapSound,
  playScoreSound,
  playBonusSound,
  playHitSound,
  playGameOverSound,
  playGhostSound,
} from '../utils/sounds';

import guitaristImg from '../img/guitarist.png';
import coderImg from '../img/coder.png';
import hackerImg from '../img/hacker.png';
import ghostImg from '../img/ghost.png';
import guitaristSideImg from '../img/guitarist_side.png';
import coderSideImg from '../img/coder_side.png';
import hackerSideImg from '../img/hacker_side.png';
import ghostSideImg from '../img/ghost_side.png';

export const CHARACTERS: BirdCharacter[] = [
  { id: 'guitarist', name: '吉他少年', image: guitaristImg, sideImage: guitaristSideImg, gravity: 0.45, flapForce: -7.5, hitboxSize: 24, description: '均衡型' },
  { id: 'coder', name: '咖啡女孩', image: coderImg, sideImage: coderSideImg, gravity: 0.35, flapForce: -6.5, hitboxSize: 23, description: '轻飘型·简单' },
  { id: 'hacker', name: '眼镜大叔', image: hackerImg, sideImage: hackerSideImg, gravity: 0.55, flapForce: -8.5, hitboxSize: 27, description: '重力型·困难' },
  { id: 'ghost', name: '调皮幽灵', image: ghostImg, sideImage: ghostSideImg, gravity: 0.3, flapForce: -6, hitboxSize: 20, description: '灵动型·简单' },
];

const BONUS_CHARACTERS = [
  { id: 'guitarist', image: guitaristImg, points: 3 },
  { id: 'coder', image: coderImg, points: 3 },
  { id: 'hacker', image: hackerImg, points: 3 },
  { id: 'ghost', image: ghostImg, points: -5 },
];

// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;
const BIRD_X = 80;
const BIRD_SIZE = 64;
const PIPE_WIDTH = 60;
const PIPE_GAP_INITIAL = 240;
const PIPE_GAP_MIN = 170;
const PIPE_SPEED_INITIAL = 2.0;
const PIPE_SPEED_MAX = 4.0;
const PIPE_SPAWN_DIST = 250;
const GROUND_HEIGHT = 70;
const VELOCITY_MAX = 10;
const BONUS_SIZE = 36;
const BONUS_CHANCE = 0.25;

export { GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH, BIRD_SIZE, BIRD_X, BONUS_SIZE };

export interface UseFlappyBirdReturn {
  birdY: number;
  birdTilt: number;
  pipes: PipeState[];
  bonuses: BonusState[];
  score: number;
  highScore: number;
  phase: 'start' | 'playing' | 'dead';
  selectedCharacter: BirdCharacter;
  groundOffset: number;
  isFlapping: boolean;
  selectCharacter: (char: BirdCharacter) => void;
  startGame: () => void;
  flap: () => void;
  resetGame: () => void;
}

export function useFlappyBird(): UseFlappyBirdReturn {
  const [selectedCharacter, setSelectedCharacter] = useState<BirdCharacter>(CHARACTERS[0]);
  const [phase, setPhase] = useState<'start' | 'playing' | 'dead'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fb-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
  const [birdTilt, setBirdTilt] = useState(0);
  const [pipes, setPipes] = useState<PipeState[]>([]);
  const [bonuses, setBonuses] = useState<BonusState[]>([]);
  const [groundOffset, setGroundOffset] = useState(0);
  const [isFlapping, setIsFlapping] = useState(false);

  const gameRef = useRef({
    birdY: GAME_HEIGHT / 2 - BIRD_SIZE / 2,
    velocity: 0,
    pipes: [] as PipeState[],
    bonuses: [] as BonusState[],
    score: 0,
    pipeIdCounter: 0,
    bonusIdCounter: 0,
    groundOffset: 0,
    lastPipeX: GAME_WIDTH + 100,
    dead: false,
    playing: false,
    character: CHARACTERS[0],
  });

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastFlapRef = useRef(0);
  const flapTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const getPipeSpeed = useCallback((s: number) => {
    return Math.min(PIPE_SPEED_INITIAL + s * 0.05, PIPE_SPEED_MAX);
  }, []);

  const getPipeGap = useCallback((s: number) => {
    return Math.max(PIPE_GAP_INITIAL - s * 2, PIPE_GAP_MIN);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const g = gameRef.current;
    if (g.dead) return;

    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = Math.min((timestamp - lastTimeRef.current) / 16.667, 3);
    lastTimeRef.current = timestamp;

    const speed = getPipeSpeed(g.score);
    const gap = getPipeGap(g.score);

    // Physics
    g.velocity += g.character.gravity * delta;
    if (g.velocity > VELOCITY_MAX) g.velocity = VELOCITY_MAX;
    g.birdY += g.velocity * delta;

    // Tilt based on velocity
    const tilt = Math.max(-30, Math.min(g.velocity * 4, 90));

    // Ground scroll
    g.groundOffset = (g.groundOffset + speed * delta) % 24;

    // Move pipes
    for (const pipe of g.pipes) {
      pipe.x -= speed * delta;
    }

    // Move bonuses
    for (const bonus of g.bonuses) {
      bonus.x -= speed * delta;
    }

    // Spawn new pipes
    const rightMostPipe = g.pipes.length > 0
      ? Math.max(...g.pipes.map(p => p.x))
      : 0;

    if (g.pipes.length === 0 || rightMostPipe < GAME_WIDTH - PIPE_SPAWN_DIST) {
      const pipeX = g.pipes.length === 0 ? GAME_WIDTH + 220 : rightMostPipe + PIPE_SPAWN_DIST;
      const minGapY = gap / 2 + 40;
      const maxGapY = GAME_HEIGHT - GROUND_HEIGHT - gap / 2 - 40;
      const gapY = minGapY + Math.random() * (maxGapY - minGapY);

      g.pipeIdCounter++;
      g.pipes.push({
        id: g.pipeIdCounter,
        x: pipeX,
        gapY,
        gapSize: gap,
        passed: false,
      });

      // Maybe spawn a bonus between pipes
      if (Math.random() < BONUS_CHANCE && g.pipes.length > 1) {
        const bonusChar = BONUS_CHARACTERS[Math.floor(Math.random() * BONUS_CHARACTERS.length)];
        // Don't spawn the same character as the player
        if (bonusChar.id !== g.character.id) {
          g.bonusIdCounter++;
          g.bonuses.push({
            id: g.bonusIdCounter,
            x: pipeX - PIPE_SPAWN_DIST / 2,
            y: gapY + (Math.random() - 0.5) * (gap * 0.4),
            characterId: bonusChar.id,
            image: bonusChar.image,
            points: bonusChar.points,
            collected: false,
          });
        }
      }
    }

    // Check pipe passing (score)
    for (const pipe of g.pipes) {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        g.score++;
        playScoreSound();
      }
    }

    // Check bonus collection
    const birdCenterX = BIRD_X + BIRD_SIZE / 2;
    const birdCenterY = g.birdY + BIRD_SIZE / 2;
    const hitRadius = g.character.hitboxSize;

    for (const bonus of g.bonuses) {
      if (bonus.collected) continue;
      const dx = birdCenterX - (bonus.x + BONUS_SIZE / 2);
      const dy = birdCenterY - (bonus.y + BONUS_SIZE / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius + BONUS_SIZE / 2) {
        bonus.collected = true;
        g.score = Math.max(0, g.score + bonus.points);
        if (bonus.characterId === 'ghost') {
          playGhostSound();
        } else {
          playBonusSound();
        }
      }
    }

    // Remove off-screen pipes and bonuses
    g.pipes = g.pipes.filter(p => p.x > -PIPE_WIDTH - 20);
    g.bonuses = g.bonuses.filter(b => b.x > -BONUS_SIZE - 20 && !b.collected);

    // Collision detection
    let dead = false;

    // Ground
    if (g.birdY + BIRD_SIZE > GAME_HEIGHT - GROUND_HEIGHT) {
      g.birdY = GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
      dead = true;
    }
    // Ceiling - just clamp, don't kill
    if (g.birdY < 0) {
      g.birdY = 0;
      g.velocity = 0;
    }

    // Pipe collision
    for (const pipe of g.pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdCenterX + hitRadius > pipeLeft && birdCenterX - hitRadius < pipeRight) {
        const topPipeBottom = pipe.gapY - pipe.gapSize / 2;
        const bottomPipeTop = pipe.gapY + pipe.gapSize / 2;

        if (birdCenterY - hitRadius < topPipeBottom || birdCenterY + hitRadius > bottomPipeTop) {
          dead = true;
          break;
        }
      }
    }

    if (dead) {
      g.dead = true;
      g.playing = false;
      playHitSound();
      setTimeout(() => playGameOverSound(), 300);

      const finalScore = g.score;
      setScore(finalScore);
      if (finalScore > (parseInt(localStorage.getItem('fb-high-score') || '0', 10))) {
        localStorage.setItem('fb-high-score', String(finalScore));
        setHighScore(finalScore);
      }
      setBirdY(g.birdY);
      setBirdTilt(90);
      setPipes(g.pipes.map(p => ({ ...p })));
      setBonuses(g.bonuses.map(b => ({ ...b })));
      setGroundOffset(g.groundOffset);
      setPhase('dead');
      return;
    }

    // Update React state
    setBirdY(g.birdY);
    setBirdTilt(tilt);
    setScore(g.score);
    setPipes(g.pipes.map(p => ({ ...p })));
    setBonuses(g.bonuses.map(b => ({ ...b })));
    setGroundOffset(g.groundOffset);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [getPipeSpeed, getPipeGap]);

  const flap = useCallback(() => {
    const g = gameRef.current;
    if (!g.playing || g.dead) return;
    const now = performance.now();
    if (now - lastFlapRef.current < 80) return;
    lastFlapRef.current = now;
    g.velocity = g.character.flapForce;
    playFlapSound();
    setIsFlapping(true);
    clearTimeout(flapTimerRef.current);
    flapTimerRef.current = setTimeout(() => setIsFlapping(false), 300);
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.birdY = GAME_HEIGHT / 2 - BIRD_SIZE / 2;
    g.velocity = -2;
    g.pipes = [];
    g.bonuses = [];
    g.score = 0;
    g.pipeIdCounter = 0;
    g.bonusIdCounter = 0;
    g.groundOffset = 0;
    g.lastPipeX = GAME_WIDTH + 100;
    g.dead = false;
    g.playing = true;
    g.character = selectedCharacter;

    setBirdY(g.birdY);
    setBirdTilt(0);
    setPipes([]);
    setBonuses([]);
    setScore(0);
    setGroundOffset(0);
    setPhase('playing');

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [selectedCharacter, gameLoop]);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase('start');
    setBirdY(GAME_HEIGHT / 2 - BIRD_SIZE / 2);
    setBirdTilt(0);
    setPipes([]);
    setBonuses([]);
    setScore(0);
    setGroundOffset(0);
  }, []);

  const selectCharacter = useCallback((char: BirdCharacter) => {
    setSelectedCharacter(char);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
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
  };
}
