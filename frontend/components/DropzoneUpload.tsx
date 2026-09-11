'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon, Music, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface AttachmentFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  progress?: number;
  error?: string;
}

interface DropzoneUploadProps {
  onFilesSelected?: (files: File[]) => void;
  existingAttachments?: AttachmentFile[];
  onRemoveAttachment?: (index: number) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
}

export const DropzoneUpload: React.FC<DropzoneUploadProps> = ({
  onFilesSelected,
  existingAttachments = [],
  onRemoveAttachment,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
}) => {
  const [selectedFiles, setSelectedFiles] = useState<AttachmentFile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrorMsg(null);

      if (rejectedFiles.length > 0) {
        const firstErr = rejectedFiles[0].errors[0];
        if (firstErr.code === 'file-too-large') {
          setErrorMsg('File size exceeds the 10MB limit.');
        } else if (firstErr.code === 'file-invalid-type') {
          setErrorMsg('Invalid file type. Only Images, PDFs, and Audio files are allowed.');
        } else if (firstErr.code === 'too-many-files') {
          setErrorMsg(`Maximum ${maxFiles} files allowed per report.`);
        } else {
          setErrorMsg(firstErr.message);
        }
        return;
      }

      if (selectedFiles.length + acceptedFiles.length + existingAttachments.length > maxFiles) {
        setErrorMsg(`Maximum ${maxFiles} evidence attachments allowed per report.`);
        return;
      }

      const newFiles: AttachmentFile[] = acceptedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        progress: 100,
      }));

      const updated = [...selectedFiles, ...newFiles];
      setSelectedFiles(updated);

      if (onFilesSelected) {
        onFilesSelected(updated.map((f) => f.file!).filter(Boolean));
      }
    },
    [selectedFiles, existingAttachments, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSizeBytes,
    maxFiles: maxFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
    },
  });

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    if (onFilesSelected) {
      onFilesSelected(updated.map((f) => f.file!).filter(Boolean));
    }
  };

  const renderFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4 text-rose-600" />;
    }
    if (mimeType.startsWith('audio/')) {
      return <Music className="w-4 h-4 text-teal-600" />;
    }
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={`p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragActive
            ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-1.5">
          <div className="p-2.5 bg-white rounded-full border border-slate-200 shadow-2xs text-teal-700">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">
              {isDragActive ? 'Drop evidence files here...' : 'Click to upload or drag & drop evidence'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Images, PDFs, or Audio Voice Notes (Max 10MB per file, up to 5 files)
            </span>
          </div>
        </div>
      </div>

      {/* Inline Validation Error */}
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center space-x-1.5 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Files List Preview */}
      {(selectedFiles.length > 0 || existingAttachments.length > 0) && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Attached Evidence ({selectedFiles.length + existingAttachments.length})
          </span>

          {/* Existing persisted attachments */}
          {existingAttachments.map((att, idx) => (
            <div
              key={att.id || idx}
              className="p-2.5 bg-white rounded border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2.5 truncate max-w-sm">
                {renderFileIcon(att.type)}
                <div>
                  {att.url ? (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-teal-800 hover:underline truncate block"
                    >
                      {att.name}
                    </a>
                  ) : (
                    <span className="font-semibold text-slate-900 truncate block">{att.name}</span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">{formatFileSize(att.size)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Persisted</span>
                </span>
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Selected local files to upload */}
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white rounded border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2.5 truncate max-w-sm">
                {renderFileIcon(file.type)}
                <div>
                  <span className="font-semibold text-slate-900 truncate block">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatFileSize(file.size)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
