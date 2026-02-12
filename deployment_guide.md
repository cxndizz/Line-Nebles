## 0. การตั้งค่าที่ Cloudflare (DNS)

เพื่อให้ domain `nebles.needhome.co` ชี้ไปยัง VPS ของพี่ ให้ทำดังนี้ครับ:

1.  เข้าสู่ระบบ **Cloudflare** เลือก Domain `needhome.co`
2.  ไปที่แท็บ **DNS** > **Records**
3.  กด **Add record**
4.  ตั้งค่าตามนี้:
    - **Type**: `A`
    - **Name**: `nebles`
    - **IPv4 address**: `174.138.20.69` (ไอพี VPS ของพี่)
    - **Proxy status**: แนะนำให้เลือก **DNS only** (เมฆสีเทา) ก่อนในช่วงที่ทำ Certbot บน VPS จะได้ไม่มีปัญหาครับ (สลับเป็น Proxied ทีหลังได้)
13. 5.  กด **Save** เป็นอันเสร็จพิธีทาง DNS ครับ

---

### Nginx Config Template (สำหรับ nebles.needhome.co):
```nginx
# ==========================================
# 3. NEW SUBDOMAIN: nebles.needhome.co
# ==========================================
server {
    listen 80;
    server_name nebles.needhome.co;

    location / {
        proxy_pass http://127.0.0.1:5995;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
> [!IMPORTANT]
> อย่าลืมจัดการเรื่อง **SSL (HTTPS)** ด้วย `Certbot` (Let's Encrypt) เพราะ LINE บังคับให้ Endpoint ต้องเป็น HTTPS เท่านั้นครับ

---

## 2. การสร้าง Docker สำหรับ Production

ในการรันบน VPS ผมแนะนำให้ใช้โหมด Production เพื่อความเร็วและความปลอดภัยครับ โดยแก้ไข `docker-compose.yml` ดังนี้:

```yaml
services:
  frontend:
    build:
      context: ./frontend-client
      dockerfile: Dockerfile
    container_name: nebles-frontend
    ports:
      - "5995:5995"
    restart: always
```

และใน `frontend-client/Dockerfile` ต้องแน่ใจว่ามันสั่ง `npm run build` และรันด้วย `npm run start` นะครับ

## 2. การลงโปรเจกต์บน VPS

1.  **Clone โปรเจกต์** ลงบน VPS
2.  **ตั้งค่า Environment**: สร้างไฟล์ `.env.local` ใน `frontend-client/` และใส่ `GAS_URL` กับ `LIFF_ID`
3.  **รันด้วย Docker (ตามที่เราปรับไว้)**:
    ```bash
    docker compose up -d --build
    ```
    *ตัวแอปจะรันอยู่ที่พอร์ต 5995 ภายในเครื่อง VPS*

---

## 3. การสร้าง LIFF ID ใน LINE Developers

เมื่อได้ URL (HTTPS) จากข้อ 1 มาแล้ว ให้ทำดังนี้ครับ:

1.  ไปที่ [LINE Developers Console](https://developers.line.biz/)
2.  สร้าง **Provider** และ **LINE Login Channel**
3.  ไปที่แท็บ **LIFF** > กด **Add**
4.  กรอกข้อมูล:
    - **LIFF app name**: ตั้งชื่อตามใจชอบ
    - **Size**: Full (แนะนำ)
    - **Endpoint URL**: `https://nebles.needhome.co/en/owner`
    - **Scopes**: ติ๊ก `profile` และ `openid`
5.  กด **Save** แล้วพี่จะได้ **LIFF ID** (เช่น `2001234567-AbCdEfGh`)
6.  นำ LIFF ID นี้ไปใส่ใน `.env.local` บน VPS แล้ว restart docker อีกรอบครับ

---

## 4. เชื่อมต่อกับ Rich Menu

นำ **LIFF URL** (จะอยู่ในหน้า LIFF ของ LINE Developers เช่น `https://liff.line.me/2001234567-AbCdEfGh`) ไปใส่ใน Action ของ Rich Menu หรือข้อความตอบกลับอัตโนมัติได้เลยครับ

**ทำไมต้องใช้ LIFF URL?**
- เพราะถ้ากดผ่าน `https://liff.line.me/...` LINE จะช่วยทำ Login และดึง Profile ให้เราโดยอัตโนมัติภายในแอป LINE เลยครับ
