/**
 * Box Template Selector
 * Choose from different box styles
 */

import { BoxTemplate } from '@/types/boxDesigner';
import { BOX_TEMPLATES } from '@/lib/boxDesigner/constants';
import { Box, PackageOpen, Scissors, Mail } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: BoxTemplate;
  onChange: (template: BoxTemplate) => void;
}

const iconMap = {
  Box,
  PackageOpen,
  Scissors,
  Mail,
};

export default function TemplateSelector({ selectedTemplate, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Box Style</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {BOX_TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const Icon = iconMap[template.icon as keyof typeof iconMap] || Box;
          
          return (
            <button
              key={template.id}
              onClick={() => onChange(template.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
                <div className="text-xs font-medium">{template.name}</div>
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {BOX_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
      </p>
    </div>
  );
}
