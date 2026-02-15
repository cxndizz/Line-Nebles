# คู่มือการสร้างลิงก์สำหรับแชร์และยิง Ads (Sharing & Tracking Guide)

ไฟล์นี้สรุปรายการลิงก์ทั้งหมดที่ติดตั้งระบบ Tracking (UTM) เพื่อใช้ดูสถิติใน Google Analytics 4 (GA4)

---

## 1. หน้าแรก (Landing Page)

| แพลตฟอร์ม | ภาษาไทย (TH) | ภาษาอังกฤษ (EN) | ภาษาจีน (CN) |
| :--- | :--- | :--- | :--- |
| **LINE** | `https://nebles.needhome.co/th?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/en?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/cn?utm_source=line&utm_medium=social` |
| **Facebook** | `https://nebles.needhome.co/th?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/en?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/cn?utm_source=facebook&utm_medium=social` |
| **WhatsApp** | `https://nebles.needhome.co/th?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/en?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/cn?utm_source=whatsapp&utm_medium=social` |
| **TikTok** | `https://nebles.needhome.co/th?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/en?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/cn?utm_source=tiktok&utm_medium=social` |

---

## 2. สำหรับผู้เช่า (Renter Page)

| แพลตฟอร์ม | ภาษาไทย (TH) | ภาษาอังกฤษ (EN) | ภาษาจีน (CN) |
| :--- | :--- | :--- | :--- |
| **LINE** | `https://nebles.needhome.co/th/renter?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/en/renter?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/cn/renter?utm_source=line&utm_medium=social` |
| **Facebook** | `https://nebles.needhome.co/th/renter?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/en/renter?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/cn/renter?utm_source=facebook&utm_medium=social` |
| **WhatsApp** | `https://nebles.needhome.co/th/renter?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/en/renter?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/cn/renter?utm_source=whatsapp&utm_medium=social` |
| **TikTok** | `https://nebles.needhome.co/th/renter?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/en/renter?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/cn/renter?utm_source=tiktok&utm_medium=social` |

---

## 3. สำหรับเจ้าของห้อง (Owner Page)

| แพลตฟอร์ม | ภาษาไทย (TH) | ภาษาอังกฤษ (EN) | ภาษาจีน (CN) |
| :--- | :--- | :--- | :--- |
| **LINE** | `https://nebles.needhome.co/th/owner?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/en/owner?utm_source=line&utm_medium=social` | `https://nebles.needhome.co/cn/owner?utm_source=line&utm_medium=social` |
| **Facebook** | `https://nebles.needhome.co/th/owner?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/en/owner?utm_source=facebook&utm_medium=social` | `https://nebles.needhome.co/cn/owner?utm_source=facebook&utm_medium=social` |
| **WhatsApp** | `https://nebles.needhome.co/th/owner?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/en/owner?utm_source=whatsapp&utm_medium=social` | `https://nebles.needhome.co/cn/owner?utm_source=whatsapp&utm_medium=social` |
| **TikTok** | `https://nebles.needhome.co/th/owner?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/en/owner?utm_source=tiktok&utm_medium=social` | `https://nebles.needhome.co/cn/owner?utm_source=tiktok&utm_medium=social` |

---

## 4. คำแนะนำเพิ่มเติมสำหรับการยิง Ads (Paid Ads)
หากท่านมีการยิงโฆษณาแบบเสียเงิน แนะนำให้เปลี่ยน `utm_medium` เป็น `ads` เพื่อแยกข้อมูลให้ชัดเจน:

**ตัวอย่าง (Facebook Ads - หน้า Owner ภาษาไทย):**
`https://nebles.needhome.co/th/owner?utm_source=facebook&utm_medium=ads&utm_campaign=feb_launch`

---

## 5. วิธีดูสถิติ (Google Analytics 4)
1. เข้าไปที่ [Google Analytics](https://analytics.google.com/)
2. เลือก Property: **Nebles**
3. ไปที่เมนู **Reports** > **Acquisition** > **Traffic acquisition**
4. ตรวจสอบที่คอลัมน์ **Session source/medium** จะเห็นยอดแยกตาม `line / social`, `facebook / social` ฯลฯ ตามที่ตั้งไว้ใน URL ครับ
