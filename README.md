# GDD CODING SCHOOL
เว็บไซต์ HTML/CSS/JavaScript พร้อมรูปภาพทั้งเว็บ ใช้บน GitHub Pages ได้โดยไม่ต้องติดตั้ง npm

## เปิดดูและแก้ไข
แตกไฟล์ ZIP แล้วเปิด index.html ด้วย Chrome หรือ Edge
แก้ข้อความด้วย VS Code ในไฟล์ index.html ของแต่ละหน้า เช่น about/index.html และ courses/roblox/index.html
แก้สีและการจัดวางใน styles.css และพฤติกรรมสไลด์กับแผนที่ใน site.js
รูปภาพทั้งหมดอยู่ใน assets ส่วน vendor/leaflet เป็นไฟล์แผนที่พร้อมใบอนุญาต
แผนที่ ฟอนต์ออนไลน์ และวิดีโอ YouTube ต้องเชื่อมต่ออินเทอร์เน็ต
ข้อมูลตำแหน่งสาขาอยู่ใน script id="branch-points" ของ about/index.html พิกัดอ้างอิงจากลิงก์ Google Maps ของสาขา

## นำขึ้น GitHub Pages
1. สร้าง repository แล้วอัปโหลดไฟล์และโฟลเดอร์ที่อยู่ข้างใน ZIP ให้ index.html อยู่ที่ระดับบนสุดของ repository
2. ไปที่ Settings > Pages
3. เลือก Source: Deploy from a branch
4. เลือก Branch: main และโฟลเดอร์ /(root) แล้วกด Save
5. รอให้ GitHub แสดงลิงก์เว็บไซต์ในหน้า Pages
ต้องนำ assets, vendor และโฟลเดอร์ทุกหน้าขึ้นไปด้วย ลิงก์เป็นแบบ relative จึงรองรับทั้งเว็บหลักและเว็บในชื่อ repository

อ้างอิง GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
แผนที่ภาพรวมใช้ Leaflet และ OpenStreetMap ส่วนลิงก์เส้นทางเปิด Google Maps

## แก้เนื้อหาผ่านหน้าแอดมิน
เปิด admin/index.html ผ่าน Live Server หรือ GitHub Pages ใช้แท็บทุกหน้าเว็บไซต์แก้ข้อความ รูป ลิงก์ และเพิ่มกล่องเนื้อหา ส่วนแท็บข่าวใช้เพิ่มข่าวใหม่ คู่มือฉบับเต็มอยู่ใน คู่มือจัดการเว็บ-GitHub.md
ข้อมูลทุกหน้าอยู่ใน content/site.json ข่าวที่เพิ่มอยู่ใน content/news.json หน้าเว็บตรวจข้อมูลใหม่ทุก 15 วินาทีหลังบันทึกหรือหลัง GitHub เผยแพร่แล้ว สามารถอัปโหลด admin ขึ้น Pages ได้ การเผยแพร่ต้องใช้สิทธิ์ GitHub ของผู้ดูแล

## ใช้แอดมินแบบง่ายบนคอม
ดับเบิลคลิก เปิดแอดมิน.cmd แล้วใช้ปุ่มแก้ไขและบันทึก โดยไม่ต้องจัดการไฟล์ข้อมูลเอง ดู วิธีใช้สำหรับหัวหน้า.md
สำหรับการแยกแอดมินออกจากเว็บออนไลน์ ใช้ workflow .github/workflows/pages.yml และตั้ง Pages Source เป็น GitHub Actions (ไม่ใช่ Deploy from a branch)
