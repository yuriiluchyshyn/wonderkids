import { useActiveTheme } from '@/core/theme/useActiveTheme';
import styles from './ThemeDecor.module.css';

/** A toy brick drawn from the side: body, studs on top, plastic highlight. */
function Brick({ studs, height = 24, color }: { studs: number; height?: number; color: string }) {
  const stud = 16;
  const width = studs * stud;
  return (
    <svg width={width} height={height + 7} viewBox={`0 0 ${width} ${height + 7}`}>
      {Array.from({ length: studs }, (_, i) => (
        <rect key={i} x={i * stud + 3} y={0} width={10} height={8} rx={2} fill={color} stroke="rgba(0,0,0,0.28)" />
      ))}
      <rect x={0.5} y={6.5} width={width - 1} height={height} rx={2.5} fill={color} stroke="rgba(0,0,0,0.28)" />
      <rect x={3} y={9} width={width - 6} height={4} rx={2} fill="rgba(255,255,255,0.38)" />
    </svg>
  );
}

/** A roof slope piece. */
function Slope({ color }: { color: string }) {
  return (
    <svg width={48} height={31} viewBox="0 0 48 31">
      <rect x={3} y={0} width={10} height={8} rx={2} fill={color} stroke="rgba(0,0,0,0.28)" />
      <path d="M0.5 30.5 V8.5 Q0.5 6.5 2.5 6.5 H16 L47.5 30.5 Z" fill={color} stroke="rgba(0,0,0,0.28)" />
      <path d="M4 10 H15 L22 16 H4 Z" fill="rgba(255,255,255,0.32)" />
    </svg>
  );
}

/** A round 1×1 piece seen from above. */
function RoundStud({ color }: { color: string }) {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28">
      <circle cx={14} cy={14} r={13} fill={color} stroke="rgba(0,0,0,0.28)" />
      <circle cx={14} cy={14} r={7} fill="rgba(255,255,255,0.3)" stroke="rgba(0,0,0,0.2)" />
    </svg>
  );
}

const RED = '#e3000b';
const BLUE = '#006cb7';
const GREEN = '#00a650';
const ORANGE = '#f57c00';
const WHITE = '#f4f4f4';
const YELLOW = '#ffd500';

/** Different kinds of bricks scattered around the edges of the baseplate. */
function LegoDecor() {
  return (
    <div className={styles.lego}>
      <span style={{ top: '11%', left: '3%', rotate: '-12deg' }}><Brick studs={4} color={RED} /></span>
      <span style={{ top: '24%', right: '4%', rotate: '9deg' }}><Brick studs={2} color={BLUE} /></span>
      <span style={{ top: '43%', left: '2%', rotate: '6deg' }}><Brick studs={3} height={10} color={GREEN} /></span>
      <span style={{ top: '58%', right: '3%', rotate: '-8deg' }}><Slope color={RED} /></span>
      <span style={{ top: '71%', left: '5%', rotate: '14deg' }}><RoundStud color={BLUE} /></span>
      <span style={{ top: '82%', right: '6%', rotate: '-5deg' }}><Brick studs={4} color={WHITE} /></span>
      <span style={{ top: '90%', left: '30%', rotate: '4deg' }}><Brick studs={6} height={10} color={ORANGE} /></span>
      <span style={{ top: '6%', right: '28%', rotate: '10deg' }}><RoundStud color={RED} /></span>
      <span style={{ top: '35%', right: '1%', rotate: '-14deg' }}><Brick studs={1} color={GREEN} /></span>
      <span style={{ top: '65%', left: '1%', rotate: '-6deg' }}><Brick studs={2} color={YELLOW} /></span>
    </div>
  );
}

/** 8×8 pixel face of the green "creeper", row by row (1 = dark pixel). */
const CREEPER = ['00000000', '01100110', '01100110', '00011000', '00111100', '00111100', '00100100', '00000000'];

export function CreeperFace({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" aria-hidden>
      {Array.from({ length: 64 }, (_, i) => {
        const x = i % 8;
        const y = Math.floor(i / 8);
        // Mottled greens, deterministic so it never flickers.
        const shade = ['#5cb531', '#4fa02a', '#6ac53c', '#48932a'][(x * 3 + y * 5 + ((x * y) % 3)) % 4];
        return <rect key={i} x={x} y={y} width={1} height={1} fill={CREEPER[y][x] === '1' ? '#101810' : shade} />;
      })}
    </svg>
  );
}

/** Blocky sky: pixel clouds, a square sun, and grass-over-dirt along the bottom. */
function MinecraftDecor() {
  return (
    <div className={styles.minecraft}>
      <span className={styles.sun} />
      <span className={styles.cloud} style={{ top: '9%', left: '6%' }} />
      <span className={styles.cloud} style={{ top: '21%', left: '58%', scale: '0.7' }} />
      <span className={styles.cloud} style={{ top: '38%', left: '22%', scale: '0.55' }} />
      <span className={styles.creeper}>
        <CreeperFace size={72} />
      </span>
      <span className={styles.ground} />
    </div>
  );
}

/** Themes that bring their own full-screen scenery (no galaxy sky on top). */
export function hasOwnScenery(themeId: string): boolean {
  return themeId === 'lego' || themeId === 'minecraft';
}

/**
 * Full-screen scenery behind the app for themes that are more than a palette.
 * Purely decorative: fixed, behind all content, ignores pointer events.
 */
export function ThemeDecor() {
  const theme = useActiveTheme();
  if (theme.id === 'lego') return <LegoDecor />;
  if (theme.id === 'minecraft') return <MinecraftDecor />;
  return null;
}

/** The theme's wordmark, shown at the top of the hub for branded themes. */
export function ThemeBrand() {
  const theme = useActiveTheme();
  if (theme.id === 'lego') {
    return (
      <div className={styles.brandRow}>
        <span className={styles.legoLogo} role="img" aria-label="LEGO">
          <span data-text="LEGO">LEGO</span>
        </span>
        <span className={styles.brandBricks} aria-hidden>
          <Brick studs={2} color={RED} />
          <Brick studs={2} color={BLUE} />
          <Brick studs={2} color={GREEN} />
        </span>
      </div>
    );
  }
  if (theme.id === 'minecraft') {
    return (
      <div className={styles.brandRow}>
        <CreeperFace size={44} />
        <span className={styles.mcLogo} role="img" aria-label="MINECRAFT">
          MINECRAFT
        </span>
      </div>
    );
  }
  return null;
}
