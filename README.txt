- Hiện tại mọi người đang dùng cơ sở dữ liệu online của MongoDb, Nhưng chạy source localhost sẽ không chạy được vì ip link hình và Link nhạc tương ứng với từng cá nhân test

Nên mọi người:
- Nhớ thay đổi ip theo ipv4 => bật cmd và gõ ipconfig
- Paste ipv4 vào trong file getHost ở thư mục util và nhớ thêm port 3000 ở cuối 
vd : const Host = '192.168.2.55:3000';
- Nhớ tạo 1 CSDL online (mongodb Cluster) và điền địa chỉ connect vào trong folder config\db\index.js (Với người dùng mongodb online)
- Những người dùng localhost của mongodb chỉ cần sửa gethost thành ip của mình
- Replace những file json (Giải nén file json ra sẽ có hướng dẫn kĩ hơn)
- Dùng file json để add vào dữ liệu vào mongodb compass

