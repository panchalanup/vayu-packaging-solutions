/**
 * Icon Sidebar Component
 * Vertical icon navigation for designer tabs (ink chrome, green-400 active state, §9.9)
 */

import { motion } from 'framer-motion';
import { Edit3, Box, Palette, Save, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type DesignerTab = 'edit' | 'customize' | 'export';

interface IconSidebarProps {
  activeTab: DesignerTab;
  onTabChange: (tab: DesignerTab) => void;
}

interface TabConfig {
  id: DesignerTab;
  icon: typeof Edit3;
  label: string;
  color: string;
}

const TABS: TabConfig[] = [
  {
    id: 'edit',
    icon: Edit3,
    label: 'Edit Box',
    color: '#3DBA5A', // green-400
  },
  {
    id: 'customize',
    icon: Palette,
    label: 'Customize',
    color: '#3DBA5A', // green-400
  },
  {
    id: 'export',
    icon: Save,
    label: 'Actions',
    color: '#3DBA5A', // green-400
  },
];

export default function IconSidebar({ activeTab, onTabChange }: IconSidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full bg-ink-900 border-r border-ink-800">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-ink-800">
          <Box className="w-7 h-7 text-green-400" aria-hidden="true" />
        </div>

        {/* Tab Icons */}
        <div className="flex-1 py-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative w-full h-16 flex items-center justify-center group"
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-2.5 w-1.5 h-11 rounded-r-full"
                        style={{ backgroundColor: tab.color }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                        isActive
                          ? 'shadow-md scale-100'
                          : 'scale-90 hover:scale-95 hover:bg-ink-800'
                      }`}
                      style={{
                        backgroundColor: isActive ? `${tab.color}26` : 'transparent',
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? '' : 'text-paper-muted group-hover:text-paper-50'
                        }`}
                        style={{ color: isActive ? tab.color : undefined }}
                      />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Info button at bottom */}
        <div className="border-t border-ink-800 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label="Help and info" className="w-full h-12 flex items-center justify-center group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-ink-800 transition-colors">
                  <Info className="w-5 h-5 text-paper-muted group-hover:text-paper-50" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Help & Info
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
