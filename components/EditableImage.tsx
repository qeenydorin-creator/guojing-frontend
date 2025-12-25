import React, { useState, useRef } from 'react';
import { Edit, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { uploadImage, updateSiteImage } from '../services/api';

interface EditableImageProps {
  imageKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  currentUser: UserProfile | null;
  currentUrl?: string; // Passed from parent state
  onUpdate: (key: string, newUrl: string) => void;
  editMode?: boolean;
  stopPropagation?: boolean;
}

const EditableImage: React.FC<EditableImageProps> = ({ 
  imageKey, defaultSrc, alt, className, currentUser, currentUrl, onUpdate, editMode = false, stopPropagation = true
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'admin';
  const displaySrc = currentUrl || defaultSrc;
  const placeholderSrc = currentUrl || defaultSrc || "https://placehold.co/800x600?text=Image+Not+Found";
  const effectiveSrc = displaySrc && displaySrc.trim().length > 0 ? displaySrc : placeholderSrc;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to backend
      const newUrl = await uploadImage(file);
      // 2. Update config in backend
      await updateSiteImage(imageKey, newUrl);
      // 3. Update frontend state
      onUpdate(imageKey, newUrl);
    } catch (err) {
      alert("上传失败，请检查后台是否运行 (backend/main.py)");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="relative group w-full h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img 
        src={effectiveSrc} 
        alt={alt} 
        className={className || "w-full h-full object-contain"}
        onError={(e) => {
            if (e.currentTarget.src !== placeholderSrc) {
              e.currentTarget.src = placeholderSrc;
            }
        }}
      />
      
      {isAdmin && (editMode || isHovering || isUploading) && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-all animate-fade-in z-20">
          <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="animate-spin text-gj-gold" size={24} />
                <span className="text-xs font-bold text-gray-600">上传中...</span>
              </>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={(e) => {
                    if (stopPropagation) e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2 bg-gj-gold text-gj-dark px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors"
                >
                  <Upload size={16} /> 更换图片
                </button>
                <div className="text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded">
                  Key: {imageKey}
                </div>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableImage;
