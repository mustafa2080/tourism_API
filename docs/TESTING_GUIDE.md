# 📋 دليل اختبار Storck Tours API باستخدام Postman

## 🚀 قبل البداية

### 1. تشغيل السيرفر
```bash
cd backend
npm run dev
```

### 2. استيراد الـ Collection في Postman
1. افتح Postman
2. اضغط على **Import**
3. اسحب ملف `docs/Storck_Tours_API.postman_collection.json`
4. ستجد Collection جديدة باسم "Storck Tours API"

---

## 📝 خطوات الاختبار

### الخطوة 1: اختبار Health Check ✅
- **Request:** `GET /api/v1/health`
- **Expected:** Status 200 مع `"status": "healthy"` و `"database": "connected"`

```
📍 1. Health & Metadata → 1.1 Health Check
```

---

### الخطوة 2: تسجيل مستخدم جديد 👤
- **Request:** `POST /api/v1/auth/register`
- **Body:**
```json
{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "Password123",
    "phone": "+1234567890"
}
```
- **Expected:** Status 201 مع بيانات المستخدم و accessToken
- **ملاحظة:** الـ test script سيحفظ الـ token تلقائياً

```
📍 2. Authentication → 2.1 Register User
```

---

### الخطوة 3: تسجيل أدمن 👑
- **Request:** `POST /api/v1/auth/register`
- **Body:**
```json
{
    "name": "Admin User",
    "email": "admin@storcktours.com",
    "password": "Admin123!"
}
```

⚠️ **مهم:** بعد التسجيل، لازم تغير الـ role لـ ADMIN في قاعدة البيانات:

**باستخدام Prisma Studio:**
```bash
npx prisma studio
```
ثم افتح جدول `users` وغير `role` من `USER` إلى `ADMIN`

**أو باستخدام SQL:**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@storcktours.com';
```

```
📍 2. Authentication → 2.2 Register Admin
```

---

### الخطوة 4: تسجيل الدخول كأدمن 🔐
- **Request:** `POST /api/v1/auth/login`
- **Body:**
```json
{
    "email": "admin@storcktours.com",
    "password": "Admin123!"
}
```
- **Expected:** Status 200 مع accessToken جديد

```
📍 2. Authentication → 2.3 Login
```

---

### الخطوة 5: إنشاء رحلة جديدة 🌍
- **Request:** `POST /api/v1/trips`
- **Headers:** `Authorization: Bearer {{accessToken}}`
- **Body:**
```json
{
    "title": "Egyptian Pyramids Adventure",
    "description": "Experience the wonders of ancient Egypt...",
    "price": 1299.99,
    "currency": "USD",
    "durationDays": 7,
    "destinations": ["Cairo", "Luxor", "Aswan"],
    "tags": ["adventure", "history"],
    "totalSeats": 20
}
```
- **Expected:** Status 201 مع بيانات الرحلة
- **ملاحظة:** الـ tripId سيتحفظ تلقائياً

```
📍 4. Trips (Admin) → 4.1 Create Trip
```

---

### الخطوة 6: نشر الرحلة 📢
- **Request:** `POST /api/v1/trips/{{tripId}}/publish`
- **Expected:** Status 200 مع `"status": "PUBLISHED"`

```
📍 4. Trips (Admin) → 4.2 Publish Trip
```

---

### الخطوة 7: إضافة صورة للرحلة 🖼️
- **Request:** `POST /api/v1/trips/{{tripId}}/images`
- **Body:**
```json
{
    "url": "https://example.com/images/pyramids.jpg",
    "altText": "Great Pyramids of Giza",
    "order": 0
}
```

```
📍 4. Trips (Admin) → 4.4 Add Trip Image
```

---

### الخطوة 8: عرض الرحلات (Public) 🔍
- **Request:** `GET /api/v1/trips`
- **Expected:** قائمة الرحلات المنشورة

```
📍 5. Trips (Public) → 5.1 List All Trips
```

---

### الخطوة 9: البحث عن رحلات 🔎
- **Request:** `GET /api/v1/search?q=egypt&priceMax=2000`
- **Expected:** الرحلات المطابقة للبحث

```
📍 5. Trips (Public) → 5.2 Search Trips
```

---

### الخطوة 10: إنشاء حجز 🎫
- **Request:** `POST /api/v1/trips/{{tripId}}/bookings`
- **Body:**
```json
{
    "passengers": [
        {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890"
        }
    ],
    "bookingDate": "2025-03-01T00:00:00Z"
}
```
- **Expected:** Status 201 مع bookingReference

```
📍 6. Bookings → 6.1 Create Booking
```

---

### الخطوة 11: تأكيد الحجز (Admin) ✅
- **Request:** `POST /api/v1/bookings/{{bookingId}}/confirm`
- **Expected:** Status 200 مع `"status": "CONFIRMED"`

```
📍 6. Bookings → 6.5 Confirm Booking (Admin)
```

---

### الخطوة 12: إضافة تقييم ⭐
- **Request:** `POST /api/v1/trips/{{tripId}}/reviews`
- **Body:**
```json
{
    "rating": 5,
    "title": "Amazing Experience!",
    "comment": "This was the best trip I've ever taken..."
}
```

```
📍 7. Reviews → 7.1 Create Review
```

---

### الخطوة 13: إضافة للمفضلة ❤️
- **Request:** `POST /api/v1/favorites`
- **Body:**
```json
{
    "tripId": "{{tripId}}"
}
```

```
📍 8. Favorites → 8.1 Add to Favorites
```

---

### الخطوة 14: Dashboard الإدارة 📊
- **Request:** `GET /api/v1/admin/dashboard/stats`
- **Expected:** إحصائيات المنصة (users, trips, bookings, revenue)

```
📍 9. Admin → 9.1 Dashboard Stats
```

---

## 🔧 نصائح للاختبار

### Variables المتاحة
الـ Collection تحتوي على variables تتحدث تلقائياً:
- `{{baseUrl}}` - الـ API URL
- `{{accessToken}}` - Token الدخول (يتحدث بعد Login/Register)
- `{{tripId}}` - ID الرحلة (يتحدث بعد إنشاء رحلة)
- `{{bookingId}}` - ID الحجز
- `{{reviewId}}` - ID التقييم
- `{{favoriteId}}` - ID المفضلة

### تغيير Environment
لتغيير الـ baseUrl (مثلاً للـ production):
1. Edit Collection Variables
2. غير قيمة `baseUrl`

### أخطاء شائعة

| Error | السبب | الحل |
|-------|-------|------|
| 401 Unauthorized | Token منتهي أو غير صحيح | سجل دخول من جديد |
| 403 Forbidden | المستخدم ليس Admin | غير الـ role في database |
| 404 Not Found | ID غير موجود | تأكد من الـ ID المستخدم |
| 400 Validation Error | بيانات غير صحيحة | راجع الـ request body |

---

## 🧪 سيناريوهات اختبار كاملة

### سيناريو 1: تسجيل وحجز رحلة
1. Register user
2. Login
3. List trips
4. Create booking
5. View booking

### سيناريو 2: إدارة الرحلات (Admin)
1. Login as admin
2. Create trip
3. Add images
4. Publish trip
5. View dashboard stats

### سيناريو 3: تقييمات ومفضلات
1. Login
2. Add to favorites
3. Create review
4. View favorites
5. View trip reviews

---

## 📁 ملفات مفيدة

- **Postman Collection:** `docs/Storck_Tours_API.postman_collection.json`
- **API Documentation:** `README.md`
- **Environment Example:** `.env.example`

---

**🎉 مبروك! أنت جاهز لاختبار الـ API!**
