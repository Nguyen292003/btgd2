var TONGTIEN = 0;

window.onload = function () {
    list_products = getListProducts() || list_products;
    adminInfo = getListAdmin() || adminInfo;

    addEventChangeTab();

    if (window.localStorage.getItem('admin')) {
        addTableProducts();
        addTableDonHang();
        addTableKhachHang();
        addThongKe();

        openTab('Trang Chủ')
    } else {
        document.body.innerHTML = `<h1 style="color:red; with:100%; text-align:center; margin: 50px;"> Truy cập bị từ chối.. </h1>`;
    }
}

function logOutAdmin() {
    window.localStorage.removeItem('admin');
}

function getListRandomColor(length) {
    let result = [];
    for(let i = length; i--;) {
        result.push(getRandomColor());
    }
    return result;
}

function addChart(id, chartOption) {
    var ctx = document.getElementById(id).getContext('2d');
    var chart = new Chart(ctx, chartOption);
}

function createChartConfig(
    title = 'Title',
    charType = 'bar', 
    labels = ['nothing'], 
    data = [2], 
    colors = ['red'], 
) {
    return {
        type: charType,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: colors,
                borderColor: colors,
            }]
        },
        options: {
            title: {
                fontColor: '#fff',
                fontSize: 25,
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    };
}
function addEventChangeTab() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for(var a of list_a) {
        if(!a.onclick) {
            a.addEventListener('click', function() {
                turnOff_Active();
                this.classList.add('active');
                var tab = this.childNodes[1].data.trim()
                openTab(tab);
            })
        }
    }
}

function turnOff_Active() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for(var a of list_a) {
        a.classList.remove('active');
    }
}

function openTab(nameTab) {
    // ẩn hết
    var main = document.getElementsByClassName('main')[0].children;
    for(var e of main) {
        e.style.display = 'none';
    }

    // mở tab
    switch(nameTab) {
        case 'Trang Chủ': document.getElementsByClassName('home')[0].style.display = 'block'; break;
        case 'Sản Phẩm': document.getElementsByClassName('sanpham')[0].style.display = 'block'; break;
        case 'Đơn Hàng': document.getElementsByClassName('donhang')[0].style.display = 'block'; break;
        case 'Khách Hàng': document.getElementsByClassName('khachhang')[0].style.display = 'block'; break;
    }
}

function addTableDonHang() {
    var tc = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    var listDH = getListDonHang();

    TONGTIEN = 0;
    for (var i = 0; i < listDH.length; i++) {
        var d = listDH[i];
        s += `<tr>
            <td style="width: 5%">` + (i+1) + `</td>
            <td style="width: 13%">` + d.ma + `</td>
            <td style="width: 7%">` + d.khach + `</td>
            <td style="width: 20%">` + d.sp + `</td>
            <td style="width: 15%">` + d.tongtien + `</td>
            <td style="width: 10%">` + d.ngaygio + `</td>
            <td style="width: 10%">` + d.tinhTrang + `</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <i class="fa fa-check" onclick="duyet('`+d.ma+`', true)"></i>
                    <span class="tooltiptext">Duyệt</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-remove" onclick="duyet('`+d.ma+`', false)"></i>
                    <span class="tooltiptext">Hủy</span>
                </div>
                
            </td>
        </tr>`;
        TONGTIEN += stringToNum(d.tongtien);
    }

    s += `</table>`;
    tc.innerHTML = s;
}

function getListDonHang(traVeDanhSachSanPham = false) {
    var u = getListUser();
    var result = [];
    for(var i = 0; i < u.length; i++) {
        for(var j = 0; j < u[i].donhang.length; j++) {
            // Tổng tiền
            var tongtien = 0;
            for(var s of u[i].donhang[j].sp) {
                var timsp = timKiemTheoMa(list_products, s.ma);
                if(timsp.promo.name == 'giareonline') tongtien += stringToNum(timsp.promo.value);
                else tongtien += stringToNum(timsp.price);
            }

            // Ngày giờ
            var x = new Date(u[i].donhang[j].ngaymua).toLocaleString();

            // Các sản phẩm - dạng html
            var sps = '';
            for(var s of u[i].donhang[j].sp) {
                sps += `<p style="text-align: right">`+(timKiemTheoMa(list_products, s.ma).name + ' [' + s.soluong + ']') + `</p>`;
            }

            // Các sản phẩm - dạng mảng
            var danhSachSanPham = [];
            for(var s of u[i].donhang[j].sp) {
                danhSachSanPham.push({
                    sanPham: timKiemTheoMa(list_products, s.ma),
                    soLuong: s.soluong,
                });
            }

            // Lưu vào result
            result.push({
                "ma": u[i].donhang[j].ngaymua.toString(),
                "khach": u[i].username,
                "sp": traVeDanhSachSanPham ? danhSachSanPham : sps,
                "tongtien": numToString(tongtien),
                "ngaygio": x,
                "tinhTrang": u[i].donhang[j].tinhTrang
            });
        }
    }
    return result;
}

// Duyệt
function duyet(maDonHang, duyetDon) {
    var u = getListUser();
    for(var i = 0; i < u.length; i++) {
        for(var j = 0; j < u[i].donhang.length; j++) {
            if(u[i].donhang[j].ngaymua == maDonHang) {
                if(duyetDon) {
                    if(u[i].donhang[j].tinhTrang == 'Đang chờ xử lý') {
                        u[i].donhang[j].tinhTrang = 'Đã giao hàng';
                    
                    } else if(u[i].donhang[j].tinhTrang == 'Đã hủy') {
                        alert('Không thể duyệt đơn đã hủy !');
                        return;
                    }
                } else {
                    if(u[i].donhang[j].tinhTrang == 'Đang chờ xử lý') {
                        if(window.confirm('Bạn có chắc muốn hủy đơn hàng này. Hành động này sẽ không thể khôi phục lại !'))
                            u[i].donhang[j].tinhTrang = 'Đã hủy';
                    
                    } else if(u[i].donhang[j].tinhTrang == 'Đã giao hàng') {
                        alert('Không thể hủy đơn hàng đã giao !');
                        return;
                    }
                }
                break;
            }
        }
    }

    // lưu lại
    setListUser(u);

    // vẽ lại
    addTableDonHang();
}

function locDonHangTheoKhoangNgay() {
    var from = document.getElementById('fromDate').valueAsDate;
    var to = document.getElementById('toDate').valueAsDate;

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[5].innerHTML;
        var d = new Date(td);

        if (d >= from && d <= to) {
            tr.style.display = '';
        } else {
            tr.style.display = 'none';
        }
    }
}

function timKiemDonHang(inp) {
    var kieuTim = document.getElementsByName('kieuTimDonHang')[0].value;
    var text = inp.value;

    // Lọc
    var vitriKieuTim = {'ma':1, 'khachhang':2, 'trangThai':6};

    var listTr_table = document.getElementsByClassName('donhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

// Sắp xếp
function sortDonHangTable(loai) {
    var list = document.getElementsByClassName('donhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_DonHang); 
    decrease = !decrease;
}

// Lấy giá trị của loại(cột) dữ liệu nào đó trong bảng
function getValueOfTypeInTable_DonHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'ma' : return new Date(td[1].innerHTML); // chuyển về dạng ngày để so sánh ngày
        case 'khach' : return td[2].innerHTML.toLowerCase(); // lấy tên khách
        case 'sanpham' : return td[3].children.length;    // lấy số lượng hàng trong đơn này, length ở đây là số lượng <p>
        case 'tongtien' : return stringToNum(td[4].innerHTML); // trả về dạng giá tiền
        case 'ngaygio' : return new Date(td[5].innerHTML); // chuyển về ngày
        case 'trangthai': return td[6].innerHTML.toLowerCase(); //
    }
    return false;
}
function addTableKhachHang() {
    var tc = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    var listUser = getListUser();

    for (var i = 0; i < listUser.length; i++) {
        var u = listUser[i];
        s += `<tr>
            <td style="width: 5%">` + (i+1) + `</td>
            <td style="width: 15%">` + u.ho + ' ' + u.ten + `</td>
            <td style="width: 20%">` + u.email + `</td>
            <td style="width: 20%">` + u.username + `</td>
            <td style="width: 10%">` + u.pass + `</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <label class="switch">
                        <input type="checkbox" `+(u.off?'':'checked')+` onclick="voHieuHoaNguoiDung(this, '`+u.username+`')">
                        <span class="slider round"></span>
                    </label>
                    <span class="tooltiptext">`+(u.off?'Mở':'Khóa')+`</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-remove" onclick="xoaNguoiDung('`+u.username+`')"></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;
    tc.innerHTML = s;
}

// Tìm kiếm
function timKiemNguoiDung(inp) {
    var kieuTim = document.getElementsByName('kieuTimKhachHang')[0].value;
    var text = inp.value;

    // Lọc
    var vitriKieuTim = {'ten':1, 'email':2, 'taikhoan':3};

    var listTr_table = document.getElementsByClassName('khachhang')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

function openThemNguoiDung() {
    window.alert('Not Available!');
}
function xoaNguoiDung(taikhoan) {
    if(window.confirm('Xác nhận xóa '+taikhoan+'? \nMọi dữ liệu về '+taikhoan+' sẽ mất! Bao gồm cả những đơn hàng của '+taikhoan)) {
        var listuser = getListUser();
        for(var i = 0; i < listuser.length; i++) {
            if(listuser[i].username == taikhoan) {
                listuser.splice(i, 1); // xóa
                setListUser(listuser); // lưu thay đổi
                localStorage.removeItem('CurrentUser'); // đăng xuất khỏi tài khoản hiện tại (current user)
                addTableKhachHang(); // vẽ lại bảng khách hàng
                addTableDonHang(); // vẽ lại bảng đơn hàng
                return;
            }
        }
    }
}

function sortKhachHangTable(loai) {
    var list = document.getElementsByClassName('khachhang')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_KhachHang); 
    decrease = !decrease;
}

function getValueOfTypeInTable_KhachHang(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'hoten' : return td[1].innerHTML.toLowerCase();
        case 'email' : return td[2].innerHTML.toLowerCase();
        case 'taikhoan' : return td[3].innerHTML.toLowerCase();    
        case 'matkhau' : return td[4].innerHTML.toLowerCase(); 
    }
    return false;
}

var decrease = true; // Sắp xếp giảm dần

// loại là tên cột, func là hàm giúp lấy giá trị từ cột loai
function quickSort(arr, left, right, loai, func) {
    var pivot,
        partitionIndex;

    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right, loai, func);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1, loai, func);
        quickSort(arr, partitionIndex + 1, right, loai, func);
    }
    return arr;
}

function partition(arr, pivot, left, right, loai, func) {
    var pivotValue =  func(arr[pivot], loai),
        partitionIndex = left;
    
    for (var i = left; i < right; i++) {
        if (decrease && func(arr[i], loai) > pivotValue
        || !decrease && func(arr[i], loai) < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var tempi = arr[i].cloneNode(true);
    var tempj = arr[j].cloneNode(true);
    arr[i].parentNode.replaceChild(tempj, arr[i]);
    arr[j].parentNode.replaceChild(tempi, arr[j]);
}

function promoToStringValue(pr) {
    switch (pr.name) {
        case 'tragop':
            return 'Góp ' + pr.value + '%';
        case 'giamgia':
            return 'Giảm ' + pr.value;
        case 'giareonline':
            return 'Online (' + pr.value + ')';
        case 'moiramat':
            return 'Mới';
    }
    return '';
}

function progress(percent, bg, width, height) {

    return `<div class="progress" style="width: ` + width + `; height:` + height + `">
                <div class="progress-bar bg-info" style="width: ` + percent + `%; background-color:` + bg + `"></div>
            </div>`
}