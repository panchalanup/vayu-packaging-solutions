/**
 * Graphics Uploader Component
 * Upload and manage images for box faces
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaceImage, BoxFace } from '@/types/boxDesigner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface GraphicsUploaderProps {
  selectedFace: BoxFace | null;
  faceImages: FaceImage[];
  onImageUpload: (face: BoxFace, imageUrl: string, file: File) => void;
  onImageRemove: (face: BoxFace) => void;
}

export default function GraphicsUploader({
  selectedFace,
  faceImages,
  onImageUpload,
  onImageRemove,
}: GraphicsUploaderProps) {
  const currentFaceImage = selectedFace 
    ? faceImages.find(img => img.face === selectedFace)
    : null;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!selectedFace) {
      toast.error('Please select a box face first');
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create image URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageUpload(selectedFace, imageUrl, file);
      toast.success(`Image uploaded to ${selectedFace} face`);
    };
    reader.readAsDataURL(file);
  }, [selectedFace, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    disabled: !selectedFace,
  });

  const handleRemove = () => {
    if (selectedFace) {
      onImageRemove(selectedFace);
      toast.success(`Image removed from ${selectedFace} face`);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-sm">Graphics Upload</h4>
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
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-primary bg-primary/5 scale-105'
                : currentFaceImage
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            
            {currentFaceImage ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={currentFaceImage.imageUrl}
                    alt="Uploaded"
                    className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Image Uploaded</p>
                  <p className="text-xs text-green-600 mt-1">
                    Click or drop to replace
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? 'Drop image here' : 'Upload Image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag & drop or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Supported: PNG, JPG, SVG</p>
            <p>• Maximum size: 10MB</p>
            <p>• Recommended: High resolution images</p>
          </div>

          {/* Remove Button */}
          {currentFaceImage && (
            <Button
              onClick={handleRemove}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
