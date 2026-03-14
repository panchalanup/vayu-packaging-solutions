/**
 * Icon Sidebar Component
 * iOS-style vertical icon navigation for designer tabs
 */

import { motion } from 'framer-motion';
import { Edit3, Box, Palette, Save, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type DesignerTab = 'edit' | 'model' | 'customize' | 'export';

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
    color: '#3b82f6', // blue
  },
  {
    id: 'model',
    icon: Box,
    label: 'Model',
    color: '#8b5cf6', // purple
  },
  {
    id: 'customize',
    icon: Palette,
    label: 'Customize',
    color: '#ec4899', // pink
  },
  {
    id: 'export',
    icon: Save,
    label: 'Actions',
    color: '#10b981', // green
  },
];

export default function IconSidebar({ activeTab, onTabChange }: IconSidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Box className="w-7 h-7 text-primary" />
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
                    className="relative w-full h-16 flex items-center justify-center group"
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full"
                        style={{ backgroundColor: tab.color }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                        isActive
                          ? 'shadow-md scale-100'
                          : 'scale-90 hover:scale-95 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? `${tab.color}15` : 'transparent',
                      }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? '' : 'text-gray-600 group-hover:text-gray-900'
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
        <div className="border-t border-gray-200 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="w-full h-12 flex items-center justify-center group">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <Info className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
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
