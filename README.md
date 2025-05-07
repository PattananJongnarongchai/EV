🧾 Card Management System ระบบจัดการบัตรด้วย React (Frontend) และ Express (Backend) รองรับการเพิ่ม, แก้ไข, ลบ และแสดงรายการบัตร พร้อมระบบ modal form สำหรับการจัดการข้อมูลอย่างสะดวกและสวยงาม

✅ ฟีเจอร์ เพิ่มบัตรใหม่ (Card ID, IC Card, สถานะ, ผู้ใช้งาน)

แก้ไขข้อมูลบัตรผ่าน Modal

ลบบัตร

แสดงรายการบัตรทั้งหมดในตาราง

เชื่อมต่อกับ REST API

🛠 เทคโนโลยีที่ใช้ Frontend React

TypeScript

Axios

Tailwind CSS (ใช้สำหรับตกแต่ง UI)

Backend Express.js

MongoDB (ผ่าน Mongoose)

🚀 วิธีติดตั้งและรันโปรเจกต์

Clone โปรเจกต์ bash คัดลอก แก้ไข git clone https://github.com/your-username/EV.git cd card-management-app

ติดตั้ง Frontend bash คัดลอก แก้ไข cd client npm install npm run dev Frontend จะรันที่ http://localhost:5173 หรือที่กำหนดใน vite.config.ts

ติดตั้ง Backend bash คัดลอก แก้ไข cd server npm install npm run dev Backend จะรันที่ http://localhost:5000 และให้บริการ REST API สำหรับเชื่อมต่อกับ MongoDB

📁 โครงสร้างโปรเจกต์ (แนะนำ) bash คัดลอก แก้ไข 
card-management-app/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddCardForm.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
├── server/                # Express backend
│   ├── routes/
│   │   └── cardRoutes.js
│   ├── models/
│   │   └── Card.js
│   ├── server.js
├── README.md

✨ ตัวอย่างหน้าจอ ตารางรายการบัตร

Modal สำหรับเพิ่ม / แก้ไข

ปุ่มลบ

(คุณสามารถเพิ่มรูปภาพหน้าจอการใช้งานไว้ในส่วนนี้ได้ เช่น screenshots/overview.png)

🌐 API Endpoint (Backend)
| Method | Endpoint         | Description           |
| ------ | ---------------- | --------------------- |
| GET    | `/api/cards`     | ดึงรายการบัตรทั้งหมด  |
| POST   | `/api/cards`     | เพิ่มบัตรใหม่         |
| PUT    | `/api/cards/:id` | แก้ไขข้อมูลบัตรตาม ID |
| DELETE | `/api/cards/:id` | ลบบัตรตาม ID          |


📌 หมายเหตุ ตรวจสอบให้แน่ใจว่า MongoDB รันอยู่และเชื่อมต่อได้

ใช้ .env สำหรับกำหนดค่าเชื่อมต่อฐานข้อมูลใน backend

🧑‍💻 ผู้พัฒนา Pattanan