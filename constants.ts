import { Product, PointsProduct, ForumPost, UserProfile, Order, Region } from './types';

// Images updated with stable, cinematic, realistic Unsplash URLs.
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '九华黄精茶·尊享版',
    description: '甄选九华山深山黄精，九蒸九晒古法炮制，茶汤红亮，口感醇厚，回甘悠长。',
    price: 1288,
    category: 'tea',
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800', 
    brand: 'Tea Talk Jiuhua',
    specs: ['150g 礼盒装', '300g 家庭装'],
    details: '采自九华山海拔800米以上野生黄精，历经九次蒸煮、九次晾晒，耗时45天炮制而成。富含黄精多糖，汤色如琥珀，入口顺滑，具有补气养阴、健脾润肺之功效。适合长期熬夜、亚健康人群日常饮用。'
  },
  {
    id: '2',
    name: '叶木花仙·黄精切片',
    description: '采用5年以上野生黄精，切片均匀，断面角质样，直接泡水或煲汤，滋补首选。',
    price: 368,
    category: 'supplement',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    brand: 'Yemu Huaxian',
    specs: ['250g 罐装', '500g 袋装'],
    details: '精选肉质肥厚的根茎，手工切片。断面呈角质状，油润光泽。保留了黄精最原始的营养成分，适合炖鸡、煲排骨汤或直接保温杯闷泡。'
  },
  {
    id: '3',
    name: '古法黄精芝麻丸',
    description: '传统配方，黑芝麻与黄精的完美融合，以黑养黑，焕发活力，无糖添加。',
    price: 198,
    category: 'supplement',
    imageUrl: 'https://images.unsplash.com/photo-1577979749830-f1d742b96791?auto=format&fit=crop&q=80&w=800',
    brand: 'Yemu Huaxian',
    specs: ['100g (10丸)', '300g (30丸)'],
    details: '采用九蒸九晒黑芝麻与黄精细粉科学配比，加入天然蜂蜜调和。口感软糯，芝麻香浓郁。以黑补肾，以黄补脾，双重滋补。无蔗糖添加，健康无负担。'
  },
  {
    id: '4',
    name: '国精礼盒·传世臻品',
    description: '高端商务伴手礼，包含特级黄精茶与珍藏版原果，尽显尊贵。',
    price: 2888,
    category: 'gift',
    imageUrl: 'https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&q=80&w=800',
    brand: 'Tea Talk Jiuhua',
    specs: ['至尊礼盒 (茶+果+丸)'],
    details: '国精集团年度旗舰礼盒。内含特级九制黄精茶200g，十年陈黄精原果100g，以及手工黄精丸一盒。包装采用黑金配色，低调奢华，是商务馈赠、孝敬长辈的不二之选。'
  }
];

export const MOCK_POINTS_PRODUCTS: PointsProduct[] = [
  {
    id: 'p1',
    name: '黄精体验装 (50g)',
    description: '新客专享，感受九蒸九晒的独特魅力。',
    price: 0,
    pointsPrice: 500,
    category: 'supplement',
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-6f83b68e3c78?auto=format&fit=crop&q=80&w=600',
    brand: 'Yemu Huaxian',
    specs: ['50g 体验包'],
    details: '小规格体验装，适合初次尝试黄精口感的用户。'
  },
  {
    id: 'p2',
    name: '定制紫砂茶宠',
    description: '国精集团专属定制，茶桌上的风雅小物。',
    price: 0,
    pointsPrice: 1200,
    category: 'gift',
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=600',
    brand: 'Tea Talk Jiuhua',
    specs: ['单个装'],
    details: '名家手作紫砂茶宠，造型古朴，寓意吉祥。'
  }
];

export const MOCK_POSTS: ForumPost[] = [
  {
    id: '101',
    author: '养生达人李医师',
    title: '深度解析：为什么《中国药典》将黄精列为上品？',
    content: '黄精性味甘平，归脾、肺、肾经。《本草纲目》记载其“久服轻身延年不饥”。现代药理研究表明，黄精多糖具有增强免疫力、抗衰老、降血糖等作用。对于现代都市人常见的亚健康状态，黄精是极佳的调理食材。',
    likes: 342,
    date: '2023-10-24',
    tags: ['科普', '药典'],
    comments: [
      { id: 'c1', author: '张三', content: '李医生讲得太好了，涨知识！', date: '2023-10-25' },
      { id: 'c2', author: '李四', content: '请问高血压患者适合吃吗？', date: '2023-10-25' }
    ]
  },
  {
    id: '102',
    author: '九华山行者',
    title: '探访叶木花仙工厂：九蒸九晒的坚持',
    content: '亲眼见证了国精集团的生产线，每一道工序都严格遵循古法。从清洗、润制到九次蒸煮、九次晾晒，每一次循环都是对品质的升华。这种对传统的坚守，在快节奏的今天尤为珍贵。',
    likes: 189,
    date: '2023-10-28',
    tags: ['探厂', '文化'],
    comments: []
  },
  {
    id: '103',
    author: '茶道静心',
    title: '黄精茶的正确冲泡方法，你做对了吗？',
    content: '水温建议95度以上，第一泡醒茶，第二泡开始品味其独特的焦糖香气。建议使用紫砂壶或白瓷盖碗，更能激发茶性。',
    likes: 88,
    date: '2023-11-01',
    tags: ['茶艺', '教程'],
    comments: []
  }
];

// Added mock passwords for testing. In production, these should be hashed.
export const MOCK_USERS: UserProfile[] = [
  { id: '00000000-0000-0000-0000-000000000001', username: 'Taoist_Zhang', password: 'password123', role: 'vip', points: 880, points_balance: 880, registrationDate: '2023-01-15', status: 'active' },
  { id: '00000000-0000-0000-0000-000000000002', username: 'TeaLover99', password: 'password123', role: 'user', points: 120, points_balance: 120, registrationDate: '2023-05-20', status: 'active' },
  { id: '00000000-0000-0000-0000-000000000003', username: 'SpamBot_X', password: 'password123', role: 'user', points: 0, points_balance: 0, registrationDate: '2023-10-10', status: 'banned' },
  // Default Admin User
  { id: '00000000-0000-0000-0000-000000000000', username: 'admin', password: 'admin888', role: 'admin', points: 9999, points_balance: 9999, registrationDate: '2022-01-01', status: 'active' }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20231025-001',
    userId: '00000000-0000-0000-0000-000000000001',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1 }
    ],
    totalAmount: 1288,
    status: 'completed',
    createdAt: '2023-10-25T14:30:00.000Z',
    shippingAddress: {
      name: 'Taoist Zhang',
      phone: '13812345678',
      province: '安徽省',
      city: '池州市',
      district: '青阳县',
      detail: '九华山风景区国精VIP接待中心'
    }
  },
  {
    id: 'ORD-20231105-089',
    userId: '00000000-0000-0000-0000-000000000001',
    items: [
      { ...MOCK_PRODUCTS[2], quantity: 2 }
    ],
    totalAmount: 396,
    status: 'shipped',
    createdAt: '2023-11-05T09:15:00.000Z',
    shippingAddress: {
        name: 'Taoist Zhang',
        phone: '13812345678',
        province: '浙江省',
        city: '杭州市',
        district: '西湖区',
        detail: '龙井路88号'
      }
  }
];

// --- Administrative Division Data (GB/T 2260 Mock) ---
export const CHINA_REGIONS: Region[] = [
  {
    code: '110000',
    name: '北京市',
    children: [
      {
        code: '110100',
        name: '北京市',
        children: [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110108', name: '海淀区' }
        ]
      }
    ]
  },
  {
    code: '330000',
    name: '浙江省',
    children: [
      {
        code: '330100',
        name: '杭州市',
        children: [
          { code: '330102', name: '上城区' },
          { code: '330106', name: '西湖区' },
          { code: '330108', name: '滨江区' },
          { code: '330110', name: '余杭区' }
        ]
      },
      {
        code: '330200',
        name: '宁波市',
        children: [
          { code: '330203', name: '海曙区' },
          { code: '330205', name: '江北区' },
          { code: '330212', name: '鄞州区' }
        ]
      }
    ]
  },
  {
    code: '340000',
    name: '安徽省',
    children: [
      {
        code: '340100',
        name: '合肥市',
        children: [
          { code: '340102', name: '瑶海区' },
          { code: '340103', name: '庐阳区' },
          { code: '340104', name: '蜀山区' },
          { code: '340111', name: '包河区' }
        ]
      },
      {
        code: '341700',
        name: '池州市',
        children: [
          { code: '341702', name: '贵池区' },
          { code: '341721', name: '东至县' },
          { code: '341722', name: '石台县' },
          { code: '341723', name: '青阳县' } // Home of Jiuhua Mountain
        ]
      }
    ]
  }
];