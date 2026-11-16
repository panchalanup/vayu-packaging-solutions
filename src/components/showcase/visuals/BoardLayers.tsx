/**
 * Corrugated board in cross-section: flat liners with wavy flutes between them. 3-ply is one flute, 5-ply two, 7-ply
 * three, drawn from the real counts. Layers drop into place one after another each time the board changes (a keyed
 * CSS animation, transform and opacity only).
 */

const LINER = 9;
const AMP = 11;
const PITCH = 30;
const WIDTH = 330;

const fluteWave = (y: number): string => {
  const pts: string[] = [];
  for (let x = 0; x <= WIDTH; x += 5) pts.push(`${x} ${(y + AMP + Math.sin((x / PITCH) * Math.PI * 2) * AMP).toFixed(1)}`);
  return `M${pts.join('L')}`;
};

export default function BoardLayers({ liners, flutes, label }: { liners: number; flutes: number; label: string }) {
  const layers: { kind: 'liner' | 'flute'; y: number }[] = [];
  let y = 4;
  for (let i = 0; i < liners; i++) {
    layers.push({ kind: 'liner', y });
    y += LINER;
    if (i < flutes) {
      layers.push({ kind: 'flute', y });
      y += AMP * 2;
    }
  }
  const height = y + 4;
  return (
    <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={label} className="h-auto w-full overflow-visible">
      {layers.map((l, i) =>
        l.kind === 'liner' ? (
          <rect key={`${i}-l`} className="bl-layer" style={{ ['--i' as string]: i }} x="0" y={l.y} width={WIDTH} height={LINER} rx="2" fill="#C9A87C" stroke="#8A6440" strokeOpacity="0.6" />
        ) : (
          <path key={`${i}-f`} className="bl-layer" style={{ ['--i' as string]: i }} d={fluteWave(l.y)} fill="none" stroke="#E2C79B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        )
      )}
    </svg>
  );
}
