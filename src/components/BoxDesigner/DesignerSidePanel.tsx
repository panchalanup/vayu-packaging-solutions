/**
 * Designer Side Panel
 * Switches between Edit (box spec), Customize (artwork) and Actions (export/share). Used on desktop as the side
 * panel and on mobile inside the bottom sheet, so both get the same features.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { DesignerTab } from './IconSidebar';
import BoxSpecPanel from './BoxSpecPanel';
import ArtworkEditor from './ArtworkEditor';
import ExportPanel from './ExportPanel';
import type { BoxDesign, BoxFace } from '@/types/boxDesigner';

type Update = (patch: Partial<BoxDesign> | ((d: BoxDesign) => Partial<BoxDesign>), key?: string) => void;

interface DesignerSidePanelProps {
  activeTab: DesignerTab;
  design: BoxDesign;
  update: Update;
  selectedFace: BoxFace | null;
  onSelectFace: (face: BoxFace | null) => void;
  faceSizes: Partial<Record<BoxFace, { widthCm: number; heightCm: number }>>;
  capture: () => Promise<Blob | null>;
  onImport: (design: BoxDesign) => void;
  onReset: () => void;
  quoteHref: string;
  onQuote: () => void;
  onShare: (method: 'link' | 'whatsapp' | 'email') => void;
  onFoldReset: () => void;
  /** Mobile sheet supplies its own scroll container */
  embedded?: boolean;
}

const TITLES: Record<DesignerTab, { title: string; subtitle: string }> = {
  edit: { title: 'Edit Box', subtitle: 'Style, size, board strength and colour' },
  customize: { title: 'Customize', subtitle: 'Place logos and text on any surface' },
  export: { title: 'Actions', subtitle: 'Quote, download, save and share' },
};

export default function DesignerSidePanel(props: DesignerSidePanelProps) {
  const { activeTab, design, update, embedded } = props;
  return (
    <div className={embedded ? '' : 'h-full bg-paper-100 border-r border-border overflow-y-auto overflow-x-hidden'}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.15 }}
          className={embedded ? 'p-4 space-y-4' : 'p-5 space-y-5'}
        >
          <div>
            <h2 className="font-display text-xl text-foreground">{TITLES[activeTab].title}</h2>
            <p className="text-sm text-muted-foreground">{TITLES[activeTab].subtitle}</p>
          </div>

          {activeTab === 'edit' && <BoxSpecPanel design={design} update={update} onFoldReset={props.onFoldReset} />}
          {activeTab === 'customize' && (
            <ArtworkEditor
              design={design}
              update={update}
              selectedFace={props.selectedFace}
              onSelectFace={props.onSelectFace}
              faceSizes={props.faceSizes}
            />
          )}
          {activeTab === 'export' && (
            <ExportPanel
              design={design}
              capture={props.capture}
              onImport={props.onImport}
              onReset={props.onReset}
              quoteHref={props.quoteHref}
              onQuote={props.onQuote}
              onShare={props.onShare}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
