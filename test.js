const list =
    `Doãn Hoàng Lan
Ngô Định Vũ
Dương Nguyễn Anh Thy
Vũ Thanh Tú
Nguyễn Thị Quỳnh Như
Nguyễn Trương Thiên Lý
Đặng Thị Hoàng Quyên
Giang Hoàng Phượng Tiên
Hoàng Ngọc Bảo Châu
Lại Linh Đan
Lê Huỳnh Thành Danh
Nguyễn Phạm Kỳ Duyên
Nguyễn Thi Lệ Quyên
Phạm Lê Mai Thiện
Trương Đỗ Thục Uyên
Nguyễn Ngọc Hương Quỳnh
Trần Thị Vi Anh
Võ Phạm Thanh Vân
Đào Thị Hòa Bình 
Phạm Ngọc Thu Giang
Đặng Hoàng Kim Huệ
Lê Trung Hiếu
Nguyễn Bá Linh Chi
Nguyễn Diệu Loan
Nguyễn Hoàng Hiếu
Nguyễn Thị Linh Chi
Phạm Ngọc Thủy Tiên
Nguyễn Nam Giang
Võ Thị Mỹ Linh
Nguyễn Ngọc Song Hân
Nguyễn Lương Quốc Thái
Đinh Khắc Bảo
Bùi Nguyên Thanh Chi
Dư Thị Mỹ Loan
Huỳnh Ngọc Phương Trinh
Ngụy Như Vân Thanh
Phạm Thị Hồng Trang
Phùng Yến Nhi
Chánh Tiết Kiều
Hồ Việt Hà
Hồ Huỳnh Như Ngọc
Nguyễn Ngọc Phương Linh
Lý Thiên Luân
Huỳnh Hoàng Như Tuyết
Văn Ngọc Thảo
Nguyễn Thị Hồng Thuý
Đỗ Thị Thu Thủy
Kim Thanh Nhã
Nguyễn Trung Hiếu
Nguyễn Hoàng Hải Lam
Nguyễn Lưu Đăng Khoa
Lê Đăng Hải
Lê Nguyễn Ánh Dương
Nguyễn Thị Ngân Giang
Nguyễn Trần Hoàng Quý
Văn Phạm Nhật Lan
Nguyễn Hạnh Dung
Hoàng Chính Trung
Lê Thị Hồng Nhung
Nguyễn Trung Thuận
Phạm Thị Phương Thảo
Đinh Thị Hạnh Trâm
Cao Văn Châu
Đoàn Đăng Khoa
Hồ Thị Hoàng Anh
Lê Thị Minh Ngọc
Nguyễn Đức Thành Tâm
Nguyễn Ngọc Minh Trung
Nguyễn Thanh Thống
Nguyễn Thị Bích Hồng
Nguyễn Thị Thu Hà
Trần Văn Thiệp
Cao Phúc
Hồ Đăng Khải
Lê Hoàng Quân
Phạm Anh Tú
Trần Quang Đại
Đồng Đăng Khoa
Đào Nguyễn Hoàng Nam
Nguyễn Đức Toàn
Nguyễn Sĩ Đạt
Tăng Thị Thùy Chinh
Võ Văn Châu
Bùi Đinh Hoài Nam
Lý Cẩm Hào
Nguyễn Như Ngọc
Nguyễn Thái Thắng
Nguyễn Thành Lợi
Trần Kim Long
Nguyễn Quốc Tài
Cáp Duy Vương
Lê Minh Hùng
Lưu Quang Huân
Lý Ngọc Hoàng
Nguyễn Vĩnh An
Nguyễn Hồng Bắc
Phí Quang Khôi
Thạch Cảnh Nhựt
Nguyễn Tuấn Kiệt
Huỳnh Minh Thắng
Lương Thiện Phước
Nguyễn Công Phi
Nguyễn Tấn Duy
Phan Nguyễn Trọng Đại`

const RemoveAccents = (string) => {
    let str = string.toLowerCase().replace(/ /g, '')
    var AccentsMap = [
        "aàảãáạăằẳẵắặâầẩẫấậ",
        "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
        "dđ", "DĐ",
        "eèẻẽéẹêềểễếệ",
        "EÈẺẼÉẸÊỀỂỄẾỆ",
        "iìỉĩíị",
        "IÌỈĨÍỊ",
        "oòỏõóọôồổỗốộơờởỡớợ",
        "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
        "uùủũúụưừửữứự",
        "UÙỦŨÚỤƯỪỬỮỨỰ",
        "yỳỷỹýỵ",
        "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
        var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
        var char = AccentsMap[i][0];
        str = str.replace(re, char);
    }
    return str;
}

const hash = list.split("\n");
const hash1 = hash.map(value => {
    return value.split(" ");
})

const listMail = hash1.map(value => {
    if (value.length > 2) {
        return RemoveAccents(value[value.length - 1]) + "." + RemoveAccents(value[value.length - 2])[0] + "." + RemoveAccents(value[0]) + "@taptap.com.vn"
    } else {
        return RemoveAccents(value[1]) + "." + RemoveAccents(value[0]) + "@taptap.com.vn"
    }
})


console.log(listMail);

listMail.forEach((value, key) => {
    const user = new User({
        email: value,
        name: hash[key].trim()
    })
    user.save()
})