# 🎥 SecureCam - متجر كاميرات المراقبة

متجر إلكتروني متكامل لبيع كاميرات المراقبة وأنظمة الأمان مع لوحة تحكم إدارية كاملة.

![Next.js](https://img.shields.io/badge/Next.js-16.2.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)

---

## 📋 جدول المحتويات

- [المتطلبات](#-المتطلبات)
- [التثبيت](#-التثبيت)
- [التشغيل](#-التشغيل)
- [بيانات الدخول](#-بيانات-الدخول)
- [المميزات](#-المميزات)
- [هيكل المشروع](#-هيكل-المشروع)
- [API endpoints](#-api-endpoints)
- [الإنتاج](#-الإنتاج)

---

## 💻 المتطلبات

### يجب تثبيتها:

| البرنامج | الإصدار | رابط التحميل |
|----------|---------|--------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Bun | أحدث | [bun.sh](https://bun.sh/) |

### تثبيت Bun على Windows:

```powershell
# باستخدام PowerShell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### تثبيت Bun على Mac/Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## 🚀 التثبيت

### 1️⃣ استنساخ المشروع

```bash
# من GitHub
git clone https://github.com/your-username/securecam.git
cd securecam

# أو فك الضغط من ملف ZIP
unzip securecam.zip
cd securecam
```

### 2️⃣ تثبيت الحزم

```bash
bun install
```

### 3️⃣ إنشاء ملف `.env`

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# ===========================================
# DATABASE
# ===========================================
DATABASE_URL="file:./db/custom.db"

# ===========================================
# AUTHENTICATION
# ===========================================
NEXTAUTH_SECRET=securevision-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# ===========================================
# PAYMOB PAYMENT (اختياري)
# ===========================================
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret
PAYMOB_CARD_INTEGRATION_ID=your-card-integration-id
PAYMOB_MODE=test

# ===========================================
# CLOUDINARY (اختياري)
# ===========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ===========================================
# EMAIL (اختياري)
# ===========================================
RESEND_API_KEY=re_your-api-key

# ===========================================
# SITE
# ===========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=SecureCam
NODE_ENV=development
```

### 4️⃣ إنشاء قاعدة البيانات

```bash
bun run db:push
```

---

## 🏃 التشغيل

### تشغيل السيرفر

```bash
bun run dev
```

### فتح المتصفح

```
http://localhost:3000
```

---

## 🔐 بيانات الدخول

### الأدمن (لوحة التحكم)

| البيان | القيمة |
|--------|--------|
| **الرابط** | `http://localhost:3000` ثم اضغط على Admin |
| **البريد** | `admin@securecam.com` |
| **كلمة المرور** | `admin123` |

### إنشاء أدمن جديد

```bash
# من خلال API
POST http://localhost:3000/api/auth/register
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123"
}

# ثم تغيير الدور من قاعدة البيانات إلى "admin"
```

---

## ✨ المميزات

### 🛒 واجهة المستخدم

| الميزة | الوصف |
|--------|-------|
| الصفحة الرئيسية | بانر، فئات، منتجات مميزة، عروض |
| المتجر | فلترة متقدمة (دقة، رؤية ليلية، ميزات) |
| تفاصيل المنتج | معرض صور، مواصفات، تقييمات |
| السلة | إضافة، تعديل، حذف |
| الدفع | نموذج شحن، اختيار طريقة الدفع |
| لوحة المستخدم | طلباتي، عناويني، قائمة الأمنيات |
| تتبع الطلب | البحث برقم الطلب أو الهاتف |

### 📊 لوحة التحكم

| القسم | المميزات |
|-------|----------|
| Dashboard | إحصائيات، رسوم بيانية، تنبيهات |
| Products | إضافة/تعديل/حذف، رفع صور |
| Brands | إدارة البراندات |
| Orders | قائمة الطلبات، تحديث الحالة |
| Customers | قائمة العملاء، تفاصيل |
| Inventory | مستويات المخزون، تنبيهات |
| Coupons | إنشاء/تعديل/حذف الكوبونات |
| Shipping | مناطق الشحن، الأسعار |
| Payment Methods | Paymob، COD، محافظ إلكترونية |
| Reports | تقارير المبيعات، الرسوم البيانية |
| Reviews | إدارة التقييمات، الردود |
| Users | إدارة المستخدمين والصلاحيات |
| Settings | إعدادات المتجر |
| Audit Log | سجل العمليات |

---

## 📁 هيكل المشروع

```
securecam/
├── 📁 prisma/
│   ├── schema.prisma          # هيكل قاعدة البيانات
│   └── migrations/            # الترحيلات
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 api/            # API endpoints
│   │   │   ├── 📁 auth/       # تسجيل الدخول/الخروج
│   │   │   ├── 📁 products/   # المنتجات
│   │   │   ├── 📁 orders/     # الطلبات
│   │   │   ├── 📁 users/      # المستخدمين
│   │   │   ├── 📁 categories/ # الفئات
│   │   │   ├── 📁 brands/     # البراندات
│   │   │   ├── 📁 coupons/    # الكوبونات
│   │   │   ├── 📁 shipping/   # الشحن
│   │   │   ├── 📁 reviews/    # التقييمات
│   │   │   ├── 📁 settings/   # الإعدادات
│   │   │   ├── 📁 upload/     # رفع الصور
│   │   │   └── 📁 admin/      # إحصائيات الأدمن
│   │   │
│   │   ├── layout.tsx         # التخطيط الرئيسي
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   └── globals.css        # الأنماط العامة
│   │
│   ├── 📁 components/
│   │   ├── 📁 admin/          # مكونات لوحة التحكم
│   │   ├── 📁 auth/           # مكونات المصادقة
│   │   ├── 📁 cart/           # مكونات السلة
│   │   ├── 📁 home/           # مكونات الصفحة الرئيسية
│   │   ├── 📁 layout/         # الهيدر والفوتر
│   │   ├── 📁 products/       # مكونات المنتجات
│   │   ├── 📁 shared/         # مكونات مشتركة
│   │   └── 📁 ui/             # مكونات shadcn/ui
│   │
│   ├── 📁 lib/
│   │   ├── db.ts              # اتصال Prisma
│   │   ├── auth.ts            # المصادقة
│   │   ├── auth-middleware.ts # حماية API
│   │   ├── rate-limit.ts      # تحديد الطلبات
│   │   └── validations.ts     # التحقق من البيانات
│   │
│   ├── 📁 hooks/              # React hooks
│   ├── 📁 store/              # Zustand state
│   └── 📁 types/              # TypeScript types
│
├── 📁 db/
│   └── custom.db              # قاعدة البيانات SQLite
│
├── .env                       # متغيرات البيئة
├── package.json               # الحزم
├── tailwind.config.ts         # إعدادات Tailwind
└── tsconfig.json              # إعدادات TypeScript
```

---

## 🔌 API Endpoints

### المصادقة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/register` | إنشاء حساب |

### المنتجات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/products` | قائمة المنتجات |
| GET | `/api/products/[id]` | تفاصيل منتج |
| POST | `/api/products` | إنشاء منتج (أدمن) |
| PATCH | `/api/products/[id]` | تعديل منتج (أدمن) |
| DELETE | `/api/products/[id]` | حذف منتج (أدمن) |

### الطلبات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/orders` | قائمة الطلبات |
| GET | `/api/orders/[id]` | تفاصيل طلب |
| POST | `/api/orders` | إنشاء طلب |
| PATCH | `/api/orders/[id]` | تحديث طلب |
| GET | `/api/orders/track` | تتبع طلب |

### البراندات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/brands` | قائمة البراندات |
| POST | `/api/brands` | إنشاء براند |
| PATCH | `/api/brands` | تعديل براند |
| DELETE | `/api/brands` | حذف براند |

### الفئات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/categories` | قائمة الفئات |
| POST | `/api/categories` | إنشاء فئة (أدمن) |

### الكوبونات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/coupons` | قائمة الكوبونات |
| POST | `/api/coupons` | إنشاء كوبون |
| POST | `/api/coupons/validate` | التحقق من كوبون |

### المستخدمين

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/users` | قائمة المستخدمين (أدمن) |
| PATCH | `/api/users` | تعديل مستخدم |

### رفع الصور

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/upload` | رفع صورة |
| DELETE | `/api/upload` | حذف صورة |

---

## 🌐 الإنتاج

### 1️⃣ إعداد قاعدة البيانات (PostgreSQL)

```env
DATABASE_URL="postgresql://user:password@host:5432/securecam?schema=public"
```

### 2️⃣ تغيير المتغيرات

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-very-secure-secret-key
PAYMOB_MODE=live
NEXT_PUBLIC_DEMO_MODE=false
```

### 3️⃣ البناء

```bash
bun run build
```

### 4️⃣ التشغيل

```bash
bun run start
```

---

## 🛠️ الأوامر المتاحة

| الأمر | الوصف |
|-------|-------|
| `bun install` | تثبيت الحزم |
| `bun run dev` | تشغيل التطوير |
| `bun run build` | بناء الإنتاج |
| `bun run start` | تشغيل الإنتاج |
| `bun run lint` | فحص الكود |
| `bun run db:push` | إنشاء/تحديث قاعدة البيانات |
| `bun run db:studio` | فتح Prisma Studio |

---

## 📞 الدعم

- **البريد**: support@securecam.com
- **الهاتف**: +20-100-123-4567

---

## 📄 الرخصة

MIT License - يمكنك استخدامه بحرية.

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Paymob](https://paymob.com/)

---

<div align="center">

**صنع بـ ❤️ للمستخدمين العرب**

</div>
