'use client';

import React, { useRef } from 'react';
import { Upload, Loader2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioDropzoneProps {
  dragActive: boolean;
  isUploading: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList | File[]) => void;
}

export default function PortfolioDropzone({
  dragActive,
  isUploading,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFilesSelected
}: PortfolioDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-8 sm:p-10 text-center relative cursor-pointer group ${
        dragActive
          ? 'border-[#9E5338] bg-[#F5ECE2]'
          : 'border-[#E8E2D9] bg-white hover:border-[#9E5338]/60 hover:bg-[#FAF7F2]'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />

      <div className="size-14 rounded-2xl bg-[#F5ECE2] border border-[#E8E2D9] flex items-center justify-center mx-auto mb-3 text-[#9E5338] group-hover:scale-105 transition-transform shadow-xs">
        {isUploading ? (
          <Loader2 className="size-6 animate-spin text-[#9E5338]" />
        ) : (
          <Upload className="size-6 text-[#9E5338]" />
        )}
      </div>

      <h3 className="text-base font-semibold text-[#221F1C] mb-1">
        {dragActive ? 'Drop your photos to begin showcase' : 'Drag & drop photos here, or click to upload'}
      </h3>

      <p className="text-xs text-[#6B6560] max-w-md mx-auto mb-4">
        Select multiple high-resolution photos (JPEG, PNG, WebP up to 10MB each). We automatically organize them into an editorial client showcase.
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-[#9E5338] hover:bg-[#86442B] text-white rounded-full text-xs font-semibold px-5 h-9 pointer-events-none"
        >
          <FolderPlus className="size-3.5 mr-1.5" />
          Browse Files from Device
        </Button>
      </div>
    </div>
  );
}
