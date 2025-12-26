ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Tea Talk Jiuhua',
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS usage_method TEXT,
ADD COLUMN IF NOT EXISTS core_ingredients TEXT[],
ADD COLUMN IF NOT EXISTS suitable_for TEXT[],
ADD COLUMN IF NOT EXISTS specifications TEXT[];

INSERT INTO public.products (name, price, image_url, description, category, stock, brand, is_active)
VALUES (
  'Product001',
  1980.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/huangjing-gift-box-premium.jpg',
  '国精集团旗舰礼盒',
  'tea',
  999,
  'Tea Talk Jiuhua',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, brand, is_active)
VALUES (
  'Product002',
  1288.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuhua-premium-tea.jpg',
  '甄选九华山深山黄精',
  'tea',
  999,
  'Tea Talk Jiuhua',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, brand, is_active)
VALUES (
  'Product003',
  368.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/yemu-slices.jpg',
  '采用5年以上野生黄精',
  'fruit',
  999,
  'Yemu Huaxian',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, brand, is_active)
VALUES (
  'Product004',
  198.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/sesame-pills.jpg',
  '传统配方黄精芝麻丸',
  'fruit',
  999,
  'Yemu Huaxian',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, brand, is_active)
VALUES (
  'Product005',
  2888.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/premium-gift-set.jpg',
  '高端商务伴手礼',
  'tea',
  999,
  'Tea Talk Jiuhua',
  true
);
