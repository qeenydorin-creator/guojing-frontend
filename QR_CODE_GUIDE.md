# 二维码生成指南 - 国精集团

## 📱 目标
生成二维码，用户扫描后直接打开你的网站看视频

---

## 方案对比

### 方案 1: 在线生成二维码（最简单，推荐）⭐⭐⭐
**无需编程，3 分钟完成**

#### 步骤 1：准备你的网站 URL

根据你想让用户看什么内容，选择对应的 URL：

**选项 A：直接到九蒸九晒工艺页面（有视频）**
```
https://www.gij666.com/factory-intro
```
或
```
https://guojing-frontend.vercel.app/factory-intro
```

**选项 B：到首页（用户自己导航找视频）**
```
https://www.gij666.com/
```

**选项 C：添加锚点直接滚动到视频**
```
https://www.gij666.com/#video-section
```

#### 步骤 2：使用免费在线工具生成二维码

**推荐工具**：
1. [QR Code Generator](https://www.qr-code-generator.com/) - 最流行
2. [二维码生成器](https://cli.im/) - 支持中文
3. [微信二维码生成](https://qr.weixin.qq.com/) - 官方工具
4. [草料二维码](https://www.qr.cn/) - 中文友好

**生成步骤**（以 QR Code Generator 为例）：

1. 访问：https://www.qr-code-generator.com/
2. 在 URL 输入框中粘贴你的网站链接
3. 点击 "Generate"
4. 调整尺寸和颜色（可选）
5. 点击 "Download" 下载二维码
6. 得到 PNG/SVG 文件

#### 优点：
- ✅ 完全免费
- ✅ 无需编程
- ✅ 3 分钟完成
- ✅ 自动生成高质量图片
- ✅ 支持自定义颜色和 Logo
- ✅ 可追踪扫描次数（付费版）

#### 缺点：
- ❌ 不能自定义过多细节

---

### 方案 2：前端集成二维码组件（中等难度）⭐⭐
**让用户在你的网站上生成二维码**

#### 使用库：`qrcode.react`

**安装**：
```bash
npm install qrcode.react
```

**创建组件** `src/components/QRCodeGenerator.tsx`：
```typescript
import React from 'react';
import QRCode from 'qrcode.react';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  size?: number;
}

export default function QRCodeGenerator({
  url,
  title = '扫描二维码查看视频',
  size = 256
}: QRCodeGeneratorProps) {
  const qrRef = React.useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `guojing-qrcode-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white border border-gj-border rounded-xl shadow-md">
      <h3 className="text-lg font-bold text-gj-dark">{title}</h3>

      <div ref={qrRef} className="p-4 bg-white border-4 border-gj-dark rounded-lg">
        <QRCode
          value={url}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#1a1a1a"
          bgColor="#ffffff"
        />
      </div>

      <p className="text-sm text-gj-light-text text-center max-w-xs">
        使用手机扫描二维码，即可查看我们的工艺视频和产品详情
      </p>

      <button
        onClick={downloadQRCode}
        className="flex items-center gap-2 px-4 py-2 bg-gj-dark text-white rounded-lg hover:bg-gj-green transition-colors"
      >
        <Download size={18} />
        下载二维码
      </button>

      <div className="text-xs text-gj-light-text text-center">
        链接：{url}
      </div>
    </div>
  );
}
```

**在页面中使用**：
```typescript
<QRCodeGenerator
  url="https://www.gij666.com/factory-intro"
  title="扫描查看九蒸九晒工艺视频"
  size={300}
/>
```

#### 优点：
- ✅ 可集成到网站内
- ✅ 用户可直接下载
- ✅ 可自定义样式
- ✅ 实时生成

#### 缺点：
- ❌ 需要编程
- ❌ 需要安装额外库

---

### 方案 3：动态二维码（高级）⭐⭐⭐
**可追踪、可编辑、有短链接**

**使用服务**：
- [TinyURL](https://tinyurl.com/) - 短链接
- [Bit.ly](https://bitly.com/) - 带统计功能
- [短链](https://duanl.ink/) - 中文短链服务

**步骤**：
1. 创建短链接：`https://bit.ly/guojing-video`
2. 用短链接生成二维码
3. 可以随时修改短链接指向的目标 URL
4. 查看扫描统计数据

#### 优点：
- ✅ 可追踪用户来源
- ✅ 可修改目标链接
- ✅ 链接短，易分享
- ✅ 有详细统计

#### 缺点：
- ❌ 依赖第三方服务
- ❌ 服务可能停止
- ❌ 有扫描限制

---

## 🎯 推荐方案

**我建议你使用方案 1 + 方案 3 的组合**：

1. **方案 1**（在线生成）- 生成高质量二维码
   - 用于印刷、海报、名片
   - 一次生成，永久可用

2. **方案 3**（短链接）- 用于线上分享
   - 用于微信、社交媒体
   - 可追踪扫描数据

---

## 📋 具体操作步骤

### 第 1 步：获取你的网站地址

**检查你的域名**：
```
选项 A（自己的域名）：https://www.gij666.com
选项 B（Vercel 域名）：https://guojing-frontend.vercel.app
```

如果是选项 B，建议指向具体页面：
```
https://guojing-frontend.vercel.app/factory-intro
```

### 第 2 步：使用在线工具生成二维码

**推荐**：[QR Code Generator](https://www.qr-code-generator.com/)

1. 打开网址：https://www.qr-code-generator.com/
2. 在 "URL" 框中粘贴：`https://www.gij666.com/factory-intro`
3. 点击 "Generate QR Code"
4. 看到二维码后，可以调整：
   - **Size**: 设置为 300-400px（更大更容易扫）
   - **Color**: 保留黑白或改为品牌色
   - **Design**: 可添加 Logo
5. 点击 "Download PNG" 下载
6. 保存文件为 `guojing-qrcode.png`

### 第 3 步：验证二维码

用手机扫描刚生成的二维码，确保能正确打开你的网站。

### 第 4 步：使用二维码

**使用场景**：
- 📱 微信公众号、朋友圈
- 🎁 产品包装、礼盒
- 📄 宣传册、海报
- 📧 邮件签名
- 🏪 线下店铺
- 🎫 活动门票

---

## 🎨 美化二维码的建议

### 颜色搭配（品牌色）
```
背景色：#FFFFFF（白色）
前景色：#2F5233（国精绿色）
```

### 添加 Logo
在 QR Code Generator 的高级选项中：
1. 上传你的品牌 Logo
2. 调整 Logo 大小（不超过 20%）
3. 确保二维码仍可扫描

### 尺寸建议
```
打印版：300mm × 300mm（高质量）
线上版：1000px × 1000px（清晰）
小型应用：200px × 200px（最小）
```

---

## 🔗 短链接生成（可选）

**使用 Bit.ly 创建短链接**：

1. 访问：https://bitly.com/
2. 登录或注册
3. 在 "Shorten a Link" 框中粘贴：
   ```
   https://www.gij666.com/factory-intro
   ```
4. 点击 "Shorten"
5. 得到短链接，例如：
   ```
   https://bit.ly/guojing-video
   ```
6. 用短链接生成新的二维码
7. 在 Bit.ly Dashboard 可以看到扫描统计

---

## 📊 扫描数据追踪

使用 Bit.ly 的付费版本可以看到：
- ✅ 每天扫描次数
- ✅ 用户来源（iOS/Android/PC）
- ✅ 地理位置统计
- ✅ 浏览时间分布

**免费版本** 也能看到基本统计数据。

---

## 💡 最简单的方案（3 分钟）

1. 打开：https://cli.im/
2. 输入：`https://www.gij666.com`
3. 点击"生成二维码"
4. 右键下载
5. 完成！

---

## 📱 测试二维码

**方法 1：用手机相机**
- iPhone：直接用相机 App 对准二维码
- Android：用相机 App 或 Google Lens

**方法 2：用微信**
- 打开微信 → 扫一扫 → 对准二维码

**方法 3：用在线工具**
- 访问：https://www.qr-code-generator.com/
- 上传你的二维码图片验证

---

## 🚀 下一步建议

1. **立即**：用在线工具生成二维码（方案 1）
2. **可选**：创建短链接并生成新二维码（方案 3）
3. **未来**：在网站上集成二维码生成器（方案 2）

---

## ❓ 常见问题

**Q: 生成的二维码永久有效吗？**
A: 是的，二维码本身永久有效。使用短链接的话，需要保证服务商还运营。

**Q: 二维码可以被复制/盗用吗？**
A: 可以，任何人都可以保存和使用。但通常只会指向你的网站，不会造成问题。

**Q: 二维码分辨率不清晰怎么办？**
A: 增大尺寸或重新生成更高分辨率版本（300px 以上）。

**Q: 我想统计谁扫描了二维码怎么办？**
A: 使用方案 3（短链接服务），如 Bit.ly、TinyURL 等。

**Q: 二维码可以有颜色吗？**
A: 可以，但要确保对比度足够（通常黑底白字最容易扫）。

---

**现在选择一个方案，我可以帮你进行下一步！**
