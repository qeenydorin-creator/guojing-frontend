import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, CheckCircle, CreditCard, ChevronRight, Loader2, ShoppingBag, Gift } from 'lucide-react';
import { Address, Region, CartItem, UserProfile } from '../types';
import EditableImage from './EditableImage';
import OrderCountdown from './OrderCountdown';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  onSubmit: (address: Address, pointsUsed: number) => void;
  currentUser?: UserProfile | null;
  editMode?: boolean;
  onUpdateImage?: (key: string, newUrl: string) => void;
  orderPaymentStatus?: string;
  orderCreatedAt?: string;
  paymentQrUrl?: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAmount,
  onSubmit,
  currentUser,
  editMode = false,
  onUpdateImage,
  orderPaymentStatus,
  orderCreatedAt,
  paymentQrUrl,
}) => {
  // --- Data Source State ---
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(false);

  // --- Form State ---
  const [formData, setFormData] = useState<Address>({
    name: '',
    phone: '',
    province: '',
    provinceCode: '',
    city: '',
    cityCode: '',
    district: '',
    districtCode: '',
    detail: ''
  });

  // --- Derived Selection Lists ---
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [submitError, setSubmitError] = useState('');

  // Points Logic
  const [usePoints, setUsePoints] = useState(false);
  const userPoints = currentUser?.points_balance || 0;
  // 1 Point = 1 CNY
  const maxDeductible = Math.min(totalAmount, userPoints);
  const rawFinalTotal = usePoints ? totalAmount - maxDeductible : totalAmount;
  const finalTotal = Math.max(0, rawFinalTotal);
  const isFullyDeducted = finalTotal <= 0;

  // --- Initialization: Fetch Data ---
  useEffect(() => {
    if (isOpen && regions.length === 0) {
      setIsLoadingData(true);
      // Using a stable CDN for China administrative divisions (Province/City/District/Street - we use up to District)
      // Source: https://github.com/modood/Administrative-divisions-of-China
      fetch('https://unpkg.com/china-division/dist/pcas-code.json')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data: Region[]) => {
          setRegions(data);
          setIsLoadingData(false);
        })
        .catch(err => {
          console.error("Failed to load region data:", err);
          setDataError(true);
          setIsLoadingData(false);
        });
    }
  }, [isOpen, regions.length]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Cascading Logic ---

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const region = regions.find(r => r.code === code);
    
    setFormData(prev => ({
      ...prev,
      province: region?.name || '',
      provinceCode: code,
      city: '',
      cityCode: '',
      district: '',
      districtCode: '' // Reset all children
    }));
    
    setCities(region?.children || []);
    setDistricts([]); 
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const region = cities.find(r => r.code === code);

    setFormData(prev => ({
      ...prev,
      city: region?.name || '',
      cityCode: code,
      district: '',
      districtCode: '' // Reset child
    }));

    setDistricts(region?.children || []);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const region = districts.find(r => r.code === code);

    setFormData(prev => ({
      ...prev,
      district: region?.name || '',
      districtCode: code
    }));
  };

  const handleSubmit = () => {
    // 1. Basic Validations
    if (!formData.name.trim() || !formData.phone.trim() || !formData.detail.trim()) {
      setSubmitError('请填写完整的收货人信息、电话及详细地址。');
      return;
    }
    // 2. Strict Region Validation
    if (!formData.provinceCode || !formData.cityCode || !formData.districtCode) {
      setSubmitError('请选择完整的省/市/区行政区划。');
      return;
    }
    // 3. Phone Regex (China)
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        setSubmitError('请输入有效的11位手机号码。');
        return;
    }

    setSubmitError('');
    onSubmit(formData, usePoints ? maxDeductible : 0);
  };

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  // Custom Select Style Class
  const selectClass = (disabled: boolean) => `
    w-full appearance-none bg-white
    border ${disabled ? 'border-gray-100 bg-gray-50' : 'border-gray-200'}
    rounded-xl p-3.5 pr-10 text-sm font-medium
    outline-none transition-all duration-300
    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-[#2d462f] cursor-pointer focus:border-[#c6a87c] focus:ring-4 focus:ring-[#c6a87c]/10'}
  `;

  // Custom Input Style Class
  const inputClass = `
    w-full border border-gray-200 rounded-xl p-3.5 
    text-sm font-medium text-[#2d462f] placeholder-gray-400
    outline-none transition-all duration-300
    focus:border-[#c6a87c] focus:ring-4 focus:ring-[#c6a87c]/10 bg-white
  `;

  const isUnpaid = orderPaymentStatus === 'unpaid';
  const countdownCreatedAt = orderCreatedAt; // must come from DB created_at

  return (
    <div className="fixed inset-0 bg-[#2d462f]/40 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20" onClick={e => e.stopPropagation()}>
        
        {/* Header: Luxury Brand Style */}
        <div className="bg-[#2d462f] px-8 py-6 flex justify-between items-center text-white flex-shrink-0 relative overflow-hidden">
           {/* Decorative Background Pattern */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
           
           <div className="relative z-10 flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <CreditCard className="text-[#c6a87c]" size={24} />
             </div>
             <div>
               <h2 className="font-serif text-xl font-bold tracking-wide">确认订单</h2>
               <p className="text-[10px] text-white/60 uppercase tracking-widest">Secure Checkout</p>
             </div>
           </div>
           <button type="button" onClick={onClose} className="relative z-10 hover:text-[#c6a87c] transition-colors p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50">
           
           {/* Section 1: Product Cards (Luxury Style) */}
           <div className="px-8 py-6 bg-white border-b border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShoppingBag size={14} /> 待支付商品 ({items.length})
             </h3>
             <div className="space-y-3">
               {items.map(item => (
                <div key={item.id} className="flex gap-4 p-3 bg-[#f9f8f6] rounded-xl border border-[#e5e0d8] group transition-colors hover:border-[#c6a87c]/30">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-black/5">
                    {currentUser && onUpdateImage ? (
                      <EditableImage
                        imageKey={`product_${item.id}_image`}
                        defaultSrc={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        currentUser={currentUser}
                        currentUrl={item.imageUrl}
                        onUpdate={onUpdateImage}
                        editMode={editMode}
                      />
                    ) : (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-serif font-bold text-[#2d462f] line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-[#c6a87c] mt-0.5">{item.brand}</p>
                  </div>
                   <div className="text-right flex flex-col justify-center">
                     <span className="font-serif font-bold text-[#2d462f]">{formatPrice(item.price)}</span>
                     <span className="text-xs text-gray-400">x {item.quantity}</span>
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-sm text-gray-500 font-medium">订单总额</span>
                <span className="font-serif text-2xl font-bold text-[#8C3224]">{formatPrice(totalAmount)}</span>
             </div>
             {/* Countdown for unpaid orders */}
             {isUnpaid && !isFullyDeducted && countdownCreatedAt && (
               <div className="mt-2">
                 <OrderCountdown createdAt={countdownCreatedAt} />
               </div>
             )}

            {/* Points Deduction */}
            {currentUser && userPoints > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-50 bg-[#f9f8f6] -mx-8 px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#c6a87c]/10 rounded-full text-[#c6a87c]">
                      <Gift size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2d462f]">积分抵扣</p>
                      <p className="text-xs text-gray-500">可用 {userPoints} 积分，抵扣 ¥{maxDeductible}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={usePoints}
                      onChange={e => setUsePoints(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#c6a87c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c6a87c]"></div>
                  </label>
                </div>
                
                {usePoints && (
                   <div className="mt-3 flex justify-between items-center text-sm">
                     <span className="text-[#c6a87c]">已抵扣</span>
                     <span className="font-bold text-[#c6a87c]">- {formatPrice(maxDeductible)}</span>
                   </div>
                )}
              </div>
            )}

            {usePoints && (
              <div className="mt-0 px-8 py-3 bg-[#2d462f]/5 flex justify-between items-center">
                 <span className="text-sm font-bold text-[#2d462f]">实付金额</span>
                 <span className="font-serif text-xl font-bold text-[#2d462f]">{formatPrice(finalTotal)}</span>
              </div>
            )}
           </div>

           {/* Section 2: Address Form */}
           <div className="p-8">
              <h3 className="font-bold text-[#2d462f] mb-6 flex items-center gap-2">
                 <div className="w-1 h-5 bg-[#c6a87c] rounded-full"></div>
                 收货信息填写
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">收货人姓名</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className={inputClass}
                      placeholder="请输入真实姓名"
                      maxLength={20}
                    />
                 </div>
                 <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">联系电话</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="11位手机号码"
                      maxLength={11}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 min-w-[7rem]">
                    {!isFullyDeducted && (
                      <img
                        src={paymentQrUrl || 'https://placehold.co/150x150?text=WeChat+QR'}
                        alt="客服微信二维码"
                        className="w-28 h-28 rounded-lg border border-gray-200 object-cover"
                      />
                    )}
                    <span className="text-xs text-gray-600 text-center">
                      {isFullyDeducted ? '✨ 积分全额抵扣，支付成功！' : '扫码联系客服付款'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Region Selector */}
              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 flex justify-between">
                    <span>所在地区</span>
                    {isLoadingData && <span className="text-[#c6a87c] flex items-center gap-1"><Loader2 size={10} className="animate-spin"/> 加载数据中...</span>}
                    {dataError && <span className="text-red-500">数据加载失败，请刷新</span>}
                 </label>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Province */}
                    <div className="relative group">
                      <select 
                        value={formData.provinceCode} 
                        onChange={handleProvinceChange}
                        disabled={isLoadingData}
                        className={selectClass(isLoadingData)}
                      >
                        <option value="">{isLoadingData ? '加载中...' : '选择省份'}</option>
                        {regions.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400 group-hover:text-[#c6a87c] transition-colors">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>

                    {/* City */}
                    <div className="relative group">
                      <select 
                        value={formData.cityCode} 
                        onChange={handleCityChange}
                        disabled={!formData.provinceCode}
                        className={selectClass(!formData.provinceCode)}
                      >
                        <option value="">选择城市</option>
                        {cities.map(c => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400 group-hover:text-[#c6a87c] transition-colors">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>

                    {/* District */}
                    <div className="relative group">
                      <select 
                        value={formData.districtCode} 
                        onChange={handleDistrictChange}
                        disabled={!formData.cityCode}
                        className={selectClass(!formData.cityCode)}
                      >
                        <option value="">选择区/县</option>
                        {districts.map(d => (
                           <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400 group-hover:text-[#c6a87c] transition-colors">
                        <ChevronRight size={16} className="rotate-90" />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Detailed Address */}
              <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">详细地址</label>
                  <textarea 
                    value={formData.detail}
                    onChange={e => setFormData({...formData, detail: e.target.value})}
                    className={`${inputClass} h-24 resize-none leading-relaxed`}
                    placeholder="街道、楼牌号、小区名称等..."
                    maxLength={100}
                  />
              </div>

              {/* Error Display */}
              {submitError && (
               <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                  <X size={16} /> {submitError}
               </div>
              )}
           </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
           <button 
             type="button"
             onClick={onClose} 
             className="flex-1 py-4 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
           >
             取消
           </button>
           <button 
             type="button"
             onClick={handleSubmit}
             disabled={isLoadingData}
             className="flex-[2] py-4 bg-[#2d462f] text-white rounded-xl font-bold hover:bg-[#243825] transition-all shadow-lg shadow-[#2d462f]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
           >
             <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> 
             {isLoadingData ? '数据加载中...' : isFullyDeducted ? '确认兑换' : '提交订单'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;