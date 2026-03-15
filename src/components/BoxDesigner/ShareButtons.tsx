/**
 * Share Buttons Component
 * WhatsApp, Email, and Image Download sharing options
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Mail, Download, Loader2 } from 'lucide-react';
import { BoxDimensions, PlyType, BoxTemplate, FaceImage, TextElement } from '@/types/boxDesigner';
import { shareViaWhatsApp, shareViaEmail, getDesignFilename } from '@/lib/boxDesigner/shareUtils';
import { downloadCanvasImage } from '@/lib/boxDesigner/canvasCapture';
import { toast } from 'sonner';

interface ShareButtonsProps {
  dimensions: BoxDimensions;
  ply: PlyType;
  template: BoxTemplate;
  faceImages: FaceImage[];
  textElements: TextElement[];
  onCaptureScreenshot: () => void;
}

export default function ShareButtons({
  dimensions,
  ply,
  template,
  faceImages,
  textElements,
  onCaptureScreenshot,
}: ShareButtonsProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const messageOptions = {
    dimensions,
    ply,
    template,
    faceImages,
    textElements,
  };

  const handleWhatsAppShare = () => {
    try {
      shareViaWhatsApp(messageOptions);
      toast.success('Opening WhatsApp...', {
        description: 'Download the 3D image separately to share with your message',
      });
    } catch (error) {
      toast.error('Failed to open WhatsApp');
      console.error(error);
    }
  };

  const handleEmailShare = () => {
    try {
      shareViaEmail(messageOptions);
      toast.success('Opening email client...', {
        description: 'Download the 3D image to attach to your email',
      });
    } catch (error) {
      toast.error('Failed to open email client');
      console.error(error);
    }
  };

  const handleDownloadImage = async () => {
    setIsCapturing(true);
    try {
      // Trigger screenshot capture
      onCaptureScreenshot();
      toast.success('Image downloaded!', {
        description: 'Your 3D box design has been saved',
      });
    } catch (error) {
      toast.error('Failed to capture image');
      console.error(error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* WhatsApp Share */}
      <Button
        onClick={handleWhatsAppShare}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        size="default"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share via WhatsApp
      </Button>

      {/* Email Share */}
      <Button
        onClick={handleEmailShare}
        variant="outline"
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
        size="default"
      >
        <Mail className="w-4 h-4 mr-2" />
        Share via Email
      </Button>

      {/* Download Image */}
      <Button
        onClick={handleDownloadImage}
        variant="outline"
        className="w-full"
        size="default"
        disabled={isCapturing}
      >
        {isCapturing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Download 3D Image
      </Button>

      <p className="text-xs text-gray-500 text-center mt-2">
        💡 Download the 3D image first, then share it with your WhatsApp/Email message
      </p>
    </div>
  );
}
