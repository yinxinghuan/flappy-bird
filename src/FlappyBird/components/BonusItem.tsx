import React, { forwardRef } from 'react';
import type { BonusState } from '../types';
import { BONUS_SIZE } from '../hooks/useFlappyBird';
import './BonusItem.less';

export interface BonusItemProps {
  bonus?: BonusState;
}

const BonusItem = React.memo(
  forwardRef<HTMLDivElement, BonusItemProps>(function BonusItem(props, ref) {
    const { bonus } = props;
    if (!bonus || bonus.collected) return null;

    const isGhost = bonus.characterId === 'ghost';

    return (
      <div
        ref={ref}
        className={`fb-bonus ${isGhost ? 'fb-bonus--ghost' : 'fb-bonus--good'}`}
        style={{
          left: bonus.x,
          top: bonus.y - BONUS_SIZE / 2,
          width: BONUS_SIZE,
          height: BONUS_SIZE,
        }}
      >
        <img
          src={bonus.image}
          alt={bonus.characterId}
          className="fb-bonus__img"
          draggable={false}
        />
        <span className="fb-bonus__label">
          {bonus.points > 0 ? `+${bonus.points}` : bonus.points}
        </span>
      </div>
    );
  })
);

BonusItem.displayName = 'BonusItem';
export { BonusItem };
