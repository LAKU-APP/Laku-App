# DEBUG NETWORK ERROR SAAT REGISTER

## 🔍 DIAGNOSTIC CHECKLIST

### 1. ✅ Check Backend Running
```bash
# Terminal: Buka terminal baru di backend folder
cd app\backend

# Jalankan server
php artisan serve

# Output yang benar:
# INFO  Server running on [http://127.0.0.1:8000]
```

**Jika error**, cek:
```bash
# Clear cache & config
php artisan config:clear
php artisan cache:clear

# Check PHP & composer
php --version
composer --version
```

---

### 2. ✅ Check Database Connected
```bash
# Di terminal backend yang same
php artisan tinker

# Test di tinker console
>>> DB::connection()->getPDO();
# Jika berhasil akan return PDO object

# Exit tinker
>>> exit
```

**Output yang benar:**
```
PDO Object (
    [status:pdo:private] => 0
)
```

---

### 3. ✅ Check Frontend Running
```bash
# Terminal: Buka terminal di app folder
cd app

# Jalankan dev server
npm run dev

# Seharusnya start di http://localhost:5173 atau http://127.0.0.1:5173
```

---

### 4. ✅ Check CORS (Browser Console)
1. Buka browser → F12 → Console tab
2. Coba register
3. Lihat tab **Network** (bukan Console)
4. Cari request ke `http://127.0.0.1:8000/api/register`

**Jika 200/201:** Backend terima tapi ada error di response  
**Jika CORS error:** CORS belum dikonfigurasi  
**Jika 0/timeout:** Backend tidak running

---

### 5. ✅ Test API Endpoint Langsung
```bash
# Di terminal baru, test dengan curl
curl -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}"

# Atau pakai Postman:
# POST http://127.0.0.1:8000/api/register
# Body (JSON):
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

---

### 6. ✅ Check .env Database Config
File: `app\backend\.env`

```bash
# Pastikan ini sudah diisi
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_laku
DB_USERNAME=root
DB_PASSWORD=
```

**Jika MySQL pakai password**, update `DB_PASSWORD`

---

### 7. ✅ Check API URL di Frontend
File: `app\.env`

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Harus **SAMA** dengan endpoint backend

---

## 🚀 QUICK FIX STEPS

1. **Clear everything:**
   ```bash
   # Backend
   cd app/backend
   php artisan config:clear
   php artisan cache:clear
   
   # Frontend - delete node_modules & reinstall (jika perlu)
   cd app
   rm -r node_modules package-lock.json
   npm install
   ```

2. **Run migrations fresh:**
   ```bash
   cd app/backend
   php artisan migrate:fresh --seed
   ```

3. **Restart servers:**
   ```bash
   # Terminal 1 - Backend
   cd app/backend && php artisan serve
   
   # Terminal 2 - Frontend  
   cd app && npm run dev
   ```

4. **Test di browser:**
   - Buka http://localhost:5173
   - Buka DevTools (F12)
   - Buka tab Network
   - Coba register
   - Lihat response dari `/api/register`

---

## 📋 ERROR RESPONSES & SOLUTIONS

### ❌ "Network Error" di browser
**Kemungkinan:**
- Backend tidak running → Jalankan `php artisan serve`
- Database tidak konek → Check `.env` DB_* settings
- Port 8000 terpakai → Ubah ke port lain: `php artisan serve --port=8001`

### ❌ "CORS error"
**Kemungkinan:**
- CORS middleware belum enable → Sudah fixed di bootstrap/app.php
- Frontend URL bukan di allowed_origins → Check config/cors.php

**Fix:**
```bash
php artisan config:clear
```

### ❌ "Email sudah terdaftar"
**Kemungkinan:**
- Email sudah dipakai → Gunakan email baru
- Data lama masih di database → Run `php artisan migrate:fresh`

### ❌ "ValidationException"
**Kemungkinan:**
- Password confirmation tidak cocok
- Email format salah
- Nama kurang dari 3 karakter

**Cek console log untuk detail error**

---

## 📊 SERVER LOGS

Untuk melihat error detail:

```bash
# Real-time log di backend
cd app/backend
tail -f storage/logs/laravel.log

# Atau di Windows (PowerShell)
Get-Content storage\logs\laravel.log -Wait
```

---

## 💡 PRO TIPS

1. **Use Postman** untuk test API tanpa UI:
   - Download Postman
   - Import endpoint
   - Test langsung

2. **Browser DevTools Network Tab:**
   - Buka Network
   - Filter: `api/register`
   - Lihat Request & Response
   - Check status code & headers

3. **Laravel Logging:**
   ```php
   // Di controller
   \Log::info('Register attempt', $request->all());
   ```

---

## ✅ SUCCESS CHECKLIST

- [ ] Backend running (`php artisan serve`)
- [ ] Frontend running (`npm run dev`)
- [ ] Database connected (test di tinker)
- [ ] .env file correctly configured
- [ ] CORS middleware enabled
- [ ] Network request returns 201
- [ ] User created in database
- [ ] Token returned in response

Jika semua ✅, register harusnya work!
