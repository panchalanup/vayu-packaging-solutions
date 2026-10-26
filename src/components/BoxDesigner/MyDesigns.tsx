/**
 * My designs (#7) with version snapshots (#28-lite, #30). Saved in this browser only, no sign-up.
 * "Save" adds a version to the design you opened (or creates a new one); every entry keeps its last versions,
 * so going back to yesterday's version is one tap.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, FolderOpen, History, MoreHorizontal, Pencil, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { BoxDesign } from '@/types/boxDesigner';
import {
  SavedDesign,
  defaultDesignName,
  deleteDesign,
  duplicateDesign,
  listDesigns,
  loadVersion,
  renameDesign,
  saveDesign,
} from '@/lib/boxDesigner/myDesigns';
import { useEventTracker } from '@/hooks/useAnalytics';

interface MyDesignsProps {
  design: BoxDesign;
  onOpen: (design: BoxDesign) => void;
  /** Small JPEG of the current 3D view, when the 3D view is available */
  snapshot?: () => Promise<string | null>;
}

const CURRENT_KEY = 'vayu-box-designer:current-saved';
const readCurrent = () => {
  try {
    return window.sessionStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
};
const writeCurrent = (id: string | null) => {
  try {
    if (id) window.sessionStorage.setItem(CURRENT_KEY, id);
    else window.sessionStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
};

const when = (at: number) => {
  const minutes = Math.round((Date.now() - at) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  return new Date(at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function MyDesigns({ design, onOpen, snapshot }: MyDesignsProps) {
  const { trackEvent } = useEventTracker();
  const [items, setItems] = useState<SavedDesign[]>(() => listDesigns());
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const id = readCurrent();
    return id && listDesigns().some((e) => e.id === id) ? id : null;
  });
  const [versionsOf, setVersionsOf] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const current = items.find((e) => e.id === currentId) ?? null;

  const save = async (asNew: boolean) => {
    setSaving(true);
    try {
      const thumb = snapshot ? await snapshot().catch(() => null) : null;
      const result = saveDesign(design, { id: asNew ? null : currentId, name: asNew ? defaultDesignName(design) : undefined, thumb });
      if (!result.ok || !result.entry) {
        toast.error('Could not save: this browser’s storage is full. Try deleting an old design.');
        return;
      }
      setItems(listDesigns());
      setCurrentId(result.entry.id);
      writeCurrent(result.entry.id);
      trackEvent('designer_saved', { style: design.template, ply: design.ply, kind: asNew || !currentId ? 'new' : 'version' });
      toast.success(asNew || !currentId ? 'Saved to My designs' : `Version ${result.entry.versions.length} saved`, {
        description: result.imagesDropped ? 'Saved without images: they were too large for this browser.' : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const open = (entry: SavedDesign, index = 0) => {
    const loaded = loadVersion(entry, index);
    if (!loaded) {
      toast.error('This saved design could not be opened');
      return;
    }
    onOpen(loaded);
    setCurrentId(entry.id);
    writeCurrent(entry.id);
    toast.success(index ? `Opened an earlier version of “${entry.name}”` : `Opened “${entry.name}”`, { description: 'Press Ctrl+Z to go back.' });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">My designs</h3>
          <p className="text-xs text-muted-foreground">{current ? `Editing “${current.name}”` : 'Saved in this browser, no sign-up'}</p>
        </div>
        <Button size="sm" onClick={() => save(false)} disabled={saving}>
          <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving…' : current ? 'Save version' : 'Save'}
        </Button>
      </div>
      {current && (
        <button type="button" className="text-xs text-primary hover:underline" onClick={() => save(true)} disabled={saving}>
          Save as a new design instead
        </button>
      )}

      {items.length > 0 && (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {items.map((entry) => (
            <li key={entry.id} className={`rounded-lg border ${entry.id === currentId ? 'border-primary/60 bg-primary/5' : 'border-border'}`}>
              <div className="flex items-center gap-2.5 p-2">
                <button type="button" onClick={() => open(entry)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left" aria-label={`Open ${entry.name}`}>
                  <span className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-paper-100">
                    {entry.thumb ? <img src={entry.thumb} alt="" className="h-full w-full object-cover" /> : <FolderOpen className="h-4 w-4 text-muted-foreground" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{entry.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {when(entry.updatedAt)} · {entry.versions.length} version{entry.versions.length > 1 ? 's' : ''}
                    </span>
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`More actions for ${entry.name}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => open(entry)}>
                      <FolderOpen className="mr-2 h-4 w-4" /> Open
                    </DropdownMenuItem>
                    {entry.versions.length > 1 && (
                      <DropdownMenuItem onSelect={() => setVersionsOf(versionsOf === entry.id ? null : entry.id)}>
                        <History className="mr-2 h-4 w-4" /> Versions
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onSelect={() => {
                        const name = window.prompt('Rename design', entry.name);
                        if (name !== null) setItems(renameDesign(entry.id, name));
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setItems(duplicateDesign(entry.id))}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => {
                        if (!window.confirm(`Delete “${entry.name}” and all its versions?`)) return;
                        setItems(deleteDesign(entry.id));
                        if (entry.id === currentId) {
                          setCurrentId(null);
                          writeCurrent(null);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <AnimatePresence initial={false}>
                {versionsOf === entry.id && (
                  <motion.ol initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
                    {entry.versions.map((v, i) => (
                      <li key={v.at}>
                        <button type="button" onClick={() => open(entry, i)} className="flex w-full justify-between px-3 py-1.5 text-xs hover:bg-foreground/5">
                          <span>{i === 0 ? 'Latest' : `Version ${entry.versions.length - i}`}</span>
                          <span className="text-muted-foreground">{when(v.at)}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ol>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
