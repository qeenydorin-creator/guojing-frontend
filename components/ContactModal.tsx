import React from 'react';
import { X } from 'lucide-react';
import EditableImage from './EditableImage';
import { UserProfile } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  siteImages: Record<string, string>;
  onUpdateImage: (key: string, url: string) => void;
  editMode: boolean;
}

const ContactModal: React.FC<ContactModalProps> = ({ 
  isOpen, onClose, currentUser, siteImages, onUpdateImage, editMode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors"
        >
          <X size={18} />
        </button>
        
        {/* FIX: Add proper aspect ratio container for QR code display */}
        <div className="aspect-[4/5] w-full relative bg-stone-100 flex items-center justify-center overflow-hidden">
           <EditableImage
             imageKey="contact_modal_image"
             defaultSrc="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
             alt="Contact Us"
             className="w-full h-full object-contain"
             currentUser={currentUser}
             currentUrl={siteImages['contact_modal_image']}
             onUpdate={onUpdateImage}
             editMode={editMode}
           />
           
           <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
              <h3 className="text-2xl font-serif font-bold mb-2">联系我们</h3>
              <p className="text-white/80 mb-4">扫码添加专属客服，或致电 400-888-9999</p>
              <div className="flex gap-4">
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-sm">
                    周一至周日 9:00 - 18:00
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
