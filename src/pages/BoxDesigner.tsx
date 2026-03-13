/**
 * 3D Box Designer Page
 * Interactive tool for designing custom packaging boxes
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import MetaTags from '@/components/SEO/MetaTags';
import Canvas3D from '@/components/BoxDesigner/Canvas3D';
import RealisticBox3D from '@/components/BoxDesigner/RealisticBox3D';
import TemplateSelector from '@/components/BoxDesigner/TemplateSelector';
import DimensionInputs from '@/components/BoxDesigner/DimensionInputs';
import PlySelector from '@/components/BoxDesigner/PlySelector';
import MaterialPreview from '@/components/BoxDesigner/MaterialPreview';
import GraphicsUploader from '@/components/BoxDesigner/GraphicsUploader';
import TextEditor from '@/components/BoxDesigner/TextEditor';
import { BoxDimensions, BoxTemplate, PlyType, FaceImage, TextElement, BoxFace } from '@/types/boxDesigner';
import { DEFAULT_DIMENSIONS, DEFAULT_PLY, DEFAULT_TEMPLATE, PLY_OPTIONS } from '@/lib/boxDesigner/constants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, RotateCcw, Sparkles, RotateCw, Hand, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type ControlMode = 'rotate' | 'pan';

export default function BoxDesigner() {
  const navigate = useNavigate();
  
  // Design state
  const [template, setTemplate] = useState<BoxTemplate>(DEFAULT_TEMPLATE);
  const [dimensions, setDimensions] = useState<BoxDimensions>(DEFAULT_DIMENSIONS);
  const [ply, setPly] = useState<PlyType>(DEFAULT_PLY);
  const [faceImages, setFaceImages] = useState<FaceImage[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedFace, setSelectedFace] = useState<BoxFace | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlMode, setControlMode] = useState<ControlMode>('rotate');

  const currentPlyConfig = PLY_OPTIONS.find(p => p.id === ply)!;

  // Image handlers
  const handleImageUpload = (face: BoxFace, imageUrl: string, file: File) => {
    const newImage: FaceImage = {
      face,
      imageUrl,
      imageFile: file,
      position: { x: 0.5, y: 0.5 },
      scale: 0.8,
      rotation: 0,
    };

    setFaceImages(prev => {
      const filtered = prev.filter(img => img.face !== face);
      return [...filtered, newImage];
    });
  };

  const handleImageRemove = (face: BoxFace) => {
    setFaceImages(prev => prev.filter(img => img.face !== face));
  };

  // Text handlers
  const handleTextAdd = (element: Omit<TextElement, 'id'>) => {
    const newText: TextElement = {
      ...element,
      id: `text-${Date.now()}-${Math.random()}`,
    };
    setTextElements(prev => [...prev, newText]);
  };

  const handleTextRemove = (id: string) => {
    setTextElements(prev => prev.filter(t => t.id !== id));
  };

  const handleReset = () => {
    setTemplate(DEFAULT_TEMPLATE);
    setDimensions(DEFAULT_DIMENSIONS);
    setPly(DEFAULT_PLY);
    setFaceImages([]);
    setSelectedFace(null);
    setAutoRotate(true);
    toast.success('Design reset to defaults');
  };

  const handleGetQuote = () => {
    toast.success('Redirecting to quote tool...');
    // Pass design specs to compare-quote page
    setTimeout(() => {
      navigate('/compare-quote');
    }, 500);
  };

  const handleExport = () => {
    // Simple export functionality - can be enhanced later
    const designData = {
      template,
      dimensions,
      ply,
      faceImages: faceImages.map(img => ({
        face: img.face,
        position: img.position,
        scale: img.scale,
        rotation: img.rotation,
      })),
    };
    
    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Design exported successfully!');
  };

  return (
    <Layout>
      <PageTransition>
        <MetaTags
          title="3D Box Designer - Design Custom Packaging | Vayu Packaging Solutions"
          description="Create and visualize custom corrugated boxes in 3D. Design your perfect packaging with our interactive tool."
          keywords={['3d box designer', 'custom packaging design', 'corrugated box design', 'packaging visualization', 'box customization tool', '3d visualization']}
          canonical="https://vayupackaging.vercel.app/box-designer"
        />

        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-12 md:py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <div className="inline-block mb-4">
                  <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    🎨 Interactive 3D Tool
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  3D Box Designer
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  Design your perfect packaging box with real-time 3D visualization. Customize dimensions, materials, and more.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Main Designer */}
          <section className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid lg:grid-cols-[350px,1fr] gap-6">
              {/* Left Sidebar - Controls */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <Card className="p-6 space-y-6">
                  <TemplateSelector
                    selectedTemplate={template}
                    onChange={setTemplate}
                  />
                  
                  <Separator />
                  
                  <DimensionInputs
                    dimensions={dimensions}
                    onChange={setDimensions}
                  />
                  
                  <Separator />
                  
                  <PlySelector
                    selectedPly={ply}
                    onChange={setPly}
                  />
                </Card>

                {/* Material Preview */}
                <MaterialPreview plyConfig={currentPlyConfig} />

                {/* Actions Card */}
                <Card className="p-6 space-y-3">
                  <h4 className="font-semibold text-sm mb-3">Actions</h4>
                  <div className="space-y-3">
                    <Button
                      onClick={handleGetQuote}
                      className="w-full"
                      size="lg"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Get Quote
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleExport}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Instructions */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900">
                    💡 How to use:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Switch between Rotate & Pan modes</li>
                    <li>• Scroll to zoom in/out</li>
                    <li>• View from any angle (360°)</li>
                    <li>• Adjust dimensions in real-time</li>
                  </ul>
                </Card>
              </motion.div>

              {/* Right Side - 3D Canvas */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">3D Preview</h3>
                      <p className="text-xs text-muted-foreground">
                        {controlMode === 'rotate' ? '🔄 Drag to rotate' : '✋ Drag to move position'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setAutoRotate(!autoRotate)}
                        variant="outline"
                        size="sm"
                      >
                        {autoRotate ? 'Stop' : 'Rotate'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Control Mode Buttons */}
                  <div className="mb-3 flex gap-2">
                    <Button
                      onClick={() => setControlMode('rotate')}
                      variant={controlMode === 'rotate' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate
                    </Button>
                    <Button
                      onClick={() => setControlMode('pan')}
                      variant={controlMode === 'pan' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      <Hand className="w-4 h-4 mr-2" />
                      Pan
                    </Button>
                    <Button
                      onClick={() => {
                        toast.info('View reset to default');
                        // Reset will be handled by forcing canvas remount if needed
                        window.location.reload();
                      }}
                      variant="outline"
                      size="sm"
                      title="Reset camera view"
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Canvas3D controlMode={controlMode}>
                    <RealisticBox3D
                      width={dimensions.width}
                      length={dimensions.length}
                      depth={dimensions.height}
                      autoRotate={autoRotate}
                    />
                  </Canvas3D>
                  
                  {/* Box Info */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Volume</div>
                      <div className="font-semibold">
                        {(dimensions.length * dimensions.width * dimensions.height / 1000).toFixed(2)}L
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Material</div>
                      <div className="font-semibold">{ply}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Style</div>
                      <div className="font-semibold text-xs">{template.toUpperCase()}</div>
                    </div>
                  </div>
                </Card>

                {/* Graphics & Text Customization */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <GraphicsUploader
                    selectedFace={selectedFace}
                    faceImages={faceImages}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />

                  <TextEditor
                    selectedFace={selectedFace}
                    textElements={textElements}
                    onTextAdd={handleTextAdd}
                    onTextRemove={handleTextRemove}
                  />
                </div>
              </motion.div>
            </div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-6 mt-12"
            >
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                <p className="text-sm text-muted-foreground">3D Visualization</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">4 Types</div>
                <p className="text-sm text-muted-foreground">Box Templates</p>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">3 Options</div>
                <p className="text-sm text-muted-foreground">Ply Strengths</p>
              </Card>
            </motion.div>
          </section>
        </div>
      </PageTransition>
    </Layout>
  );
}
