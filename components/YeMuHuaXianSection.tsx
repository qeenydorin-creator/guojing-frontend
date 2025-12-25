import React from 'react';
import EditableImage from './EditableImage';
import { ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface YeMuHuaXianSectionProps {
  currentUser: UserProfile | null;
  siteImages: Record<string, string>;
  onUpdateImage: (key: string, url: string) => void;
  editMode: boolean;
  onBookFactory?: () => void;
}

const YeMuHuaXianSection: React.FC<YeMuHuaXianSectionProps> = ({
  currentUser, siteImages, onUpdateImage, editMode, onBookFactory
}) => {
  return (
    <div className="py-20 bg-[#f8f5f2]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          
          <div className="flex-1 w-full relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <EditableImage
                imageKey="yemu_factory_intro"
                defaultSrc="https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&q=80&w=1200" 
                alt="Ye Mu Hua Xian Factory"
                className="w-full h-full object-cover"
                currentUser={currentUser}
                currentUrl={siteImages['yemu_factory_intro']}
                onUpdate={onUpdateImage}
                editMode={editMode}
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gj-gold/10 rounded-full -z-0"></div>
            <div className="absolute -top-6 -left-6 w-48 h-48 border-2 border-gj-gold/20 rounded-full -z-0"></div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <span className="text-gj-gold font-bold tracking-widest uppercase text-sm mb-2 block">Sub-Brand Integration</span>
              <h2 className="text-4xl font-serif font-bold text-gj-dark mb-4">叶木花仙 · 现代化工厂</h2>
              <div className="w-20 h-1 bg-gj-green"></div>
            </div>
            
            <p className="text-stone-600 leading-loose text-lg">
              作为国精集团旗下的年轻化品牌，“叶木花仙”专注于黄精深加工产品的研发与生产。
              我们拥有十万级GMP净化车间，采用低温冷萃与超微粉碎技术，
              最大程度保留黄精活性成分，让传统滋补更适应现代快节奏生活。
            </p>
            
            <ul className="space-y-4 text-stone-700">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-gj-gold rounded-full"></span>
                十万级GMP净化车间
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-gj-gold rounded-full"></span>
                独家低温冷萃技术
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-gj-gold rounded-full"></span>
                全自动化灌装生产线
              </li>
            </ul>

            <button type="button" className="px-8 py-3 bg-white border border-gj-dark text-gj-dark font-bold rounded-full hover:bg-gj-dark hover:text-white transition-all flex items-center gap-2">
              <span onClick={onBookFactory}>预约探厂</span> <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default YeMuHuaXianSection;
