import { supabase } from './supabaseClient';

export interface UserOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateUserOrderPayload {
  items: UserOrderItem[];
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address_json: any;
  shipping_fee: number;
  discount_total: number;
  grand_total: number;
}

const stripUsername = (email?: string | null) => (email ? email.split('@')[0] : '');

export interface UserOrder {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  items_total: number;
  shipping_fee: number;
  discount_total: number;
  grand_total: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  address_json?: any;
  created_at: string;
  expires_at?: string | null;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
    created_at: string;
  }>;
}

const mapOrder = (row: any): UserOrder => ({
  id: row.id,
  order_code: row.order_code,
  status: row.status,
  payment_status: row.payment_status,
  items_total: row.items_total ?? 0,
  shipping_fee: row.shipping_fee ?? 0,
  discount_total: row.discount_total ?? 0,
  grand_total: row.grand_total ?? 0,
  customer_name: row.customer_name ?? stripUsername(row.customer_email),
  customer_phone: row.customer_phone,
  customer_email: stripUsername(row.customer_email),
  address_json: row.address_json,
  created_at: row.created_at,
  expires_at: row.expires_at,
  items: (row.order_items || []).map((i: any) => ({
    id: i.id,
    product_id: i.product_id,
    product_name: i.product_name,
    unit_price: i.unit_price,
    quantity: i.quantity,
    line_total: i.line_total ?? i.unit_price * i.quantity,
    created_at: i.created_at,
  })),
});

export const createUserOrder = async (payload: CreateUserOrderPayload): Promise<UserOrder> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw userError || new Error('请先登录后再提交订单');
  }

  const items_total = payload.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const order_code = `OD-${Date.now()}`;

  // 设置30分钟后过期
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userData.user.id,
      order_code,
      status: 'pending',
      payment_status: 'unpaid',
      items_total,
      shipping_fee: payload.shipping_fee,
      discount_total: payload.discount_total,
      grand_total: payload.grand_total,
      address_json: payload.address_json,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_email: payload.customer_email,
      expires_at: expires_at,
    })
    .select()
    .single();

  if (orderError || !orderRow) {
    throw orderError || new Error('订单创建失败');
  }

  const { error: itemsError, data: itemsData } = await supabase
    .from('order_items')
    .insert(
      payload.items.map(item => ({
        order_id: orderRow.id,
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        line_total: item.unit_price * item.quantity,
      })),
    )
    .select();

  if (itemsError) {
    throw itemsError;
  }

  return mapOrder({ ...orderRow, order_items: itemsData || [] });
};

export const getUserOrders = async (): Promise<UserOrder[]> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError || new Error('请先登录');

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 调试日志：查看返回的数据结构
  if (data && data.length > 0) {
    console.log('[getUserOrders] Raw order data:', data[0]);
    console.log('[getUserOrders] expires_at field:', data[0].expires_at);
  }

  return (data || []).map(mapOrder);
};

export const getUserOrder = async (orderId: string): Promise<UserOrder> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError || new Error('请先登录');

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userData.user.id)
    .eq('id', orderId)
    .single();

  if (error || !data) throw error || new Error('未找到订单');
  return mapOrder(data);
};
