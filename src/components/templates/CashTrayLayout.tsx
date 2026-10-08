import { AnimatePresence, motion } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { useSound } from '@/core/audio/useSound';
import { useVoiceSpeak } from '@/core/audio/useSpeech';
import type { CashTrayPayload } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { counted } from '@/core/lang/uk';
import { currencyOf } from '@/core/game/content/currency';
import { Bubble, CardFace, PULSE, type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

const TOO_MUCH = 'Це забагато! Забери трохи назад.';

/** The colour (hue) of a paper note by its value — like real notes, each is its own. */
const NOTE_HUE: Record<number, number> = { 5: 205, 10: 350, 20: 140, 50: 275, 100: 75, 200: 325 };


/**
 * Cash tray (UI_DRAG_MATCH family) — a toy with a price tag; drag or tap coins
 * and notes onto the till tray until they add up exactly. Going over is not a
 * failure: the till just asks to take a little back. Small change is round
 * metal coins; everything bigger is a paper note in the colour of its value.
 */
export function CashTrayLayout({ payload, callbacks, hintActive }: LayoutProps<CashTrayPayload>) {
  const { item, price, wallet } = payload;
  const money = currencyOf(payload.currency);
  const isNote = (value: number) => !money.coins.includes(value);
  const { playCode, chime } = useSound();
  const speak = useVoiceSpeak('hint');
  // Indices into `wallet` that currently sit on the tray.
  const [onTray, setOnTray] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const sum = onTray.reduce((s, i) => s + wallet[i], 0);
  const over = sum > price;

  const settle = (next: number[]) => {
    const total = next.reduce((s, i) => s + wallet[i], 0);
    setOnTray(next);
    if (total === price) {
      setSolved(true);
      playCode('SND_DROP_SLOT');
      callbacks.onSuccess();
    } else if (total > price && sum <= price) {
      // Count the overshoot once, at the moment it happens.
      speak(TOO_MUCH);
      callbacks.onMistake();
    }
  };

  const add = (index: number) => {
    if (solved || onTray.includes(index)) return;
    chime(onTray.length);
    settle([...onTray, index]);
  };
  const remove = (index: number) => {
    if (solved) return;
    playCode('SND_DRAG_START');
    settle(onTray.filter((i) => i !== index));
  };
  const dnd = useDragDrop((id) => add(Number(id)), solved);

  const coin = (index: number) => (
    isNote(wallet[index]) ? (
      // A paper note: the value in two corners and in the middle, tinted by how much it is worth.
      <span className={cn(styles.money, styles.note)} style={{ '--note': NOTE_HUE[wallet[index]] ?? 150 } as CSSProperties}>
        <i aria-hidden>{wallet[index]}</i>
        {wallet[index]}
        <small>{money.sign}</small>
        <i aria-hidden>{wallet[index]}</i>
      </span>
    ) : (
      <span className={cn(styles.money, styles.coin, wallet[index] >= 5 && styles.coinGold)}>
        {wallet[index]}
        <small>{money.sign}</small>
      </span>
    )
  );

  return (
    <div className="stack">
      <div className={styles.shopItem}>
        <button type="button" className={styles.shopToy} onClick={callbacks.speakPrompt}>
          <CardFace card={item} speaker={false} />
        </button>
        <span className={styles.priceTag}>
          {price} <small>{money.short}</small>
        </span>
      </div>

      <motion.div
        className={cn(styles.till, solved && styles.correct, over && styles.tillOver)}
        animate={solved ? PULSE : { scale: 1 }}
        {...dnd.target('tray')}
      >
        {onTray.length === 0 && <span className={styles.tillEmpty}>🧾</span>}
        {onTray.map((index) => (
          <button key={index} type="button" className={styles.moneyBtn} onClick={() => remove(index)} aria-label={`Забрати ${counted(wallet[index], money.counted)}`}>
            {coin(index)}
          </button>
        ))}
        {(hintActive || over || solved) && (
          <span className={styles.tillSum}>
            = {sum} <small>{money.short}</small>
          </span>
        )}
      </motion.div>
      <AnimatePresence>{over && !solved && <Bubble>{TOO_MUCH}</Bubble>}</AnimatePresence>

      <div className={styles.tray}>
        {wallet.map((value, index) =>
          onTray.includes(index) ? null : (
            <div
              key={index}
              className={styles.moneyBtn}
              style={dnd.styleFor(String(index))}
              {...dnd.bind(String(index))}
              onClick={() => add(index)}
              role="button"
              aria-label={counted(value, money.counted)}
            >
              {coin(index)}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
