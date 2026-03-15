/**
 * 3D Box Designer Page - macOS Style
 * Viewport-first layout with translucent panels
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import MetaTags from '@/components/SEO/MetaTags';
import Canvas3D from '@/components/BoxDesigner/Canvas3D';
import RealisticBox3D from '@/components/BoxDesigner/RealisticBox3D';
import IconSidebar, { DesignerTab } from '@/components/BoxDesigner/IconSidebar';
import DesignerSidePanel from '@/components/BoxDesigner/DesignerSidePanel';
import MacTopbar from '@/components/BoxDesigner/MacTopbar';
import BottomStatusBar from '@/components/BoxDesigner/BottomStatusBar';
import FloatingCanvasToolbar from '@/components/BoxDesigner/FloatingCanvasToolbar';
import BottomFloatingControls from '@/components/BoxDesigner/BottomFloatingControls';
import MobileInfoBanner from '@/components/BoxDesigner/MobileInfoBanner';
import { BoxDimensions, BoxTemplate, PlyType, FaceImage, TextElement, BoxFace, BoxColor } from '@/types/boxDesigner';
import { DEFAULT_DIMENSIONS, DEFAULT_PLY, DEFAULT_TEMPLATE, PLY_OPTIONS, DEFAULT_BOX_COLOR, BOX_COLOR_OPTIONS } from '@/lib/boxDesigner/constants';
import { calculateFoldState } from '@/lib/boxDesigner/foldAnimation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

type ControlMode = 'rotate' | 'pan';

export default function BoxDesigner() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // UI state
  const [activeTab, setActiveTab] = useState<DesignerTab>('edit');
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  
  // Design state
  const [template, setTemplate] = useState<BoxTemplate>(DEFAULT_TEMPLATE);
  const [dimensions, setDimensions] = useState<BoxDimensions>(DEFAULT_DIMENSIONS);
  const [ply, setPly] = useState<PlyType>(DEFAULT_PLY);
  const [boxColor, setBoxColor] = useState<BoxColor>(DEFAULT_BOX_COLOR);
  const [faceImages, setFaceImages] = useState<FaceImage[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedFace, setSelectedFace] = useState<BoxFace | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlMode, setControlMode] = useState<ControlMode>('rotate');
  
  // Fold animation state
  const [foldPercentage, setFoldPercentage] = useState(100);
  const [animatedFoldPercentage, setAnimatedFoldPercentage] = useState(100);

  // Get current color from box color selection
  const currentBoxColor = BOX_COLOR_OPTIONS.find(c => c.id === boxColor)?.color || DEFAULT_BOX_COLOR;
  
  // Apply color to ply config
  const currentPlyConfig = {
    ...PLY_OPTIONS.find(p => p.id === ply)!,
    color: currentBoxColor,
  };

  // Smooth GSAP animation for fold percentage changes
  useEffect(() => {
    const animation = gsap.to({ value: animatedFoldPercentage }, {
      value: foldPercentage,
      duration: 1.0,
      ease: 'power3.out',
      onUpdate: function() {
        setAnimatedFoldPercentage(this.targets()[0].value);
      }
    });

    return () => {
      animation.kill();
    };
  }, [foldPercentage]);

  // Calculate animation state from fold percentage
  const animationState = useMemo(() => 
    calculateFoldState(animatedFoldPercentage),
    [animatedFoldPercentage]
  );

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
    setBoxColor(DEFAULT_BOX_COLOR);
    setFaceImages([]);
    setTextElements([]);
    setSelectedFace(null);
    setAutoRotate(true);
    setFoldPercentage(100);
    toast.success('Design reset to defaults');
  };

  const handleGetQuote = () => {
    toast.success('Redirecting to quote tool...');
    setTimeout(() => {
      navigate('/compare-quote');
    }, 500);
  };

  const handleExport = () => {
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

        {/* Hero Section - Scrolls away */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-white py-16 border-b border-gray-200">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-2xl">🎨</span>
              Interactive 3D Designer
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Design Your Perfect Box
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create custom packaging with our professional 3D designer. Visualize dimensions, materials, and customize every detail in real-time.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <span>Real-time 3D</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">✓</span>
                </div>
                <span>Custom Graphics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">✓</span>
                </div>
                <span>Instant Export</span>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Layout - Responsive (mobile vs desktop) */}
        <div 
          className="sticky top-0 w-full grid"
          style={{
            height: '100vh',
            maxHeight: '100vh',
            // Mobile: auto (banner if shown) + 1fr (canvas)
            // Desktop: 56px (topbar) + 1fr (canvas) + 44px (status bar)
            gridTemplateColumns: isMobile 
              ? '1fr'
              : isLeftPanelCollapsed 
                ? '72px minmax(0, 1fr)' 
                : '72px 320px minmax(0, 1fr)',
            gridTemplateRows: isMobile
              ? 'auto minmax(0, 1fr)'
              : '56px minmax(0, 1fr) 44px',
            background: 'var(--mac-bg)',
            transition: 'grid-template-columns 180ms cubic-bezier(0.2, 0.9, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Mobile Info Banner - Always visible on mobile */}
          {isMobile && (
            <div className="col-span-full">
              <MobileInfoBanner />
            </div>
          )}

          {/* Topbar - Desktop only */}
          {!isMobile && (
            <div className="col-span-full">
              <MacTopbar onExport={handleExport} />
            </div>
          )}

          {/* Icon Sidebar - Desktop only */}
          {!isMobile && (
            <div className="row-start-2">
              <IconSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}

          {/* Left Panel - Desktop only, 320px collapsible */}
          {!isMobile && !isLeftPanelCollapsed && (
            <div className="row-start-2 relative">

              <DesignerSidePanel
                activeTab={activeTab}
                template={template}
                dimensions={dimensions}
                boxColor={boxColor}
                onDimensionsChange={setDimensions}
                onBoxColorChange={setBoxColor}
                onFoldReset={() => setFoldPercentage(100)}
                selectedFace={selectedFace}
                faceImages={faceImages}
                textElements={textElements}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
                onTextAdd={handleTextAdd}
                onTextRemove={handleTextRemove}
                ply={ply}
                onGetQuote={handleGetQuote}
                onExport={handleExport}
                onReset={handleReset}
              />
              
              {/* Collapse Button */}
              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                className="absolute top-4 -right-3 w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center z-10 mac-transition"
                title="Collapse panel"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Expand button when collapsed - Desktop only */}
          {!isMobile && isLeftPanelCollapsed && (
            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="absolute left-[72px] top-[72px] w-6 h-12 bg-white border border-gray-200 rounded-r-lg shadow-sm hover:bg-gray-50 flex items-center justify-center z-10 mac-transition"
              title="Expand panel"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          )}

          {/* Canvas Area - Full width on mobile, flex 1 on desktop */}
          <div 
            className={isMobile ? 'relative min-w-0' : 'row-start-2 relative p-4 min-w-0'}
            style={isMobile ? { gridRow: '2 / -1' } : undefined}
          >
            <div className={`w-full h-full relative ${isMobile ? '' : 'rounded-2xl'} overflow-hidden shadow-xl`}>

              {/* Floating Toolbar - Top Right */}
              <div className="absolute top-4 right-4 z-20">
                <FloatingCanvasToolbar
                  controlMode={controlMode}
                  autoRotate={autoRotate}
                  onControlModeChange={setControlMode}
                  onAutoRotateToggle={() => setAutoRotate(!autoRotate)}
                  onFitView={() => toast.info('Fit to view')}
                />
              </div>

              {/* Selected Face Indicator */}
              {selectedFace && (
                <div className="absolute top-4 left-4 z-20">
                  <div 
                    className="px-3 py-2 flex items-center gap-2"
                    style={{
                      backdropFilter: 'blur(var(--mac-glass-blur))',
                      background: 'rgba(34, 197, 94, 0.9)',
                      borderRadius: 'var(--mac-radius-md)',
                      boxShadow: 'var(--mac-shadow-soft)',
                    }}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-white capitalize">
                      Selected: {selectedFace}
                    </span>
                  </div>
                </div>
              )}

              {/* 3D Canvas */}
              <Canvas3D controlMode={controlMode}>
                <RealisticBox3D
                  width={dimensions.width}
                  length={dimensions.length}
                  depth={dimensions.height}
                  autoRotate={autoRotate}
                  animationState={animationState}
                  showIcons={true}
                  plyColor={currentPlyConfig.color}
                  faceImages={faceImages}
                  textElements={textElements}
                  selectedFace={selectedFace}
                  onFaceSelect={setSelectedFace}
                />
              </Canvas3D>

              {/* Bottom Floating Controls - Dock Style */}
              <BottomFloatingControls
                dimensions={dimensions}
                foldPercentage={foldPercentage}
                onDimensionsChange={setDimensions}
                onFoldChange={setFoldPercentage}
              />
            </div>
          </div>

          {/* Bottom Status Bar - Desktop only */}
          {!isMobile && (
            <div className="col-span-full">
              <BottomStatusBar
                dimensions={dimensions}
                ply={ply}
                template={template}
              />
            </div>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
}
