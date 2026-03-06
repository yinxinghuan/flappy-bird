export interface BirdCharacter {
  id: string;
  name: string;
  image: string;
  gravity: number;
  flapForce: number;
  hitboxSize: number;
  description: string;
}

export interface PipeState {
  id: number;
  x: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
}

export interface BonusState {
  id: number;
  x: number;
  y: number;
  characterId: string;
  image: string;
  points: number;
  collected: boolean;
}

export interface GameState {
  birdY: number;
  birdVelocity: number;
  birdTilt: number;
  pipes: PipeState[];
  bonuses: BonusState[];
  score: number;
  phase: 'start' | 'playing' | 'dead';
  groundOffset: number;
}

export interface FlappyBirdProps {
  onGameEnd?: (finalScore: number) => void;
}
