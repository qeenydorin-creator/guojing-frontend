ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'Tea Talk Jiuhua',
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS usage_method TEXT,
ADD COLUMN IF NOT EXISTS core_ingredients TEXT[],
ADD COLUMN IF NOT EXISTS suitable_for TEXT[],
ADD COLUMN IF NOT EXISTS specifications TEXT[];

INSERT INTO public.products (name, price, image_url, description, category, stock, features, usage_method, core_ingredients, suitable_for, specifications, brand, is_active)
VALUES (
  'Product001',
  1980.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/huangjing-gift-box-premium.jpg',
  '国精集团旗舰礼盒，黑金配色，低调奢华。内含九蒸九晒黄精茶200g，采用九华山道地黄精，历经45天古法炮制。补中益气，滋阴润肺。',
  'tea',
  999,
  ARRAY['补中益气，滋阴润肺', '增强免疫，改善疲劳', '抗氧化美容养颜', '调节血糖血脂'],
  '取3-5克黄精茶，用90-95℃热水冲泡，焖5-8分钟后饮用。可与枸杞、红枣搭配，建议早晚各一次。',
  ARRAY['黄精多糖 ≥25%', '皂苷类成分', '氨基酸', '微量元素'],
  ARRAY['商务送礼', '孝敬长辈', '养生保健', '改善亚健康'],
  ARRAY['200g 高档礼盒', '400g 臻品礼盒'],
  'Tea Talk Jiuhua',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, features, usage_method, core_ingredients, suitable_for, specifications, brand, is_active)
VALUES (
  'Product002',
  1288.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/jiuhua-premium-tea.jpg',
  '甄选九华山深山黄精，九蒸九晒古法炮制，茶汤红亮，口感醇厚，回甘悠长。采自海拔800米以上野生黄精，富含黄精多糖。',
  'tea',
  999,
  ARRAY['九蒸九晒古法工艺', '补气养阴，健脾润肺', '汤色如琥珀，入口顺滑', '适合亚健康人群'],
  '取3-5克黄精茶，用90-95℃热水冲泡，焖5-8分钟后饮用。第一泡醒茶，第二泡开始品味其独特的焦糖香气。',
  ARRAY['黄精多糖 ≥25%', '皂苷类成分', '氨基酸', '维生素B族', '微量元素'],
  ARRAY['长期熬夜人群', '亚健康调理', '免疫力低下', '需要滋补养生'],
  ARRAY['150g 礼盒装', '300g 家庭装'],
  'Tea Talk Jiuhua',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, features, usage_method, core_ingredients, suitable_for, specifications, brand, is_active)
VALUES (
  'Product003',
  368.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/yemu-slices.jpg',
  '采用5年以上野生黄精，切片均匀，断面角质样，直接泡水或煲汤，滋补首选。精选肉质肥厚的根茎，手工切片。',
  'supplement',
  999,
  ARRAY['5年以上野生黄精', '手工切片，品质保证', '断面角质状，油润光泽', '保留原始营养成分'],
  '每次取3-5片，可直接用保温杯闷泡，或用于炖鸡、煲排骨汤。建议煲汤时加入10-15片，炖煮1-2小时。',
  ARRAY['黄精多糖', '皂苷类成分', '氨基酸', '多种维生素'],
  ARRAY['煲汤滋补', '泡水养生', '炖品配料', '日常保健'],
  ARRAY['250g 罐装', '500g 袋装'],
  'Yemu Huaxian',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, features, usage_method, core_ingredients, suitable_for, specifications, brand, is_active)
VALUES (
  'Product004',
  198.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/sesame-pills.jpg',
  '传统配方，黑芝麻与黄精的完美融合，以黑养黑，焕发活力，无糖添加。采用九蒸九晒黑芝麻与黄精细粉科学配比。',
  'supplement',
  999,
  ARRAY['黑芝麻与黄精双重滋补', '无蔗糖添加，健康无负担', '口感软糯，芝麻香浓郁', '以黑补肾，以黄补脾'],
  '每日1-2丸，建议早晚各一次，温水送服或直接嚼食。可搭配牛奶或豆浆食用，效果更佳。',
  ARRAY['九蒸九晒黑芝麻', '黄精细粉', '天然蜂蜜', '核桃仁'],
  ARRAY['需要补肾养发', '脾胃虚弱人群', '气血不足', '美容养颜'],
  ARRAY['100g (10丸)', '300g (30丸)'],
  'Yemu Huaxian',
  true
);

INSERT INTO public.products (name, price, image_url, description, category, stock, features, usage_method, core_ingredients, suitable_for, specifications, brand, is_active)
VALUES (
  'Product005',
  2888.00,
  'https://zzxkoyzhbdoefsttitop.supabase.co/storage/v1/object/public/products/premium-gift-set.jpg',
  '高端商务伴手礼，包含特级黄精茶与珍藏版原果，尽显尊贵。国精集团年度旗舰礼盒，黑金配色，低调奢华。',
  'gift',
  999,
  ARRAY['国精集团年度旗舰礼盒', '特级九制黄精茶200g', '十年陈黄精原果100g', '手工黄精丸一盒'],
  '礼盒内含多种产品，各产品使用方法请参考单品说明。建议作为高端商务礼品或孝敬长辈使用。',
  ARRAY['特级黄精茶', '十年陈黄精原果', '手工黄精丸', '配套茶具'],
  ARRAY['商务馈赠', '孝敬长辈', '高端送礼', '收藏珍品'],
  ARRAY['至尊礼盒 (茶+果+丸)'],
  'Tea Talk Jiuhua',
  true
);
