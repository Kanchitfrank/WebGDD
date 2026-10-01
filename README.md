# GDD Coding School

เว็บไซต์หลัก HTML/CSS/JavaScript พร้อมแอดมินที่ใช้ในเครื่อง

## ใช้งานประจำวัน

ดับเบิลคลิก **เปิดแอดมิน.cmd** ในโฟลเดอร์ WebGDD (ต้องมี Node.js) หน้าแอดมินเปิดที่ http://127.0.0.1:5510/admin/index.html

เลือก Home / คอร์ส / Gallery / ข่าว / ครู / About GDD → เพิ่มหรือแก้รายการ → ดูตัวอย่าง → บันทึกและอัปเดต ดูรายละเอียดใน **วิธีใช้สำหรับหัวหน้า.md**

หากใช้ VS Code Live Server ให้เปิดโฟลเดอร์ **WebGDD** เป็นโฟลเดอร์หลัก แล้วเริ่ม Live Server ใหม่ ไม่ใช้ไฟล์ index.html ที่อยู่นอก WebGDD

เว็บโหลดข้อมูลจาก content/site.json, news.json, teachers.json และ collections.json ทุก 15 วินาที ต้องเปิดผ่าน HTTP/HTTPS

## เผยแพร่

GitHub Desktop → Commit to main → Push origin ระบบ .github/workflows/pages.yml เผยแพร่เฉพาะเว็บหลักและข้อมูล ไม่เผยแพร่ admin หรือไฟล์สำรอง

ครั้งแรก: repository แบบ Public สำหรับ GitHub Free → Settings → Pages → Source: **GitHub Actions**

แอดมินไม่มีระบบล็อกอินออนไลน์ บันทึกลงเครื่องก่อนแล้วเผยแพร่ด้วยบัญชี GitHub ที่มีสิทธิ์ ไม่ใส่รหัสผ่านหรือ token ในไฟล์เว็บ

## เส้นทาง

แผนที่ใช้ Leaflet/OpenStreetMap การคำนวณถนนใช้ OSRM demo แบบ best effort พร้อมปุ่ม Google Maps สำรอง ระยะทาง/เวลาเป็นค่าประมาณ ไม่รวมรถติด เมื่อเว็บไซต์มีปริมาณการใช้งานมากควรใช้บริการ routing ที่มี SLA หรือโฮสต์ OSRM เอง

ฟอนต์ แผนที่ เส้นทาง และ YouTube ต้องใช้อินเทอร์เน็ต
