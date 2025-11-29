import React, { useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or TXT file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large. Max 10MB.');
        return;
    }

    onFileUpload(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
            : 'border-slate-300 hover:border-indigo-400 bg-white'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            ) : (
              <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {isLoading ? 'Analyzing Resume...' : 'Upload Candidate Resume'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Drag and drop your PDF or TXT file here, or click to browse.
            </p>
          </div>

          <label className="relative">
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileSelect}
              accept=".pdf,.txt"
              disabled={isLoading}
            />
            <span className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm cursor-pointer transition-colors">
              Browse Files
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-center text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}
      
      <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center">
          <FileText className="w-3 h-3 mr-1.5" />
          PDF Supported
        </div>
        <div className="flex items-center">
          <FileText className="w-3 h-3 mr-1.5" />
          TXT Supported
        </div>
        <div className="flex items-center">
            <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
