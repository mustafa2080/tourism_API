# 🚀 Deployment Guide - Storck Tours API

## Free Hosting Options

### Option 1: Render.com (Recommended) ⭐

**Pros:** Free tier, easy setup, auto-deploy from GitHub, free PostgreSQL

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/storck-tours-api.git
   git push -u origin main
   ```

2. **Create PostgreSQL Database on Render**
   - Go to [render.com](https://render.com)
   - Dashboard → New → PostgreSQL
   - Name: `storck-tours-db`
   - Region: Choose closest
   - Copy the **Internal Database URL**

3. **Deploy the API**
   - Dashboard → New → Web Service
   - Connect your GitHub repo
   - Settings:
     - **Name:** `storck-tours-api`
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

4. **Set Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env.example`:
     ```
     NODE_ENV=production
     DATABASE_URL=<paste Internal Database URL>
     JWT_SECRET=<generate with: openssl rand -hex 32>
     JWT_REFRESH_SECRET=<generate different secret>
     COOKIE_SECRET=<generate different secret>
     ADMIN_SECRET=<your-secure-admin-secret>
     CORS_ORIGIN=https://your-frontend.com
     ```

5. **Initialize Database**
   - After first deploy, go to Shell tab
   - Run: `npm run db:push`
   - Run: `npm run seed` (optional, creates test users)

---

### Option 2: Railway.app

**Pros:** Free tier, auto PostgreSQL, very easy

#### Steps:

1. **Deploy from GitHub**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repo

2. **Add PostgreSQL**
   - Add → Database → PostgreSQL
   - Railway auto-creates `DATABASE_URL`

3. **Set Variables**
   - Click on your service → Variables
   - Add all environment variables

4. **Deploy**
   - Railway auto-deploys on push

---

### Option 3: Fly.io

**Pros:** More control, global edge deployment

#### Steps:

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login & Initialize**
   ```bash
   fly auth login
   fly launch
   ```

3. **Create PostgreSQL**
   ```bash
   fly postgres create --name storck-db
   fly postgres attach storck-db
   ```

4. **Set Secrets**
   ```bash
   fly secrets set JWT_SECRET=your-secret-here
   fly secrets set JWT_REFRESH_SECRET=another-secret
   fly secrets set ADMIN_SECRET=admin-secret
   fly secrets set COOKIE_SECRET=cookie-secret
   fly secrets set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

---

## 🔐 Security Checklist Before Deployment

- [ ] **Change all secrets** - Never use default values!
- [ ] **Generate secure secrets:**
  ```bash
  # Generate random secrets (run in terminal)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **Set CORS_ORIGIN** to your actual frontend URL
- [ ] **Set NODE_ENV=production**
- [ ] **Change ADMIN_SECRET** - This is critical!
- [ ] **Remove any test data** from seed.js

---

## 🧪 Test Your Deployment

After deploying, test these endpoints:

1. **Health Check**
   ```
   GET https://your-api-url.com/api/v1/health
   ```

2. **Register Admin** (using your new ADMIN_SECRET)
   ```
   POST https://your-api-url.com/api/v1/auth/register-admin
   {
     "name": "Admin",
     "email": "admin@yourcompany.com",
     "password": "SecurePassword123!",
     "role": "ADMIN",
     "adminSecret": "your-production-admin-secret"
   }
   ```

3. **Create a Trip** (requires admin login)

---

## 📁 Required Files for Deployment

Make sure these files exist:
- ✅ `package.json` - with `engines` and `postinstall` script
- ✅ `server.js` - entry point
- ✅ `prisma/schema.prisma` - database schema
- ✅ `.env.example` - template for env vars
- ✅ `.gitignore` - excludes `node_modules` and `.env`

---

## 🔄 Database Migrations

For new deployments:
```bash
# Push schema to database
npm run db:push

# Or run migrations (if using prisma migrate)
npm run db:migrate
```

For existing deployments with data:
```bash
# Generate a migration
npx prisma migrate dev --name migration_name

# Deploy migration to production
npm run db:migrate
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check `DATABASE_URL` format and SSL settings |
| Prisma client not found | Run `npm run db:generate` or add `postinstall` script |
| CORS errors | Update `CORS_ORIGIN` with correct frontend URL |
| 401 Unauthorized | Check JWT_SECRET matches between deployments |
| Admin registration fails | Verify ADMIN_SECRET is set correctly |

---

## 📞 Support

If you encounter issues:
1. Check Render/Railway logs for errors
2. Verify all environment variables are set
3. Test locally with production settings first
