/**
 * Designer Side Panel Component
 * Switchable content panel based on active tab
 */

import { motion, AnimatePresence } from 'framer-motion';
import { DesignerTab } from './IconSidebar';
import QuickSizePresets from './QuickSizePresets';
import ColorFinishSelector from './ColorFinishSelector';
import GraphicsUploader from './GraphicsUploader';
import TextEditor from './TextEditor';
import ShareButtons from './ShareButtons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, RotateCcw } from 'lucide-react';
import { BoxDimensions, BoxTemplate, PlyType, FaceImage, TextElement, BoxFace, BoxColor } from '@/types/boxDesigner';

interface DesignerSidePanelProps {
  activeTab: DesignerTab;
  // Edit tab props
  template: BoxTemplate;
  dimensions: BoxDimensions;
  boxColor: BoxColor;
  onDimensionsChange: (dimensions: BoxDimensions) => void;
  onBoxColorChange: (color: BoxColor) => void;
  onFoldReset: () => void;
  // Customize tab props
  selectedFace: BoxFace | null;
  faceImages: FaceImage[];
  textElements: TextElement[];
  onImageUpload: (face: BoxFace, imageUrl: string, file: File) => void;
  onImageRemove: (face: BoxFace) => void;
  onTextAdd: (element: Omit<TextElement, 'id'>) => void;
  onTextRemove: (id: string) => void;
  // Export tab props
  ply: PlyType;
  onGetQuote: () => void;
  onExport: () => void;
  onReset: () => void;
  onCaptureScreenshot: () => void;
}

const panelVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export default function DesignerSidePanel({
  activeTab,
  template,
  dimensions,
  boxColor,
  onDimensionsChange,
  onBoxColorChange,
  onFoldReset,
  selectedFace,
  faceImages,
  textElements,
  onImageUpload,
  onImageRemove,
  onTextAdd,
  onTextRemove,
  ply,
  onGetQuote,
  onExport,
  onReset,
  onCaptureScreenshot,
}: DesignerSidePanelProps) {
  return (
    <div className="h-full bg-gray-50 border-r border-gray-200 overflow-y-auto overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="p-6 space-y-6"
        >
          {/* Edit Tab - New Features */}
          {activeTab === 'edit' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Edit Box</h2>
                <p className="text-sm text-gray-600">Configure box properties</p>
              </div>

              <Card className="p-5">
                <QuickSizePresets
                  currentDimensions={dimensions}
                  onChange={onDimensionsChange}
                  onFoldReset={onFoldReset}
                />
              </Card>

              <Card className="p-5">
                <ColorFinishSelector
                  selectedColor={boxColor}
                  onChange={onBoxColorChange}
                />
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Use the floating controls below the box to fine-tune dimensions and flaps.
                </p>
              </Card>
            </>
          )}

          {/* Customize Tab - Graphics & Text */}
          {activeTab === 'customize' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Customize</h2>
                <p className="text-sm text-gray-600">Add graphics and text to box faces</p>
              </div>

              <Card className="p-4 bg-amber-50 border-amber-200">
                <p className="text-xs text-amber-800">
                  <strong>How to customize:</strong>
                  <br />
                  1. Click on a box face in 3D view
                  <br />
                  2. Upload images or add text below
                  <br />
                  3. Selected face glows green
                </p>
              </Card>

              {selectedFace && (
                <Card className="p-3 bg-green-50 border-2 border-green-300">
                  <div className="text-center">
                    <div className="text-xs text-green-700 font-medium">Selected Face</div>
                    <div className="font-bold text-green-900 capitalize text-lg">{selectedFace}</div>
                  </div>
                </Card>
              )}

              <GraphicsUploader
                selectedFace={selectedFace}
                faceImages={faceImages}
                onImageUpload={onImageUpload}
                onImageRemove={onImageRemove}
              />

              <TextEditor
                selectedFace={selectedFace}
                textElements={textElements}
                onTextAdd={onTextAdd}
                onTextRemove={onTextRemove}
              />
            </>
          )}

          {/* Export Tab - Actions */}
          {activeTab === 'export' && (
            <>
              <div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Actions</h2>
                <p className="text-sm text-gray-600">Export, quote, and manage your design</p>
              </div>

              <Card className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-3 text-gray-700">Share Design</h3>
                  <ShareButtons
                    dimensions={dimensions}
                    ply={ply}
                    template={template}
                    faceImages={faceImages}
                    textElements={textElements}
                    onCaptureScreenshot={onCaptureScreenshot}
                  />
                  <p className="text-xs text-gray-500 mt-3">
                    Share your design with suppliers or manufacturers
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm mb-3 text-gray-700">Get Pricing</h3>
                  <Button
                    onClick={onGetQuote}
                    className="w-full"
                    size="lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Get Quote
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    View pricing and order your custom box
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm mb-3 text-gray-700">Export Design</h3>
                  <Button
                    onClick={onExport}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Design (JSON)
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Save design for later or share with others
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-sm mb-3 text-gray-700">Reset</h3>
                  <Button
                    onClick={onReset}
                    variant="destructive"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Clear all customizations and start over
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">
                  📦 Current Design Summary
                </h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium">
                      {dimensions.length} × {dimensions.width} × {dimensions.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="font-medium capitalize">{template}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-medium">{faceImages.length} uploaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Text Elements:</span>
                    <span className="font-medium">{textElements.length} added</span>
                  </div>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
