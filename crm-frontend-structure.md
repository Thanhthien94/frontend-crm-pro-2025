# Cấu trúc Frontend CRM dựa theo Backend

## 1. Cấu trúc thư mục

```
src/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Các trang xác thực
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/           # Các trang được bảo vệ
│   │   ├── dashboard/
│   │   ├── customers/
│   │   ├── deals/
│   │   ├── tasks/
│   │   ├── products/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── profile/
│   ├── globals.css            # Global CSS
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Homepage
│   └── providers.tsx          # Client providers
├── components/                # React components
│   ├── auth/                  # Auth components
│   ├── custom-fields/         # Custom fields components
│   ├── data-tables/           # Table components cho từng entity
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   └── ui/                    # UI components (shadcn/ui)
├── contexts/                  # React contexts
│   ├── auth-context.tsx       # Auth context
│   └── ...
├── hooks/                     # Custom hooks
│   ├── use-auth.ts            # Đã tích hợp trong auth-context
│   ├── use-customers.ts       # Hook quản lý khách hàng
│   ├── use-deals.ts           # Hook quản lý thương vụ
│   ├── use-tasks.ts           # Hook quản lý nhiệm vụ
│   ├── use-products.ts        # Hook quản lý sản phẩm
│   ├── use-permission.ts      # Hook quản lý phân quyền
│   └── ...
├── lib/                       # Utility functions
│   ├── api.ts                 # Axios instance
│   ├── auth.ts                # Auth helpers
│   ├── utils.ts               # Utility functions
│   └── ...
├── services/                  # API service modules
│   ├── authService.ts         # Auth API
│   ├── customerService.ts     # Customer API
│   ├── dealService.ts         # Deal API
│   ├── taskService.ts         # Task API
│   ├── productService.ts      # Product API
│   ├── customFieldService.ts  # Custom field API
│   ├── analyticsService.ts    # Analytics API
│   └── ...
└── types/                     # TypeScript definitions
    ├── user.ts                # User types
    ├── customer.ts            # Customer types
    ├── deal.ts                # Deal types
    ├── task.ts                # Task types
    ├── product.ts             # Product types
    └── ...
```

## 2. Cấu trúc API

### 2.1. Xác thực (Authentication)
- Endpoint base: `/api/v1/auth`
- JWT token lưu trong HTTP-only cookie
- Các phương thức:
  - `POST /register`: Đăng ký tài khoản mới
  - `POST /login`: Đăng nhập
  - `GET /me`: Lấy thông tin người dùng hiện tại
  - `GET /logout`: Đăng xuất
  - `POST /forgot-password`: Yêu cầu đặt lại mật khẩu
  - `POST /reset-password`: Đặt lại mật khẩu

### 2.2. Quản lý người dùng
- Endpoint base: `/api/v1/users`
- Các phương thức:
  - `GET /`: Lấy danh sách người dùng
  - `POST /`: Tạo người dùng mới
  - `PUT /:id`: Cập nhật người dùng
  - `DELETE /:id`: Xóa người dùng

### 2.3. Quản lý khách hàng
- Endpoint base: `/api/v1/customers`
- Các phương thức:
  - `GET /`: Lấy danh sách khách hàng (hỗ trợ phân trang, lọc)
  - `POST /`: Tạo khách hàng mới
  - `GET /:id`: Lấy chi tiết khách hàng
  - `PATCH /:id`: Cập nhật khách hàng
  - `DELETE /:id`: Xóa khách hàng
  - `GET /by-type/:type`: Lấy khách hàng theo loại
  - `GET /assigned-to/me`: Lấy khách hàng được gán cho người dùng hiện tại
  - `PATCH /:id/assign`: Gán khách hàng cho người dùng khác
  - `GET /stats/by-type`: Thống kê khách hàng theo loại

### 2.4. Quản lý thương vụ
- Endpoint base: `/api/v1/deals`
- Các phương thức:
  - `GET /`: Lấy danh sách thương vụ (hỗ trợ phân trang, lọc)
  - `POST /`: Tạo thương vụ mới
  - `GET /:id`: Lấy chi tiết thương vụ
  - `PATCH /:id`: Cập nhật thương vụ
  - `DELETE /:id`: Xóa thương vụ
  - `GET /summary`: Lấy tổng hợp thương vụ

### 2.5. Quản lý nhiệm vụ
- Endpoint base: `/api/v1/tasks`
- Các phương thức:
  - `GET /`: Lấy danh sách nhiệm vụ (hỗ trợ phân trang, lọc)
  - `POST /`: Tạo nhiệm vụ mới
  - `GET /:id`: Lấy chi tiết nhiệm vụ
  - `PATCH /:id`: Cập nhật nhiệm vụ
  - `DELETE /:id`: Xóa nhiệm vụ
  - `GET /upcoming`: Lấy nhiệm vụ sắp tới
  - `GET /overdue`: Lấy nhiệm vụ quá hạn
  - `GET /summary`: Lấy tổng hợp nhiệm vụ

### 2.6. Quản lý sản phẩm
- Endpoint base: `/api/v1/products`
- Các phương thức:
  - `GET /`: Lấy danh sách sản phẩm (hỗ trợ phân trang, lọc)
  - `POST /`: Tạo sản phẩm mới
  - `GET /:id`: Lấy chi tiết sản phẩm
  - `PATCH /:id`: Cập nhật sản phẩm
  - `DELETE /:id`: Xóa sản phẩm

### 2.7. Phân tích (Analytics)
- Endpoint base: `/api/v1/analytics`
- Các phương thức:
  - `GET /dashboard`: Lấy dữ liệu cho dashboard
  - `GET /sales`: Phân tích doanh số
  - `GET /customers`: Phân tích khách hàng
  - `GET /activities`: Phân tích hoạt động
  - `GET /performance`: Phân tích hiệu suất

### 2.8. Quản lý trường tùy chỉnh
- Endpoint base: `/api/v1/custom-fields`
- Các phương thức:
  - `GET /`: Lấy danh sách trường tùy chỉnh
  - `POST /`: Tạo trường tùy chỉnh mới
  - `GET /:id`: Lấy chi tiết trường tùy chỉnh
  - `PATCH /:id`: Cập nhật trường tùy chỉnh
  - `DELETE /:id`: Xóa trường tùy chỉnh
  - `GET /entity/:entity`: Lấy trường tùy chỉnh theo loại đối tượng
  - `POST /validate`: Kiểm tra dữ liệu trường tùy chỉnh

### 2.9. Quản lý phân quyền
- Endpoint base: `/api/v1/permissions`
- Các phương thức:
  - `GET /list`: Lấy danh sách quyền
  - `GET /roles`: Lấy danh sách vai trò
  - `POST /roles`: Tạo vai trò mới
  - `PATCH /roles/:id`: Cập nhật vai trò
  - `DELETE /roles/:id`: Xóa vai trò
  - `POST /roles/:id/assign`: Gán vai trò cho người dùng
  - `POST /roles/:id/revoke`: Thu hồi vai trò từ người dùng

### 2.10. Quản lý API Keys
- Endpoint base: `/api/v1/api-keys`
- Các phương thức:
  - `GET /`: Lấy danh sách API keys
  - `POST /`: Tạo API key mới
  - `GET /:id`: Lấy chi tiết API key
  - `PATCH /:id`: Cập nhật thông tin API key
  - `DELETE /:id`: Xóa API key
  - `POST /:id/regenerate`: Tạo lại key
  - `PATCH /:id/permissions`: Cập nhật quyền

### 2.11. Quản lý Webhooks
- Endpoint base: `/api/v1/webhooks`
- Các phương thức:
  - `GET /`: Lấy danh sách webhooks
  - `POST /`: Tạo webhook mới
  - `GET /:id`: Lấy chi tiết webhook
  - `PATCH /:id`: Cập nhật webhook
  - `DELETE /:id`: Xóa webhook
  - `POST /:id/reset-secret`: Đặt lại secret key
  - `POST /:id/test`: Kiểm tra webhook

### 2.12. Xuất/Nhập dữ liệu
- Endpoint base: `/api/v1/export` và `/api/v1/import`
- Các phương thức:
  - `GET /export`: Xuất dữ liệu (hỗ trợ format CSV, JSON, Excel)
  - `POST /import`: Nhập dữ liệu từ file
  - `POST /import/template`: Lấy mẫu nhập dữ liệu

### 2.13. Quản lý tổ chức
- Endpoint base: `/api/v1/organization`
- Các phương thức:
  - `GET /`: Lấy thông tin tổ chức
  - `PUT /`: Cập nhật tổ chức
  - `PUT /settings`: Cập nhật cài đặt tổ chức

## 3. Mô hình dữ liệu

### 3.1. User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    plan?: string;
  };
}
```

### 3.2. Customer
```typescript
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'lead' | 'prospect' | 'customer' | 'churned';
  status: 'active' | 'inactive';
  source?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### 3.3. Deal
```typescript
interface Deal {
  _id: string;
  title: string;
  value: number;
  currency?: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expectedCloseDate?: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  customFields?: Record<string, any>;
  probability?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
```

### 3.4. Task
```typescript
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  relatedTo?: {
    model: 'Customer' | 'Deal';
    id: string;
  };
  customer?: {
    _id: string;
    name: string;
    company?: string;
    email?: string;
  };
  deal?: {
    _id: string;
    title: string;
    value?: number;
  };
  reminderDate?: string;
  completedDate?: string;
  completedBy?: string | { _id: string; name: string; email: string };
  isRecurring: boolean;
  recurringFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### 3.5. Product
```typescript
interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stock?: number;
  customFields?: Record<string, any>;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
```

### 3.6. CustomField
```typescript
interface CustomField {
  _id: string;
  name: string;
  key: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
  entity: 'customer' | 'deal' | 'task' | 'product';
  required: boolean;
  description?: string;
  options?: string[];
  defaultValue?: any;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}
```

## 4. Các chức năng chính

### 4.1. Xác thực và phân quyền
- Đăng nhập/đăng ký
- Phân quyền dựa trên vai trò
- Bảo vệ route với AuthGuard
- Kiểm tra quyền truy cập với usePermission hook

### 4.2. Quản lý khách hàng
- Danh sách khách hàng với phân trang, tìm kiếm, lọc
- Chi tiết khách hàng
- Tạo/cập nhật/xóa khách hàng
- Gán khách hàng cho nhân viên
- Thống kê khách hàng

### 4.3. Quản lý thương vụ
- Danh sách thương vụ với phân trang, tìm kiếm, lọc
- Pipeline view (Kanban board) theo giai đoạn
- Chi tiết thương vụ
- Tạo/cập nhật/xóa thương vụ
- Chuyển giai đoạn thương vụ
- Thống kê thương vụ

### 4.4. Quản lý nhiệm vụ
- Danh sách nhiệm vụ với phân trang, tìm kiếm, lọc
- Calendar view cho nhiệm vụ
- Chi tiết nhiệm vụ
- Tạo/cập nhật/xóa nhiệm vụ
- Đánh dấu hoàn thành nhiệm vụ
- Liên kết nhiệm vụ với khách hàng và thương vụ
- Nhiệm vụ lặp lại

### 4.5. Dashboard và báo cáo
- Dashboard tổng quan với KPI chính
- Biểu đồ doanh số
- Biểu đồ khách hàng
- Biểu đồ nhiệm vụ
- Báo cáo hiệu suất
- Xuất báo cáo

### 4.6. Quản lý trường tùy chỉnh
- Render trường tùy chỉnh trong form
- Quản lý trường tùy chỉnh
- Validation trường tùy chỉnh

### 4.7. Quản lý API Keys và Webhooks
- Tạo và quản lý API keys
- Tạo và quản lý webhooks
- Kiểm tra webhook

### 4.8. Xuất/Nhập dữ liệu
- Xuất dữ liệu sang định dạng khác nhau
- Nhập dữ liệu từ file

### 4.9. Quản lý tổ chức
- Thông tin tổ chức
- Cài đặt tổ chức
- Quản lý gói dịch vụ

## 5. Giao diện người dùng

### 5.1. Layout chung
- Sidebar điều hướng
- Header với thông tin người dùng
- Dark mode / Light mode

### 5.2. Danh sách
- Bảng dữ liệu với phân trang
- Tìm kiếm và lọc
- Bulk actions

### 5.3. Form
- Validation với Zod
- Custom fields
- Responsive design

### 5.4. Chi tiết
- Tabs cho các thông tin khác nhau
- Liên kết giữa các module
- Actions (sửa, xóa, v.v.)
