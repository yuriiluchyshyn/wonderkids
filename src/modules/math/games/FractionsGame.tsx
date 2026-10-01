import { useEffect, useState } from 'react';
import type { GameViewProps } from '@/core/kernel/types';
import { AnswerTile, type TileState } from '../components/AnswerTile';
import { FractionGlyph } from '../components/FractionGlyph';
import { PieFood } from '../components/PieFood';
import type { Fraction, FractionPayload } from '../math.types';
import styles from './Games.module.css';

const sameFraction = (x: Fraction, y: Fraction) => x.n === y.n && x.d === y.d;

/** Visual fractions: see the highlighted slices, tap the matching fraction. */
export function FractionsGame({ task, callbacks }: GameViewProps<FractionPayload>) {
  const { food, denom, filled, answer, options } = task.payload;
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Fraction | null>(null);

  useEffect(() => {
    setSolved(false);
    setWrong(null);
  }, [task.id]);

  const choose = (value: Fraction) => {
    if (solved) return;
    if (sameFraction(value, answer)) {
      setSolved(true);
      callbacks.onSuccess();
    } else {
      setWrong(value);
      callbacks.onMistake();
    }
  };

  const tileState = (value: Fraction): TileState => {
    if (solved && sameFraction(value, answer)) return 'correct';
    if (wrong && sameFraction(wrong, value)) return 'wrong';
    return 'idle';
  };

  return (
    <div className="stack">
      <div className={styles.prompt}>
        <PieFood food={food} denom={denom} filled={filled} />
      </div>

      <div className={styles.tiles}>
        {options.map((value) => (
          <AnswerTile
            key={`${value.n}/${value.d}`}
            state={tileState(value)}
            onClick={() => choose(value)}
            ariaLabel={`${value.n} з ${value.d}`}
          >
            <FractionGlyph value={value} />
          </AnswerTile>
        ))}
      </div>
    </div>
  );
}
