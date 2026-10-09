import { useT } from '@/core/i18n';
import { useState } from 'react';
import { useSound } from '@/core/audio/useSound';
import type { TangramPayload, TangramPiece } from '@/core/game/templates/types';
import { cn } from '@/core/utils/cn';
import { type LayoutProps } from './parts';
import { useDragDrop } from './useDragDrop';
import styles from './Templates.module.css';

/** SVG outline of one piece, centred on (0,0), `size` wide. */
export function PieceShape({ piece, className, fill }: { piece: Pick<TangramPiece, 'shape' | 'size'>; className?: string; fill?: string }) {
  const h = piece.size / 2;
  const common = { className, fill };
  switch (piece.shape) {
    case 'circle':
      return <circle r={h} {...common} />;
    case 'triangle':
      return <polygon points={`0,${-h} ${h},${h} ${-h},${h}`} {...common} />;
    case 'rect':
      return <rect x={-h} y={-h / 2} width={piece.size} height={h} rx={1} {...common} />;
    default:
      return <rect x={-h} y={-h} width={piece.size} height={piece.size} rx={1} {...common} />;
  }
}

/** Two pieces are interchangeable when they are the same shape and size. */
const fits = (a: TangramPiece, b: TangramPiece) => a.shape === b.shape && a.size === b.size;

/**
 * Tangram (UI_DRAG_MATCH family) — rebuild an animal silhouette by dragging
 * geometric shapes onto their dashed outlines. Pieces snap in with a magnetic
 * click; on a mismatch the outline that fits flashes a dotted guide.
 */
export function TangramLayout({ payload, callbacks, hintActive }: LayoutProps<TangramPayload>) {
  const t = useT();
  const { pieces, figure } = payload;
  const { playCode } = useSound();
  // outline id → the piece that filled it.
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [guide, setGuide] = useState<string | null>(null);

  const used = new Set(Object.values(filled));
  const waiting = pieces.filter((p) => !used.has(p.id));
  const done = waiting.length === 0;
  const hintOutline =
    hintActive && waiting[0] ? pieces.find((o) => !filled[o.id] && fits(o, waiting[0]))?.id : null;

  const onDrop = (pieceId: string, outlineId: string) => {
    const piece = pieces.find((p) => p.id === pieceId);
    const outline = pieces.find((p) => p.id === outlineId);
    if (!piece || !outline || filled[outlineId]) return;
    if (!fits(piece, outline)) {
      // Animated dotted guide towards a spot that does fit.
      setGuide(pieces.find((o) => !filled[o.id] && fits(o, piece))?.id ?? null);
      window.setTimeout(() => setGuide(null), 900);
      callbacks.onMistake();
      return;
    }
    const next = { ...filled, [outlineId]: pieceId };
    setFilled(next);
    playCode('SND_DROP_SLOT');
    if (Object.keys(next).length === pieces.length) callbacks.onSuccess();
  };
  const dnd = useDragDrop(onDrop, done);

  return (
    <div className="stack">
      <div className={styles.tangramWrap}>
        <svg viewBox="0 0 100 100" className={styles.tangram} role="group" aria-label={t('tpl.silhouette', { figure })}>
          {pieces.map((outline) => {
            const by = pieces.find((p) => p.id === filled[outline.id]);
            return (
              <g
                key={outline.id}
                transform={`translate(${outline.x} ${outline.y}) rotate(${outline.rotate ?? 0})`}
                {...dnd.target(outline.id)}
              >
                <PieceShape
                  piece={outline}
                  fill={by ? by.color : undefined}
                  className={cn(
                    by ? styles.tangramFilled : styles.tangramOutline,
                    !by && (hintOutline === outline.id || guide === outline.id) && styles.tangramGuide,
                  )}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.tray}>
        {waiting.map((piece) => (
          <div
            key={piece.id}
            className={cn(styles.tangramPiece, dnd.selected === piece.id && styles.chipSelected)}
            style={dnd.styleFor(piece.id)}
            {...dnd.bind(piece.id)}
            role="button"
            aria-label={t('tpl.shape')}
          >
            <svg viewBox="-16 -16 32 32" width="56" height="56">
              <g transform={`rotate(${piece.rotate ?? 0}) scale(${24 / piece.size})`}>
                <PieceShape piece={piece} fill={piece.color} />
              </g>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
