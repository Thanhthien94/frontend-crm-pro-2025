# Checklist Phát Triển Frontend CRM

## Chức năng xác thực (Authentication)
- [x] Đăng nhập
- [x] Đăng ký
- [x] Đăng xuất
- [x] Lấy thông tin người dùng hiện tại
- [ ] Quên mật khẩu
- [ ] Đặt lại mật khẩu
- [x] Bảo vệ route với AuthGuard
- [x] Xử lý token hết hạn

## Quản lý người dùng
- [ ] Trang danh sách người dùng
- [ ] Form tạo người dùng mới
- [ ] Chỉnh sửa người dùng
- [ ] Xóa người dùng
- [x] Trang thông tin cá nhân (Profile)
- [x] Cập nhật thông tin cá nhân
- [x] Đổi mật khẩu

## Quản lý khách hàng
- [x] Danh sách khách hàng với phân trang
- [x] Tìm kiếm và lọc khách hàng
- [x] Form tạo khách hàng mới
- [x] Xem chi tiết khách hàng
- [x] Chỉnh sửa khách hàng
- [x] Xóa khách hàng
- [x] Gán khách hàng cho người dùng
- [ ] Hiển thị custom fields cho khách hàng

## Quản lý thương vụ (Deal)
- [x] Danh sách thương vụ với phân trang
- [x] Tìm kiếm và lọc thương vụ
- [x] Form tạo thương vụ mới
- [x] Xem chi tiết thương vụ
- [x] Chỉnh sửa thương vụ
- [x] Xóa thương vụ
- [ ] Chuyển giai đoạn (stage) bằng kéo thả
- [ ] Hiển thị dạng Kanban board
- [ ] Hiển thị custom fields cho thương vụ

## Quản lý nhiệm vụ (Task)
- [x] Danh sách nhiệm vụ với phân trang
- [x] Tìm kiếm và lọc nhiệm vụ
- [x] Form tạo nhiệm vụ mới
- [x] Xem chi tiết nhiệm vụ
- [x] Chỉnh sửa nhiệm vụ
- [x] Xóa nhiệm vụ
- [x] Đánh dấu hoàn thành nhiệm vụ
- [x] Hiển thị nhiệm vụ quá hạn
- [x] Hiển thị nhiệm vụ sắp đến hạn
- [x] Liên kết nhiệm vụ với khách hàng và thương vụ
- [ ] Hiển thị custom fields cho nhiệm vụ

## Quản lý sản phẩm
- [ ] Danh sách sản phẩm
- [ ] Form tạo sản phẩm mới
- [ ] Xem chi tiết sản phẩm
- [ ] Chỉnh sửa sản phẩm
- [ ] Xóa sản phẩm
- [ ] Liên kết sản phẩm với thương vụ

## Dashboard và báo cáo
- [x] Dashboard tổng quan
- [ ] Biểu đồ doanh số
- [ ] Biểu đồ khách hàng
- [ ] Biểu đồ nhiệm vụ
- [ ] Báo cáo hiệu suất
- [ ] Báo cáo hoạt động
- [ ] Xuất báo cáo (PDF, Excel)

## Trường tùy chỉnh (Custom Fields)
- [x] Render custom fields trong form
- [ ] Danh sách quản lý custom fields
- [ ] Form tạo custom field mới
- [ ] Chỉnh sửa custom field
- [ ] Xóa custom field
- [ ] Kiểm tra giá trị custom field

## Phân quyền và Policy
- [x] Kiểm tra quyền với hook usePermission
- [x] Component PermissionGate để giới hạn truy cập UI
- [ ] Danh sách vai trò
- [ ] Form tạo vai trò mới
- [ ] Chỉnh sửa vai trò
- [ ] Xóa vai trò
- [ ] Gán vai trò cho người dùng
- [ ] Quản lý policy

## API Keys và Webhooks
- [ ] Danh sách API keys
- [ ] Tạo API key mới
- [ ] Xóa API key
- [ ] Danh sách webhooks
- [ ] Tạo webhook mới
- [ ] Chỉnh sửa webhook
- [ ] Xóa webhook
- [ ] Kiểm tra webhook

## Xuất/Nhập dữ liệu
- [ ] Xuất dữ liệu khách hàng (CSV, Excel)
- [ ] Xuất dữ liệu thương vụ (CSV, Excel)
- [ ] Xuất dữ liệu nhiệm vụ (CSV, Excel)
- [ ] Nhập dữ liệu khách hàng
- [ ] Nhập dữ liệu thương vụ
- [ ] Nhập dữ liệu nhiệm vụ

## Quản lý tổ chức
- [x] Xem thông tin tổ chức trong Profile
- [ ] Trang quản lý tổ chức
- [ ] Cập nhật thông tin tổ chức
- [ ] Cài đặt tổ chức
- [ ] Quản lý gói dịch vụ

## Giao diện người dùng
- [x] Responsive design
- [x] Theme sáng/tối
- [x] Navigation sidebar
- [x] Header với thông tin người dùng
- [x] Tables với phân trang
- [x] Forms với validation
- [x] Thông báo toasts
- [x] Dialog và modal
- [x] Loading states

## Tối ưu hóa
- [x] Caching dữ liệu
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] Memoization
- [ ] Bundle size optimization

## Cơ sở hạ tầng
- [x] CI/CD
- [ ] Testing
- [ ] Error tracking
- [ ] Analytics
- [ ] Monitoring

## Tài liệu
- [ ] Tài liệu API
- [ ] Hướng dẫn phát triển
- [ ] Tài liệu component
- [ ] Storybook

## Bảo mật
- [x] JWT authentication
- [x] HTTP-only cookies
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers