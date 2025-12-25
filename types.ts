
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock?: number;
  category: 'tea' | 'supplement' | 'gift';
  imageUrl: string;
  cover_image?: string;
  brand: 'Tea Talk Jiuhua' | 'Yemu Huaxian';
  specs?: string[]; 
  details?: string;
  images?: string[];
  description_html?: string;
  is_active?: boolean;
}

export interface PointsProduct extends Product {
  pointsPrice: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  likes: number;
  date: string;
  tags: string[];
  comments: Comment[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed';

export interface Region {
  code: string;
  name: string;
  children?: Region[];
}

export interface Address {
  name: string;
  phone: string;
  province: string;
  provinceCode?: string;
  city: string;
  cityCode?: string;
  district: string;
  districtCode?: string;
  detail: string;
}

export interface Order {
  id: string;
  order_code: string;
  userId?: string;
  user_id?: string;
  items: CartItem[];
  totalAmount?: number;
  grand_total: number;
  items_total: number;
  shipping_fee: number;
  discount_total: number;
  status: string;
  payment_status: string;
  createdAt?: string;
  created_at: string;
  expires_at?: string;
  shippingAddress?: Address;
  address_json?: any;
  customer_name?: string;
  customer_phone?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  password?: string;
  role: 'user' | 'vip' | 'admin';
  points: number; // Deprecated, use points_balance
  points_balance: number;
  registrationDate: string;
  status: 'active' | 'banned';
  lastIp?: string;
}

export interface PageContent {
  page_key: string;
  title: string;
  content_html: string;
  updated_at?: string;
}

export interface SiteImage {
  key: string;      // Unique identifier (e.g., 'home_hero_bg')
  url: string;      // Current image URL
  description: string; // Helper text for admin
  lastUpdated?: string;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';
  message: string;
  timestamp: string;
  user?: string;
  ip?: string;
}

export enum Page {
  HOME = 'HOME',
  SHOP = 'SHOP',
  FORUM = 'FORUM',
  FORUM_DETAIL = 'FORUM_DETAIL',
  ABOUT = 'ABOUT',
  FACTORY_INTRO = 'FACTORY_INTRO',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  POINTS_MALL = 'POINTS_MALL',
  ORDERS = 'ORDERS',
  CONTACT_US = 'CONTACT_US',
  LOGIN = 'LOGIN',       
  REGISTER = 'REGISTER'
}

