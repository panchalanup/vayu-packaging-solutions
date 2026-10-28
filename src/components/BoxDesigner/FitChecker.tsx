/**
 * Fit checker (#23): "What goes in the box?" -> recommended inside size, applied with one tap (undoable).
 */

import { useMemo, useState } from 'react';
import { Check, PackageCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { BoxDesign, BoxDimensions } from '@/types/boxDesigner';
import { DEFAULT_PADDING_CM, recommendInsideSize, sameSize, validProduct } from '@/lib/boxDesigner/fit';
import { formatDimensions, formatLength } from '@/lib/boxDesigner/units';
import { PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import UnitDimensionField from './UnitDimensionField';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface FitCheckerProps {
  design: BoxDesign;
  update: Update;
}

export default function FitChecker({ design, update }: FitCheckerProps) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<BoxDimensions>({ length: NaN, width: NaN, height: NaN });
  const [padding, setPadding] = useState(DEFAULT_PADDING_CM);
  const [fragile, setFragile] = useState(false);
  const [weight, setWeight] = useState('');
  const unit = design.unit;

  const weightKg = weight.trim() === '' ? undefined : Number(weight.replace(',', '.'));
  const result = useMemo(
    () => (validProduct(product) ? recommendInsideSize({ product, paddingCm: padding, fragile, weightKg }) : null),
    [product, padding, fragile, weightKg]
  );
  const applied = result ? sameSize(result.inside, design.dimensions) : false;
  const plyNeeded = result?.suggestedPly && PLY_OPTIONS.findIndex((p) => p.id === result.suggestedPly) > PLY_OPTIONS.findIndex((p) => p.id === design.ply);

  const apply = () => {
    if (!result) return;
    const ply = plyNeeded ? PLY_OPTIONS.find((p) => p.id === result.suggestedPly) : undefined;
    update({ dimensions: result.inside, ...(ply ? { ply: ply.id, flutes: ply.flutes[0] } : {}) }, 'fit-apply');
  };

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold">Will my product fit?</span>
            <span className="block text-xs text-muted-foreground">Enter your product size, we suggest the box</span>
          </span>
        </span>
        <span className="text-xs font-semibold text-primary">{open ? 'Hide' : 'Check'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3 border-t border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground">Product size</p>
              <div className="grid grid-cols-3 gap-2">
                {(['length', 'width', 'height'] as const).map((k) => (
                  <UnitDimensionField
                    key={k}
                    label={k[0].toUpperCase() + k.slice(1)}
                    value={product[k]}
                    unit={unit}
                    min={0.1}
                    max={500}
                    optional
                    onCommit={(cm) => setProduct((p) => ({ ...p, [k]: cm }))}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <UnitDimensionField label="Padding per side" value={padding} unit={unit} min={0} max={10} onCommit={setPadding} />
                <div className="space-y-1">
                  <Label htmlFor="fit-weight" className="text-xs text-muted-foreground">
                    Weight (optional)
                  </Label>
                  <div className="relative">
                    <input
                      id="fit-weight"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, '').slice(0, 6))}
                      className="h-10 w-full rounded-md border border-border bg-white pl-3 pr-9 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">kg</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fit-fragile" className="text-sm">
                  Fragile?
                  <span className="block text-xs font-normal text-muted-foreground">Glass, ceramics, electronics</span>
                </Label>
                <Switch id="fit-fragile" checked={fragile} onCheckedChange={setFragile} />
              </div>

              <div aria-live="polite">
                {result ? (
                  <motion.div
                    key={formatDimensions(result.inside, unit)}
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3"
                  >
                    <p className="text-xs text-muted-foreground">Recommended inside size</p>
                    <p className="font-display text-lg text-foreground">{formatDimensions(result.inside, unit)}</p>
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                      <li>
                        {formatLength(result.paddingCm, unit)} padding each side
                        {result.paddingRaised ? ' (raised for fragile goods)' : ''}, plus a little room to slide in.
                      </li>
                      {result.suggestedPly && <li>For this weight we suggest {result.suggestedPly} board.</li>}
                      {result.tooLarge && <li className="text-error-700">Larger than this tool models; we capped it. Ask us for big cartons.</li>}
                    </ul>
                    <Button size="sm" className="w-full" onClick={apply} disabled={applied && !plyNeeded}>
                      {applied && !plyNeeded ? (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Box already this size
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-4 w-4" /> Use this size{plyNeeded ? ` and ${result.suggestedPly}` : ''}
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <p className="text-xs text-muted-foreground">Fill in all three product sides to see the box size.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
