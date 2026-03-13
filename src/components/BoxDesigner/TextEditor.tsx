/**
 * Text Editor Component
 * Add and customize text on box faces
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TextElement, BoxFace } from '@/types/boxDesigner';
import { Type, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TextEditorProps {
  selectedFace: BoxFace | null;
  textElements: TextElement[];
  onTextAdd: (element: Omit<TextElement, 'id'>) => void;
  onTextRemove: (id: string) => void;
}

const FONTS = [
  'Arial',
  'Helvetica',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Courier New',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Impact',
];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64, 80, 100];

export default function TextEditor({
  selectedFace,
  textElements,
  onTextAdd,
  onTextRemove,
}: TextEditorProps) {
  const [text, setText] = useState('');
  const [font, setFont] = useState('Arial');
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');

  const currentFaceTexts = textElements.filter(t => t.face === selectedFace);

  const handleAddText = () => {
    if (!selectedFace) {
      toast.error('Please select a box face first');
      return;
    }

    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const newText: Omit<TextElement, 'id'> = {
      face: selectedFace,
      text: text.trim(),
      font,
      size,
      color,
      position: { x: 0.5, y: 0.5 }, // Center of face
      rotation: 0,
      align,
    };

    onTextAdd(newText);
    setText('');
    toast.success(`Text added to ${selectedFace} face`);
  };

  const handleRemoveText = (id: string) => {
    onTextRemove(id);
    toast.success('Text removed');
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-sm">Text Editor</h4>
        </div>
        {selectedFace && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {selectedFace.toUpperCase()}
          </span>
        )}
      </div>

      {!selectedFace ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
          <p className="text-sm text-amber-800">
            👆 Click a box face to select it first
          </p>
        </div>
      ) : (
        <>
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="text-input" className="text-xs">Text Content</Label>
            <Input
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              maxLength={100}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">{text.length}/100 characters</p>
          </div>

          {/* Font Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Font</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map(f => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Size (pt)</Label>
              <Select value={size.toString()} onValueChange={(v) => setSize(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map(s => (
                    <SelectItem key={s} value={s.toString()}>
                      {s}pt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color & Alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="text-color" className="text-xs">Color</Label>
              <div className="flex gap-2">
                <input
                  id="text-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-9 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alignment</Label>
              <Select value={align} onValueChange={(v: any) => setAlign(v)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
            {text ? (
              <p
                style={{
                  fontFamily: font,
                  fontSize: `${Math.min(size, 32)}px`,
                  color: color,
                  textAlign: align,
                }}
                className="font-medium"
              >
                {text}
              </p>
            ) : (
              <p className="text-xs text-gray-400">Preview will appear here</p>
            )}
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddText}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Text
          </Button>

          {/* Current Texts */}
          {currentFaceTexts.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-semibold">Texts on this face:</Label>
              <div className="space-y-2">
                {currentFaceTexts.map(textEl => (
                  <div
                    key={textEl.id}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ fontFamily: textEl.font, color: textEl.color }}
                      >
                        {textEl.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {textEl.font} • {textEl.size}pt
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveText(textEl.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
