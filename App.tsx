
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, User, Menu, X, Search, Leaf, MessageSquare, Home, ShoppingBag, Trash2, Plus, Minus, Heart, Phone, Mail, ArrowRight, ChevronLeft, Star, Award, Shield, Share2, Eye, CornerDownRight, Send, LogOut, Factory, CheckCheck, Sun, ClipboardList, Clock, Truck, CheckCircle, MapPin, ThumbsUp } from 'lucide-react';
import { Page, CartItem, Product, PointsProduct, UserProfile, Order, OrderStatus, Address } from './types';
import { MOCK_PRODUCTS, MOCK_POINTS_PRODUCTS, MOCK_ORDERS } from './constants';
import AuthPage from './components/AuthPage';
import CheckoutModal from './components/CheckoutModal';
import EditableImage from './components/EditableImage';
import ContactModal from './components/ContactModal';
import YeMuHuaXianSection from './components/YeMuHuaXianSection';
import LazyImage from './components/LazyImage';
import { pointsUse, pointsEarn, pointsLedger as apiPointsLedger, fetchPageContent, fetchTraceabilityVideos, TraceabilityVideo } from './services/api';
import { getMe, logout as supaLogout } from './services/auth';
import { supabase } from './services/supabaseClient';

const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
const formatBJTime = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return 'N/A';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date).replace(/\//g, '-');
};

// Site-wide placeholder images (Unsplash) matching Oriental herbal/tea theme
const PLACEHOLDER_SITE_IMAGES: Record<string, string> = {
  home_hero_bg: 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg', // Supabase hero image
  home_brand_story: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', // serene mountain
  about_banner: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', // reuse mountain
  craft_banner: 'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuHnwg.jpg', // craftsmanship banner
  yemu_factory_intro: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&w=1600&q=80', // modern factory / clean lines
  factory_banner: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7c1f?auto=format&fit=crop&w=1600&q=80', // factory section default
  contact_modal_image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800', // contact modal
  checkout_wechat_qr: 'https://placehold.co/150x150?text=WeChat+QR', // checkout QR default
  site_logo: 'https://placehold.co/400x400?text=GuoJing', // fallback logo
};

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn('[usePersistentState] Failed to parse localStorage, resetting key:', key);
      try { localStorage.setItem(key, JSON.stringify(initialValue)); } catch (e) {}
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (error) {}
  }, [key, state]);
  return [state, setState];
}

const Header = ({ page, setPage, cartCount, setIsCartOpen, user, setUser, pointsBalance, onOpenContact }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowMenu(true);
  };
  const handleLeave = () => {
    hideTimer.current = setTimeout(() => setShowMenu(false), 200);
  };
  const handleToggleClick = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowMenu(v => !v);
  };

  return (
  <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-gj-border">
    <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105 duration-200" onClick={() => setPage(Page.HOME)}>
        <div className="w-11 h-11 bg-gj-green rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">国</div>
        <div>
          <h1 className="text-xl font-serif font-bold text-gj-dark tracking-wide">国精集团</h1>
          <p className="text-xs text-gj-gold tracking-wider uppercase">Guo Jing Group</p>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-8 font-medium text-gj-light-text">
        {[
          { id: Page.HOME, label: '首页' },
          { id: Page.SHOP, label: '产品中心' },
          { id: Page.POINTS_MALL, label: '积分商城' },
          { id: Page.FACTORY_INTRO, label: '九蒸九晒' },
          { id: Page.ABOUT, label: '关于我们' },
        ].map(item => (
          <button
            type="button"
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`hover:text-gj-green transition-all duration-200 relative py-2 ${page === item.id ? 'text-gj-green font-semibold' : 'hover:scale-105'}`}
          >
            {item.label}
            {page === item.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gj-green rounded-full"></span>}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Hamburger Menu Button */}
        <button 
          type="button" 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X size={24} className="text-stone-600" /> : <Menu size={24} className="text-stone-600" />}
        </button>
        <button type="button" onClick={onOpenContact} className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gj-dark hover:text-gj-green hover:bg-gj-light-bg rounded-lg transition-all duration-200">
          <Phone size={16}/> 联系我们
        </button>
        <button type="button" className="p-2.5 hover:bg-gj-gray rounded-full transition-all duration-200 relative" onClick={() => setIsCartOpen(true)} aria-label="购物车">
          <ShoppingBag size={22} className="text-gj-dark" />
          {cartCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-gj-accent text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white shadow-md">{cartCount}</span>}
        </button>
        {user ? (
          <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
             <button type="button" className="flex items-center gap-2 hover:bg-gj-gray px-3 py-1.5 rounded-full transition-all duration-200" onClick={handleToggleClick}>
                <div className="w-8 h-8 bg-gj-gold/30 rounded-full flex items-center justify-center text-gj-accent font-bold text-sm">{user.username[0].toUpperCase()}</div>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-sm font-semibold text-gj-dark max-w-[120px] truncate">{user.username}</span>
                  <span className="text-xs text-gj-gold">积分 {pointsBalance ?? 0}</span>
                </div>
             </button>
             {showMenu && (
               <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gj-border p-1 animate-fade-in z-50">
                  <button type="button" onClick={() => setPage(Page.ORDERS)} className="w-full text-left px-4 py-3 text-sm font-medium text-gj-dark hover:bg-gj-light-bg rounded-lg flex items-center gap-2 transition-colors duration-150"><ClipboardList size={16}/> 我的订单</button>
                  <div className="h-px bg-gj-border my-1"></div>
                  <button type="button" onClick={() => {
                    supaLogout().catch(console.error);
                    setUser(null);
                  }} className="w-full text-left px-4 py-3 text-sm font-medium text-gj-accent hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors duration-150"><LogOut size={16}/> 退出登录</button>
               </div>
             )}
          </div>
        ) : (
          <button type="button" onClick={() => setPage(Page.LOGIN)} className="px-6 py-2 bg-gj-dark text-white rounded-lg text-sm font-semibold hover:bg-gj-green active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg">
            登录 / 注册
          </button>
        )}
      </div>
    </div>
    
    {/* Mobile Navigation Drawer */}
    {showMobileMenu && (
      <div className="md:hidden fixed inset-0 top-20 z-50 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowMobileMenu(false)}>
        <div className="bg-white w-full max-w-sm shadow-xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
          <nav className="p-3 space-y-1">
            {[
              { id: Page.HOME, label: '首页' },
              { id: Page.SHOP, label: '产品中心' },
              { id: Page.POINTS_MALL, label: '积分商城' },
              { id: Page.FACTORY_INTRO, label: '九蒸九晒' },
              { id: Page.ABOUT, label: '关于我们' },
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => { setPage(item.id); setShowMobileMenu(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  page === item.id
                    ? 'bg-gj-green text-white shadow-md'
                    : 'text-gj-dark hover:bg-gj-light-bg'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-gj-border my-3"></div>
            <button
              type="button"
              onClick={() => { onOpenContact(); setShowMobileMenu(false); }}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-gj-dark hover:bg-gj-light-bg flex items-center gap-2 transition-all duration-200"
            >
              <Phone size={16}/> 联系我们
            </button>
          </nav>
        </div>
      </div>
    )}
  </header>
  );
};

// FIX: Footer now accepts setPage to prevent href="#" navigation issues
const Footer = ({ setPage, onOpenContact }: { setPage: (page: Page) => void; onOpenContact: () => void }) => (
  <footer className="bg-gj-dark text-white/80 py-12 md:py-16 border-t-4 border-gj-green">
    <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
      <div className="space-y-4">
        <h3 className="text-2xl font-serif font-bold text-white">国精集团</h3>
        <p className="text-sm leading-relaxed text-white/70">传承《中国药典》黄精文化，坚守九蒸九晒古法工艺。专注高品质黄精全产业链开发，只为一杯好茶。</p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-5 text-lg">快速链接</h4>
        <ul className="space-y-3 text-sm">
          {/* FIX: Replace <a href="#"> with button to prevent about:blank navigation */}
          <li><button type="button" onClick={(e) => { e.preventDefault(); setPage(Page.ABOUT); }} className="hover:text-gj-gold transition-all duration-200 text-left font-medium">品牌故事</button></li>
          <li><button type="button" onClick={(e) => { e.preventDefault(); setPage(Page.SHOP); }} className="hover:text-gj-gold transition-all duration-200 text-left font-medium">产品系列</button></li>
          <li><button type="button" onClick={(e) => { e.preventDefault(); setPage(Page.FACTORY_INTRO); }} className="hover:text-gj-gold transition-colors text-left">九华山基地</button></li>
          <li><button type="button" onClick={(e) => { e.preventDefault(); onOpenContact(); }} className="hover:text-gj-gold transition-colors text-left">商务合作</button></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-5 text-lg">联系我们</h4>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-3 hover:text-gj-gold transition-colors duration-200"><Phone size={16} className="text-gj-gold flex-shrink-0"/> 官方售后电话：4008566001</li>
          <li className="flex items-center gap-3 hover:text-gj-gold transition-colors duration-200"><Phone size={16} className="text-gj-gold flex-shrink-0"/> 官方手机电话：19956618186</li>
          <li className="flex items-center gap-3 hover:text-gj-gold transition-colors duration-200"><Mail size={16} className="text-gj-gold flex-shrink-0"/> chashuojiuhua@qygjsw.com.cn</li>
          <li className="flex items-start gap-3 hover:text-gj-gold transition-colors duration-200"><MapPin size={16} className="text-gj-gold flex-shrink-0 mt-1"/> 安徽省池州市九华山风景区</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-5 text-lg">关注我们</h4>
        <div className="flex gap-4">
          <button type="button" className="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center hover:bg-gj-gold hover:text-gj-dark transition-all duration-200 hover:scale-110 cursor-pointer" onClick={async (e) => {
            e.preventDefault();
            try {
              const domain = window.location.origin;
              await navigator.clipboard.writeText(domain);
              alert('网站域名已复制到剪贴板！\n' + domain);
            } catch (err) {
              console.error('复制失败:', err);
              alert('复制失败，请手动复制: ' + window.location.origin);
            }
          }} aria-label="分享网站"><Share2 size={18}/></button>
          <button type="button" className="w-11 h-11 bg-white/15 rounded-full flex items-center justify-center hover:bg-gj-gold hover:text-gj-dark transition-all duration-200 hover:scale-110 cursor-pointer" onClick={(e) => { e.preventDefault(); onOpenContact(); }} aria-label="联系我们"><MessageSquare size={18}/></button>
        </div>
        <p className="mt-8 text-xs text-white/50">© 2023 Guo Jing Group. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [currentPage, setCurrentPage] = usePersistentState<Page>('currentPage', Page.HOME);
  const [user, setUser] = usePersistentState<UserProfile | null>('user', null);
  const [cart, setCart] = usePersistentState<CartItem[]>('cart', []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [configImages, setConfigImages] = useState<Record<string, string>>(PLACEHOLDER_SITE_IMAGES);
  const [editMode, setEditMode] = usePersistentState<boolean>('cmsEditMode', false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [pointsLedger, setPointsLedger] = useState<{ id: string; amount: number; source: string; time: string; sourceId?: string }[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const ledgerRequestId = useRef(0);
  
  // New State for Data Sync
  const [products, setProducts] = useState<Product[]>([]);
  const [pointsProducts, setPointsProducts] = useState<any[]>([]);
  const [traceabilityVideos, setTraceabilityVideos] = useState<TraceabilityVideo[]>([]);

  // Order Management State
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);
  const [lastOrderCreatedAt, setLastOrderCreatedAt] = useState<string | null>(null);
  const [lastOrderPaymentStatus, setLastOrderPaymentStatus] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [countdownTick, setCountdownTick] = useState(0); // Force re-render for countdown

  const DEFAULT_ABOUT_HTML = `
    <h2>茶说九华公司 · 品牌介绍</h2>
    <p>茶说九华公司深耕九华山道地产区，秉承“九蒸九晒，药食同源”的理念，专注黄精茶饮与滋补产品的研发与推广。</p>
    <p>我们整合了基地种植、古法炮制、现代检测、体验零售的全链条能力，产品通过多重质检，确保每一杯黄精茶都安全可靠、口感纯正。</p>
    <p>核心价值：</p>
    <ul>
      <li>源头把控：精选高海拔山野黄精，遵循九蒸九晒古法炮制。</li>
      <li>科技检测：引入现代标准化检测流程，确保有效成分充足。</li>
      <li>文化体验：在茶空间、研学活动中传播九华山养生文化。</li>
    </ul>
  `;
  // FIX: Add default content for craftsmanship page to prevent blank page
  const DEFAULT_CRAFT_HTML = `
    <h2>九蒸九晒 · 古法炮制工艺</h2>
    <p>九蒸九晒是《中国药典》记载的黄精传统炮制方法，历经九次蒸制、九次晾晒，耗时45天以上。</p>
    <h3>工艺流程</h3>
    <ol>
      <li><strong>第一轮（1-5天）</strong>：清洗、蒸制4小时、晾晒至七成干</li>
      <li><strong>第二轮（6-10天）</strong>：复蒸3小时、晾晒、回润</li>
      <li><strong>第三至九轮（11-45天）</strong>：重复蒸晒，每轮递减蒸制时间</li>
    </ol>
    <h3>品控要点</h3>
    <ul>
      <li>原料筛选：选用3年生以上九华山野生黄精</li>
      <li>温度控制：蒸制温度严格控制在98-100℃</li>
      <li>成品检测：多糖含量≥25%，水分≤13%</li>
    </ul>
    <p class="text-sm text-gray-500 mt-4"><strong>免责声明：</strong>本页面内容仅供了解传统工艺，不构成医疗建议。</p>
  `;
  const [aboutContent, setAboutContent] = useState<string>(DEFAULT_ABOUT_HTML);
  const [craftContent, setCraftContent] = useState<string>(DEFAULT_CRAFT_HTML);
  const [craftUsedFallback, setCraftUsedFallback] = useState(false);

  const aboutRef = useRef<HTMLDivElement | null>(null);
  const pagesRequestId = useRef(0);
  const hasLoadedPages = useRef(false);

  const loadPages = useCallback(async () => {
    const requestId = ++pagesRequestId.current;
    console.info('[loadPages] start', { requestId, page: 'about_us' });
    try {
      const about = await fetchPageContent('about_us');
      if (requestId === pagesRequestId.current) {
        setAboutContent(about?.content_html || DEFAULT_ABOUT_HTML);
        console.info('[loadPages] about_us received', { requestId, length: about?.content_html?.length ?? 0, usedFallback: !about?.content_html });
      }
    } catch (e) {
      if (requestId === pagesRequestId.current) {
        setAboutContent(DEFAULT_ABOUT_HTML);
        console.warn('[loadPages] about_us fallback due to error', { requestId, error: e });
      }
    }
    console.info('[loadPages] start', { requestId, page: 'craftsmanship_process' });
    try {
      const craft = await fetchPageContent('craftsmanship_process');
      if (requestId === pagesRequestId.current) {
        setCraftContent(craft?.content_html || DEFAULT_CRAFT_HTML);
        setCraftUsedFallback(!craft?.content_html);
        console.info('[loadPages] craftsmanship_process received', { requestId, length: craft?.content_html?.length ?? 0, usedFallback: !craft?.content_html });
      }
    } catch (e) {
      if (requestId === pagesRequestId.current) {
        setCraftContent(DEFAULT_CRAFT_HTML);
        setCraftUsedFallback(true);
        console.warn('[loadPages] craftsmanship_process fallback due to error', { requestId, error: e });
      }
    }
  }, []);

  useEffect(() => {
    const loadSiteImages = async () => {
      try {
        const { data, error } = await supabase.from('site_config').select('key,value');
        if (error) throw error;
        const mapped = (data || []).reduce((acc: Record<string, string>, row: any) => {
          if (row?.key && typeof row.value === 'string') acc[row.key] = row.value;
          return acc;
        }, {});
        setConfigImages(prev => ({ ...PLACEHOLDER_SITE_IMAGES, ...prev, ...mapped }));
      } catch (e) {
        // fallback to placeholders if fetch fails
        setConfigImages(prev => ({ ...PLACEHOLDER_SITE_IMAGES, ...prev }));
      }
    };
    loadSiteImages();

    // FIX: Only warn on form submit to avoid breaking editor lifecycle
    const warnFormSubmit = (e: Event) => {
      console.warn('[App] Form submission detected - ensure buttons use type="button" if unintended');
    };
    
    document.addEventListener('submit', warnFormSubmit, true);
    
    const restoreUserSession = async () => {
      if (!user) {
        try {
          const me = await getMe();
          console.log('[App] Supabase session restored:', { userId: me.id, email: me.username });
          setUser(me);
        } catch (error) {
          console.warn('[App] No Supabase session to restore', error);
        }
      }
    };
    restoreUserSession();
    
    return () => {
      document.removeEventListener('submit', warnFormSubmit, true);
    };
  }, []);

  // Fetch Products on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .order('id');
        if (productError) throw productError;
        if (productData) {
          const mapped = productData.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description_html || p.description || '',
            price: parseFloat(p.price as any) || 0,
            original_price: p.original_price ? parseFloat(p.original_price as any) : undefined,
            stock: p.stock ?? 0,
            category: p.category || 'tea' as const,
            imageUrl: p.image_url || p.cover_image || configImages['site_logo'] || '',
            brand: p.brand || 'Tea Talk Jiuhua',
            description_html: p.description_html,
            is_active: p.is_active ?? true,
            features: p.features || [],
            usage_method: p.usage_method || '',
            core_ingredients: p.core_ingredients || [],
            suitable_for: p.suitable_for || [],
            specifications: p.specifications || [],
          }));
          setProducts(mapped);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (e) {
        console.error("Failed to fetch products from Supabase, using mock", e);
        setProducts(MOCK_PRODUCTS);
      }

      try {
        const { data, error } = await supabase
          .from('points_products')
          .select('*')
          .order('points_cost', { ascending: true });
        if (error) throw error;
        if (data) {
          console.log('Points products loaded:', data);
          const mappedPoints = data.map((item: any) => ({
            ...item,
            image_url: item.image_url || configImages['site_logo'] || 'https://placehold.co/600x600?text=No+Image',
          }));
          setPointsProducts(mappedPoints);
        }
      } catch (error) {
        console.error('Error loading points:', error);
        setPointsProducts([]);
      }

      // Load Traceability Videos
      try {
        const videos = await fetchTraceabilityVideos();
        setTraceabilityVideos(videos);
        console.log('Traceability videos loaded:', videos);
      } catch (error) {
        console.error('Error loading traceability videos:', error);
        setTraceabilityVideos([]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const requestId = ++ledgerRequestId.current;
    let cancelled = false;
    const loadLedger = async () => {
      // Guard: Skip if user not logged in or using placeholder UUID
      if (!user?.id || user.id === '00000000-0000-0000-0000-000000000000') return;
      if (cancelled) return;
      setIsLedgerLoading(true);
      setLedgerError(null);
      try {
        const rows = await apiPointsLedger(user.id, 20);
        if (cancelled || requestId !== ledgerRequestId.current) return;
        const mapped = rows.map((r: any) => ({
          id: r.id || `ledger-${r.created_at}`,
          amount: r.amount,
          source: r.description || r.source_type,
          time: r.created_at || '',
          sourceId: r.source_id,
        }));
        setPointsLedger(mapped);
      } catch (e: any) {
        if (cancelled || requestId !== ledgerRequestId.current) return;
        console.error('ledger fetch failed', e);
        setLedgerError('无法获取积分流水，已使用本地记录');
      } finally {
        if (cancelled || requestId !== ledgerRequestId.current) return;
        setIsLedgerLoading(false);
      }
    };
    loadLedger();
    return () => {
      cancelled = true;
      ledgerRequestId.current++;
    };
  }, [user?.id]);

  useEffect(() => {
    if (hasLoadedPages.current) return;
    hasLoadedPages.current = true;
    loadPages();
  }, []); // intentionally empty to avoid re-triggering and ensure single load on mount

  // Load user orders when ORDERS page is accessed
  useEffect(() => {
    const loadUserOrders = async () => {
      if (currentPage === Page.ORDERS && user) {
        setOrdersLoading(true);
        try {
          const { getUserOrders } = await import('./services/userOrders');
          const orders = await getUserOrders();
          setUserOrders(orders);
        } catch (error) {
          console.error('Failed to load orders:', error);
          setUserOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    loadUserOrders();
  }, [currentPage, user]);

  // Set up countdown timer for pending orders
  useEffect(() => {
    if (currentPage === Page.ORDERS && userOrders.length > 0) {
      const interval = setInterval(() => {
        setCountdownTick(prev => prev + 1); // Increment to trigger re-render
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentPage, userOrders]);

  const scrollToAbout = () => {
    if (currentPage !== Page.HOME) {
      setCurrentPage(Page.HOME);
      setTimeout(() => {
        aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpdateImage = (key: string, url: string) => {
    setConfigImages(prev => ({ ...prev, [key]: url }));
  };

  const isAdmin = user?.role === 'admin';

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
       if (item.id === id) {
         return { ...item, quantity: Math.max(1, item.quantity + delta) };
       }
       return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const appendLedger = (amount: number, source: string, sourceId?: string) => {
    setPointsLedger(prev => [{ id: `ledger-${Date.now()}`, amount, source, time: new Date().toISOString(), sourceId }, ...prev].slice(0, 50));
  };

  const updatePointsRemote = async (delta: number, sourceType: 'order_use' | 'order_earn', sourceId?: string, description?: string) => {
    if (!user?.id) {
      // fallback: local update only
      setUser(prev => prev ? { ...prev, points_balance: Math.max(0, (prev.points_balance || 0) + delta) } : prev);
      appendLedger(delta, description || sourceType, sourceId);
      return;
    }
    try {
      const payload = { user_id: user.id, amount: delta, source_type: sourceType, source_id: sourceId, description };
      const res = delta < 0 ? await pointsUse(payload) : await pointsEarn(payload);
      setUser(prev => prev ? { ...prev, points_balance: res.points_balance ?? Math.max(0, (prev.points_balance || 0) + delta) } : prev);
      appendLedger(delta, description || sourceType, sourceId);
    } catch (err) {
      console.error('points api failed', err);
      // graceful fallback local
      setUser(prev => prev ? { ...prev, points_balance: Math.max(0, (prev.points_balance || 0) + delta) } : prev);
      appendLedger(delta, `${description || sourceType} (local)`, sourceId);
    }
  };

  const handleCheckout = async (address: Address, pointsUsed: number) => {
    // Check if user is logged in
    if (!user) {
      alert('请先登录后再提交订单');
      setIsCheckoutOpen(false);
      setCurrentPage(Page.LOGIN);
      return;
    }

    try {
      const netPaid = Math.max(0, cartTotal - pointsUsed);
      const earn = Math.floor(netPaid / 10);

      // 创建订单
      const { createUserOrder } = await import('./services/userOrders');
      const orderPayload = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price
        })),
        customer_name: address.name,
        customer_phone: address.phone,
        customer_email: user.username,
        address_json: address,
        shipping_fee: 0,
        discount_total: pointsUsed,
        grand_total: netPaid
      };

      const createdOrder = await createUserOrder(orderPayload);

      // 积分处理
      // 1. 积分抵扣：下单时立即扣除
      if (pointsUsed > 0) {
        await updatePointsRemote(-pointsUsed, 'order_use', createdOrder.order_code, '订单抵扣');
      }
      // 2. 积分赠送：只有在订单已付款时才发放
      // 注意：订单刚创建时 payment_status 为 'unpaid'，所以这里不会发放积分
      // 积分赠送应该在用户付款后通过后台或webhook触发
      if (earn > 0 && createdOrder.payment_status === 'paid') {
        await updatePointsRemote(earn, 'order_earn', createdOrder.order_code, '消费赠送');
      }

      // 清空购物车
      setCart([]);
      setIsCheckoutOpen(false);
      setCurrentOrder(createdOrder);
      
      // 跳转到联系我们页面
      setLastOrderCode(createdOrder.order_code);
      setLastOrderCreatedAt(createdOrder.created_at || null);
      setLastOrderPaymentStatus(createdOrder.payment_status || 'unpaid');
      setCurrentPage(Page.CONTACT_US);
    } catch (error: any) {
      console.error('[handleCheckout] Order creation failed:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('登录') || error.message?.includes('token')) {
        alert('登录状态已过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsCheckoutOpen(false);
        setCurrentPage(Page.LOGIN);
      } else {
        alert(`订单创建失败: ${error.message || '请稍后重试'}`);
      }
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.HOME:
        return (
          <div className="space-y-20 md:space-y-24 pb-16 md:pb-20">
            {/* Hero Section with Editable Image */}
            <div className="relative h-[500px] md:h-[700px] w-full overflow-hidden">
                 <EditableImage
                 imageKey="home_hero_bg"
                 defaultSrc={configImages['home_hero_bg']}
                 alt="Hero Banner"
                 className="w-full h-full object-cover"
                 currentUser={user}
                 currentUrl={configImages['home_hero_bg']}
                 onUpdate={handleUpdateImage}
                 editMode={editMode}
               />
               <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-center text-white">
                 <div className="max-w-3xl px-4 md:px-6 animate-slide-up">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-5 md:mb-8 tracking-wider">九蒸九晒九露·九华山</h2>
                    <p className="text-base md:text-xl text-white/90 mb-8 md:mb-10 font-light tracking-wider leading-relaxed">源自九华山脉，承袭古法炮制。每一口都是对时光的敬畏。</p>
                    <button type="button" onClick={() => setCurrentPage(Page.SHOP)} className="px-8 md:px-10 py-3 md:py-4 bg-gj-gold text-gj-dark font-bold rounded-lg hover:bg-white active:scale-95 transition-all duration-200 shadow-lg text-base md:text-lg">立即探索</button>
                 </div>
               </div>
            </div>

            {/* Featured Products */}
            <div className="container mx-auto px-4 md:px-8">
               <div className="text-center mb-10 md:mb-14">
                 <h3 className="text-3xl md:text-4xl font-serif font-bold text-gj-dark mb-4">当季臻选</h3>
                 <div className="w-16 h-1.5 bg-gj-gold mx-auto rounded-full"></div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                 {products.slice(0, 4).map(product => (
                   <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setCurrentPage(Page.PRODUCT_DETAIL); }}>
                     <div className="relative aspect-square overflow-hidden rounded-xl bg-gj-gray mb-4 border border-gj-border shadow-sm hover:shadow-lg transition-all duration-300">
                      <EditableImage
                        imageKey={`product_${product.id}_image`}
                        defaultSrc={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        currentUser={user}
                        currentUrl={configImages[`product_${product.id}_image`]}
                        onUpdate={handleUpdateImage}
                        editMode={editMode}
                        stopPropagation={true}
                      />
                       <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                         <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-12 h-12 bg-gj-green text-white rounded-full flex items-center justify-center hover:bg-gj-dark active:scale-90 transition-all duration-200 shadow-lg" aria-label="加入购物车"><ShoppingBag size={20}/></button>
                       </div>
                     </div>
                     <h4 className="font-semibold text-lg text-gj-dark mb-1 group-hover:text-gj-green transition-colors duration-200">{product.name}</h4>
                     <p className="text-sm text-gj-light-text mb-2 line-clamp-1">{product.description}</p>
                     <p className="font-serif font-bold text-gj-gold text-lg">{formatPrice(product.price)}</p>
                   </div>
                 ))}
               </div>
            </div>

             {/* Brand Story Snippet */}
            <div className="bg-gj-light-bg py-16 md:py-24">
               <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-16">
                  <div className="flex-1 relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg border border-gj-border">
                      <EditableImage
                         imageKey="home_brand_story"
                         defaultSrc={configImages['home_brand_story']}
                         alt="Brand Story"
                         className="w-full h-full object-cover"
                         currentUser={user}
                         currentUrl={configImages['home_brand_story']}
                         onUpdate={handleUpdateImage}
                         editMode={editMode}
                       />
                  </div>
                  <div className="flex-1 space-y-6 md:space-y-8">
                     <h3 className="text-3xl md:text-4xl font-serif font-bold text-gj-dark">匠心精神，道地药材</h3>
                     <p className="text-base md:text-lg text-gj-light-text leading-relaxed">国精集团依托《中国药典》标准，在九华山建立万亩有机种植基地。我们坚持"非遗"技艺，每一颗黄精都经过九蒸九晒，历时45天，只为保留最纯粹的药效与口感。</p>
                     <button type="button" onClick={() => setCurrentPage(Page.FACTORY_INTRO)} className="inline-flex items-center gap-2 text-gj-green font-bold text-lg hover:text-gj-dark hover:gap-3 transition-all duration-200">深入了解 <ArrowRight size={20}/></button>
                  </div>
               </div>
            </div>

            {/* Ye Mu Hua Xian Factory Section */}
            <div className="bg-white py-16 border-t border-stone-100">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-4 mt-12 md:mt-12">
                  <h3 className="text-3xl font-serif font-bold text-gj-dark">黄精加工厂</h3>
                  <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: aboutContent || '尚未配置内容，请在后台保存"黄精加工厂"页面。' }} />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <EditableImage
                    imageKey="yemu_factory_intro"
                    defaultSrc={configImages['yemu_factory_intro']}
                    alt="Factory Banner"
                    className="w-full h-full object-cover"
                    currentUser={user}
                    currentUrl={configImages['yemu_factory_intro']}
                    onUpdate={handleUpdateImage}
                    editMode={editMode}
                  />
                </div>
              </div>
            </div>

            {/* About Us (CMS) */}
            <div ref={aboutRef} className="bg-white py-16 border-t border-stone-100">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-bold text-gj-dark">关于我们 · 国精集团</h3>
                  <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: aboutContent || '尚未配置内容，请在后台保存"关于我们"页面。' }} />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <EditableImage
                    imageKey="about_banner"
                    defaultSrc={configImages['about_banner']}
                    alt="About us"
                    className="w-full h-full object-cover"
                    currentUser={user}
                    currentUrl={configImages['about_banner']}
                    onUpdate={handleUpdateImage}
                    editMode={editMode}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case Page.SHOP:
        return (
          <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gj-dark mb-8 md:mb-10">全线产品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
               {products.map(product => (
                   <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setCurrentPage(Page.PRODUCT_DETAIL); }}>
                     <div className="relative aspect-square overflow-hidden rounded-xl bg-gj-gray mb-4 border border-gj-border shadow-sm hover:shadow-lg transition-all duration-300">
                      <EditableImage
                        imageKey={`product_${product.id}_image`}
                        defaultSrc={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        currentUser={user}
                        currentUrl={configImages[`product_${product.id}_image`]}
                        onUpdate={handleUpdateImage}
                        editMode={editMode}
                        stopPropagation={true}
                      />
                       <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                         <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-11 h-11 bg-gj-green text-white rounded-full flex items-center justify-center hover:bg-gj-dark active:scale-90 transition-all duration-200 shadow-lg" aria-label="加入购物车"><ShoppingBag size={20}/></button>
                       </div>
                     </div>
                     <h4 className="font-semibold text-lg text-gj-dark mb-1 group-hover:text-gj-green transition-colors duration-200">{product.name}</h4>
                     <p className="font-serif font-bold text-gj-gold text-lg">{formatPrice(product.price)}</p>
                   </div>
               ))}
            </div>

            {/* Points Ledger */}
            <div className="mt-12 bg-white border border-gj-border rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-5 bg-gj-light-bg border-b border-gj-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gj-dark">积分流水</h3>
                  <p className="text-sm text-gj-light-text mt-0.5">最近 20 条</p>
                </div>
                {ledgerError && <span className="text-sm text-gj-accent">{ledgerError}</span>}
              </div>
              {isLedgerLoading ? (
                <div className="p-8 text-center text-gj-light-text">正在加载积分流水...</div>
              ) : (
                <div className="divide-y divide-gj-border">
                  {pointsLedger.length === 0 ? (
                    <div className="p-8 text-center text-gj-light-text">暂无积分流水</div>
                  ) : pointsLedger.map(item => (
                    <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gj-light-bg transition-colors duration-150">
                      <div>
                        <div className={`text-base font-bold ${item.amount >=0 ? 'text-gj-green' : 'text-gj-accent'}`}>
                          {item.amount >=0 ? '+' : ''}{item.amount} 积分
                        </div>
                        <div className="text-sm text-gj-light-text mt-1">{item.source}</div>
                      </div>
                      <div className="text-right text-sm text-gj-light-text">
                        <div>{item.time ? new Date(item.time).toLocaleString('zh-CN') : ''}</div>
                        {item.sourceId && <div className="text-xs mt-0.5">关联ID: {item.sourceId}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case Page.PRODUCT_DETAIL:
        return selectedProduct ? (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <button onClick={() => setCurrentPage(Page.SHOP)} className="flex items-center gap-2 text-stone-500 hover:text-gj-dark mb-6 md:mb-8"><ChevronLeft size={20}/> 返回列表</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
               <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden">
                  <EditableImage
                    imageKey={`product_${selectedProduct.id}_image`}
                    defaultSrc={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    currentUser={user}
                    currentUrl={configImages[`product_${selectedProduct.id}_image`]}
                    onUpdate={handleUpdateImage}
                    editMode={editMode}
                  />
               </div>
               <div className="space-y-4 md:space-y-6">
                  <span className="bg-gj-green/10 text-gj-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedProduct.brand === 'Tea Talk Jiuhua' ? '茶说九华' : '叶木花仙'}</span>
                  <h1 className="text-2xl md:text-4xl font-serif font-bold text-gj-dark">{selectedProduct.name}</h1>
                  <p className="text-2xl text-gj-gold font-serif font-bold">{formatPrice(selectedProduct.price)}</p>
                  <p className="text-stone-600 leading-relaxed">{selectedProduct.details}</p>

                  {/* Product Introduction - Compact Version */}
                  <div className="space-y-2.5 md:space-y-3 pt-3 md:pt-4 border-t border-gj-border">
                    {/* 产品特点 - 合并功效和适用人群 */}
                    <div className="bg-gradient-to-r from-gj-light-bg to-white p-3 md:p-4 rounded-lg border border-gj-border">
                      <h3 className="text-sm md:text-base font-bold text-gj-dark mb-2 flex items-center gap-2">
                        <Award size={16} className="text-gj-gold md:w-4 md:h-4"/>
                        <span>产品特点</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs md:text-sm text-stone-700">
                        <div className="flex items-center gap-1.5">
                          <CheckCheck size={12} className="text-gj-green flex-shrink-0 md:w-3.5 md:h-3.5"/>
                          <span>补中益气，滋阴润肺</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCheck size={12} className="text-gj-green flex-shrink-0 md:w-3.5 md:h-3.5"/>
                          <span>增强免疫，改善疲劳</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCheck size={12} className="text-gj-green flex-shrink-0 md:w-3.5 md:h-3.5"/>
                          <span>抗氧化美容养颜</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCheck size={12} className="text-gj-green flex-shrink-0 md:w-3.5 md:h-3.5"/>
                          <span>调节血糖血脂</span>
                        </div>
                      </div>
                    </div>

                    {/* 使用方法 - 精简版 */}
                    <div className="bg-gj-light-bg p-3 md:p-4 rounded-lg border border-gj-border">
                      <h3 className="text-sm md:text-base font-bold text-gj-dark mb-2 flex items-center gap-2">
                        <Sun size={16} className="text-gj-gold md:w-4 md:h-4"/>
                        <span>使用方法</span>
                      </h3>
                      <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
                        取3-5克黄精茶，用90-95℃热水冲泡，焖5-8分钟后饮用。可与枸杞、红枣搭配，建议早晚各一次。
                      </p>
                    </div>

                    {/* 核心成分 - 精简版 */}
                    <div className="bg-white p-3 md:p-4 rounded-lg border border-gj-border">
                      <h3 className="text-sm md:text-base font-bold text-gj-dark mb-2 flex items-center gap-2">
                        <Leaf size={16} className="text-gj-gold md:w-4 md:h-4"/>
                        <span>核心成分</span>
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                        <span className="px-2.5 py-1 bg-gj-green/10 text-gj-dark rounded-full">黄精多糖 ≥25%</span>
                        <span className="px-2.5 py-1 bg-gj-green/10 text-gj-dark rounded-full">皂苷类成分</span>
                        <span className="px-2.5 py-1 bg-gj-green/10 text-gj-dark rounded-full">氨基酸</span>
                        <span className="px-2.5 py-1 bg-gj-green/10 text-gj-dark rounded-full">微量元素</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex gap-4">
                     <button type="button" onClick={() => addToCart(selectedProduct)} className="flex-1 py-4 bg-gj-dark text-white rounded-xl font-bold hover:bg-gj-green transition-colors shadow-lg shadow-gj-dark/20 flex items-center justify-center gap-2">
                        <ShoppingBag size={20}/> 加入购物车
                     </button>
                     <button type="button" className="w-14 h-14 border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors"><Heart size={24}/></button>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-xl space-y-3 mt-6">
                    <div className="flex items-center gap-3 text-sm text-stone-600">
                      <Truck size={18} className="text-gj-green"/>
                      <span>全国包邮（偏远地区除外）</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-stone-600">
                      <Shield size={18} className="text-gj-green"/>
                      <span>官方正品保证，PICC承保</span>
                    </div>
                     <div className="flex items-center gap-3 text-sm text-stone-600">
                      <Clock size={18} className="text-gj-green"/>
                      <span>48小时内发货</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : null;
      case Page.POINTS_MALL:
        return (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gj-dark">积分商城</h2>
                <p className="text-stone-500 mt-2">1 积分 = ¥1，可用余额：{user?.points_balance || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {(pointsProducts.length ? pointsProducts : MOCK_POINTS_PRODUCTS).map(item => {
                const pointsCost = item.points_cost ?? item.pointsPrice ?? item.points_price ?? 0;
                const imageSrc = item.image_url || item.imageUrl || configImages['site_logo'] || 'https://placehold.co/600x600?text=No+Image';
                const canRedeem = (user?.points_balance || 0) >= pointsCost;
                return (
                  <div key={item.id} className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="aspect-square bg-stone-50">
                      <EditableImage
                        imageKey={`points_${item.id}_image`}
                        defaultSrc={imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        currentUser={user}
                        currentUrl={configImages[`points_${item.id}_image`]}
                        onUpdate={handleUpdateImage}
                        editMode={editMode}
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-bold text-gj-dark">{item.name}</h3>
                      <p className="text-sm text-stone-500 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gj-gold font-serif font-bold">{pointsCost} 积分</span>
                        <button
                          disabled={!user || !canRedeem}
                          onClick={async () => {
                            if (!user) { alert('请先登录'); return; }
                            if (!canRedeem) { alert('积分不足'); return; }
                            await updatePointsRemote(-pointsCost, 'order_use', item.id, '积分兑换');
                            alert('兑换成功，客服将与您联系发货');
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-bold ${canRedeem ? 'bg-gj-dark text-white hover:bg-gj-green' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                        >
                          {canRedeem ? '立即兑换' : '积分不足'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case Page.FACTORY_INTRO:
        return (
          <div className="container mx-auto px-4 py-8 md:py-12 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gj-dark">九蒸九晒 · 古法炮制</h2>
                <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: craftContent || '尚未配置内容，请在后台保存"九蒸九晒工艺"页面。' }} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                  <EditableImage
                  imageKey="craft_banner"
                  defaultSrc={configImages['craft_banner']}
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                  currentUser={user}
                  currentUrl={configImages['craft_banner']}
                  onUpdate={handleUpdateImage}
                  editMode={editMode}
                />
              </div>
            </div>

            {/* 溯源工艺视频区域 */}
            {traceabilityVideos.length > 0 && (
              <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
                {traceabilityVideos.map((video) => (
                  <div key={video.id} className="mb-12">
                    <div className="text-center mb-8 md:mb-12">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gj-dark mb-4">{video.title}</h2>
                      <div className="w-16 h-1.5 bg-gj-gold mx-auto rounded-full mb-6"></div>
                      {video.description && (
                        <p className="text-base md:text-lg text-gj-light-text max-w-3xl mx-auto">
                          {video.description}
                        </p>
                      )}
                    </div>

                    <div className="max-w-5xl mx-auto">
                      <div className="relative aspect-video bg-gj-gray rounded-xl overflow-hidden shadow-lg border border-gj-border">
                        <video
                          className="w-full h-full object-cover"
                          controls
                          poster={video.poster_url || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200'}
                        >
                          <source src={video.video_url} type="video/mp4" />
                          您的浏览器不支持视频播放。
                        </video>
                      </div>

                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gj-border shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="text-lg font-bold text-gj-dark mb-3">基地种植</h3>
                          <p className="text-sm text-gj-light-text">九华山脉生态基地，海拔800米以上，土壤肥沃，适宜黄精生长。</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gj-border shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="text-lg font-bold text-gj-dark mb-3">古法炮制</h3>
                          <p className="text-sm text-gj-light-text">严格遵循九蒸九晒工艺，历时45天，确保药效最大化。</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 border border-gj-border shadow-sm hover:shadow-md transition-all duration-200">
                          <h3 className="text-lg font-bold text-gj-dark mb-3">质量检测</h3>
                          <p className="text-sm text-gj-light-text">引入现代化检测设备，多项指标严格把控，确保产品安全。</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case Page.ABOUT:
        return (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              <div className="space-y-3 md:space-y-4 mt-12 md:mt-12 text-left">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gj-dark">关于我们 · 黄精加工厂</h2>
                <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: aboutContent || '尚未配置内容，请在后台保存"关于我们"页面。' }} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <EditableImage
                  imageKey="about_banner"
                  defaultSrc="https://images.unsplash.com/photo-1531685250784-756994db931e?auto=format&fit=crop&q=80&w=1200"
                  alt="About us"
                  className="w-full h-full object-cover"
                  currentUser={user}
                  currentUrl={configImages['about_banner']}
                  onUpdate={handleUpdateImage}
                  editMode={editMode}
                />
              </div>
            </div>
          </div>
        );
      case Page.ORDERS:
        return (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gj-dark mb-6">我的订单</h2>
            {!user ? (
              <div className="text-center py-12">
                <p className="text-stone-500 mb-4">请先登录查看订单</p>
                <button onClick={() => setCurrentPage(Page.LOGIN)} className="px-6 py-3 bg-gj-dark text-white rounded-full font-bold hover:bg-gj-green transition-colors">前往登录</button>
              </div>
            ) : ordersLoading ? (
              <div className="text-center py-12 text-stone-500">加载中...</div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-stone-500 mb-4">暂无订单</p>
                <button onClick={() => setCurrentPage(Page.SHOP)} className="px-6 py-3 bg-gj-dark text-white rounded-full font-bold hover:bg-gj-green transition-colors">去购物</button>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map(order => {
                  const isPending = order.status === 'pending' && order.payment_status === 'unpaid';
                  const isCancelled = order.status === 'cancelled';
                  const isPaid = order.payment_status === 'paid';

                  let statusColor = 'bg-yellow-100 text-yellow-700';
                  let statusText = '待支付';

                  if (isCancelled) {
                    statusColor = 'bg-red-100 text-red-700';
                    statusText = '已取消';
                  } else if (isPaid) {
                    statusColor = 'bg-green-100 text-green-700';
                    statusText = '已支付';
                  }

                  // Countdown calculation - recomputes every second due to countdownTick
                  // 基于 created_at + 30分钟计算过期时间
                  const createdAt = new Date(order.created_at);
                  const expiresAt = new Date(createdAt.getTime() + 30 * 60 * 1000);
                  const now = new Date();
                  const timeLeft = isPending ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000)) : 0;
                  const minutes = Math.floor(timeLeft / 60);
                  const seconds = timeLeft % 60;

                  // Use countdownTick to ensure re-render
                  const _ = countdownTick; // Force dependency on countdown tick

                  // Debug: log countdown info
                  if (isPending && expiresAt) {
                    console.log(`[Order ${order.order_code}] expires_at:`, order.expires_at, 'timeLeft:', timeLeft, 'mins:', minutes, 'secs:', seconds);
                  }
                  
                  return (
                    <div key={order.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gj-dark">订单号: {order.order_code}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusText}</span>
                          </div>
                          <p className="text-sm text-stone-500">下单时间: {formatBJTime(order.created_at)}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-stone-700">{item.product_name} x {item.quantity}</span>
                            <span className="font-bold text-gj-dark">¥{item.line_total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-stone-100 pt-4 flex justify-between items-end">
                        <div className="text-sm text-stone-500">
                          <p>收货人: {order.customer_name}</p>
                          <p>电话: {order.customer_phone}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                          <div>
                            <p className="text-sm text-stone-500 mb-1">订单总额</p>
                            <p className="text-2xl font-serif font-bold text-gj-dark">¥{order.grand_total}</p>
                          </div>
                          {isPending && timeLeft > 0 && (
                            <div className="text-right bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                              <p className="text-xs text-yellow-700 font-semibold mb-1">剩余支付时间</p>
                              <p className="text-lg font-bold text-yellow-600 font-mono">{minutes}:{seconds.toString().padStart(2, '0')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isPending && (
                        <div className="mt-4 pt-4 border-t border-stone-100">
                          <button 
                            onClick={() => {
                              setLastOrderCode(order.order_code);
                              setCurrentPage(Page.CONTACT_US);
                            }}
                            className="w-full py-3 bg-gj-dark text-white rounded-xl font-bold hover:bg-gj-green transition-colors flex items-center justify-center gap-2"
                          >
                            <Phone size={18} /> 联系客服完成支付
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case Page.CONTACT_US:
        return (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gj-dark mb-6 text-center">联系我们</h2>
              
              {lastOrderCode && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 animate-slide-up">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-800 mb-2">订单已提交成功！</h3>
                      <p className="text-green-700 text-sm mb-2">订单号: <span className="font-mono font-bold">{lastOrderCode}</span></p>
                      <p className="text-green-600 text-sm">请联系客服完成支付，订单将在30分钟内保留。</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gj-gold/10 rounded-full">
                    <Phone className="text-gj-gold" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gj-dark mb-2">客服电话</h3>
                    <p className="text-lg font-bold text-gj-dark mb-1">官方售后电话：4008566001</p>
                    <p className="text-lg font-bold text-gj-dark mb-2">官方手机电话：19956618186</p>
                    <p className="text-sm text-stone-500">工作时间: 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gj-green/10 rounded-full">
                    <Mail className="text-gj-green" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gj-dark mb-2">客服邮箱</h3>
                    <p className="text-lg font-bold text-gj-dark mb-1">chashuojiuhua@qygjsw.com.cn</p>
                    <p className="text-sm text-stone-500">我们会在24小时内回复您的邮件</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-stone-100 rounded-full">
                    <MapPin className="text-stone-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gj-dark mb-2">公司地址</h3>
                    <p className="text-stone-700">安徽省池州市九华山风景区</p>
                    <p className="text-sm text-stone-500 mt-1">欢迎预约参观我们的生产基地</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-stone-100">
                  <h3 className="font-bold text-gj-dark mb-3">支付方式说明</h3>
                  <ul className="space-y-2 text-sm text-stone-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-gj-green mt-0.5 flex-shrink-0" />
                      <span>联系客服后，我们将为您提供银行转账或微信/支付宝收款码</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-gj-green mt-0.5 flex-shrink-0" />
                      <span>完成支付后请保留凭证，并告知客服订单号</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-gj-green mt-0.5 flex-shrink-0" />
                      <span>确认收款后，我们将立即为您安排发货</span>
                    </li>
                  </ul>
                  <div className="mt-6 flex justify-center">
                    <img
                      src={configImages['checkout_wechat_qr'] || configImages['site_logo'] || 'https://placehold.co/200x200?text=Payment+QR'}
                      alt="微信收款码"
                      className="w-48 h-48 object-contain rounded-xl border border-stone-200 shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setCurrentPage(Page.ORDERS)}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                  >
                    查看我的订单
                  </button>
                  <button 
                    onClick={() => {
                      setLastOrderCode(null);
                      setCurrentPage(Page.HOME);
                    }}
                    className="flex-1 py-3 bg-gj-dark text-white rounded-xl font-bold hover:bg-gj-green transition-colors"
                  >
                    返回首页
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case Page.LOGIN:
      case Page.REGISTER:
        return (
          <AuthPage 
            onLoginSuccess={(u) => { setUser(u); setCurrentPage(Page.HOME); }}
            onRegisterSuccess={(u) => { setUser(u); setCurrentPage(Page.HOME); }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-white selection:bg-gj-gold selection:text-white">
      <Header 
        page={currentPage} 
        setPage={setCurrentPage} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        setIsCartOpen={setIsCartOpen}
        user={user}
        setUser={setUser}
        pointsBalance={user?.points_balance}
        onOpenContact={() => setIsContactOpen(true)}
      />
      
      <main className="animate-fade-in">
        {renderContent()}
      </main>

      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setEditMode(v => !v)}
            className={`px-4 py-2 rounded-full shadow-lg text-sm font-bold transition-colors ${editMode ? 'bg-gj-green text-white' : 'bg-white text-gj-dark border border-stone-200'}`}
          >
            编辑模式：{editMode ? '开' : '关'}
          </button>
        </div>
      )}

      <Footer setPage={setCurrentPage} onOpenContact={() => setIsContactOpen(true)} />
      <ContactModal 
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        currentUser={user}
        siteImages={configImages}
        onUpdateImage={handleUpdateImage}
        editMode={editMode}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        totalAmount={cartTotal}
        onSubmit={handleCheckout}
        currentUser={user}
        siteImages={configImages}
        editMode={editMode}
        onUpdateImage={handleUpdateImage}
        orderPaymentStatus={currentOrder?.payment_status}
        orderCreatedAt={currentOrder?.created_at || undefined}
        paymentQrUrl={configImages['checkout_wechat_qr']}
      />

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full max-w-full md:max-w-[480px] bg-white z-50 shadow-2xl animate-slide-left flex flex-col">
            <div className="p-5 md:p-6 border-b border-gj-border flex items-center justify-between bg-gj-light-bg">
              <h2 className="font-serif font-bold text-xl md:text-2xl text-gj-dark flex items-center gap-3">
                <div className="p-2 bg-gj-gold/20 rounded-lg">
                  <ShoppingBag className="text-gj-gold" size={22}/>
                </div>
                购物车
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white rounded-full transition-all duration-200" aria-label="关闭购物车"><X size={22}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gj-light-text space-y-5">
                  <div className="p-6 bg-gj-gray rounded-full">
                    <ShoppingBag size={64} className="opacity-30"/>
                  </div>
                  <p className="text-lg">您的购物车是空的</p>
                  <button onClick={() => { setIsCartOpen(false); setCurrentPage(Page.SHOP); }} className="px-6 py-3 bg-gj-green text-white rounded-lg font-semibold hover:bg-gj-dark active:scale-95 transition-all duration-200">开始购物</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 group bg-white rounded-xl border border-gj-border hover:shadow-md transition-all duration-200">
                    <div className="w-24 h-24 bg-gj-gray rounded-lg overflow-hidden flex-shrink-0 border border-gj-border">
                      <EditableImage
                        imageKey={`product_${item.id}_image`}
                        defaultSrc={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        currentUser={user}
                        currentUrl={configImages[`points_${item.id}_image`]}
                        onUpdate={handleUpdateImage}
                        editMode={editMode}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-semibold text-gj-dark line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-gj-light-text mt-1">{item.brand}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gj-gold text-lg">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 bg-gj-gray rounded-lg px-3 py-1.5">
                          <button onClick={() => updateCartQuantity(item.id, -1)} disabled={item.quantity <= 1} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-30 transition-all duration-150 active:scale-90" aria-label="减少数量"><Minus size={16}/></button>
                          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-all duration-150 active:scale-90" aria-label="增加数量"><Plus size={16}/></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gj-light-text hover:text-gj-accent self-start p-2 transition-colors duration-200 rounded-md hover:bg-red-50" aria-label="删除商品"><Trash2 size={20}/></button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 md:p-6 border-t border-gj-border bg-white shadow-lg space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gj-light-text font-medium">总计 (不含运费)</span>
                  <span className="text-3xl font-serif font-bold text-gj-dark">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full py-4 bg-gj-dark text-white rounded-lg font-bold text-lg hover:bg-gj-green active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  立即结算 <ArrowRight size={20}/>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
