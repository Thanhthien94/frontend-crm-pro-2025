'use client';

import { useState } from 'react';
import { useCustomers } from '@/hooks/use-customers';
import { Customer, CustomerFormData } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { CustomersTable } from '@/components/data-tables/customers-table';
import { PlusCircle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import CustomerForm from '@/components/forms/customer-form';
import { usePermission } from '@/hooks/use-permission';

export default function CustomersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [searchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { checkPermission } = usePermission();
  
  const {
    customers,
    page,
    totalPages,
    totalCustomers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    changePage,
  } = useCustomers();

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
    fetchCustomers(page, currentFilters);
  };

  const handleCreateSubmit = async (data: CustomerFormData) => {
    await createCustomer(data);
    setIsCreateDialogOpen(false);
    fetchCustomers(page, currentFilters);
  };

  const handleEditSubmit = async (data: CustomerFormData) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer._id, data);
      setIsEditDialogOpen(false);
      fetchCustomers(page, currentFilters);
    }
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters);
    fetchCustomers(1, filters);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    const newFilters = { ...currentFilters };
    if (searchQuery) {
      newFilters.search = searchQuery;
    } else {
      delete newFilters.search;
    }
    setCurrentFilters(newFilters);
    fetchCustomers(1, newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Xử lý chuyển tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newFilters: Record<string, any> = { ...currentFilters };
    
    // Xóa các bộ lọc trạng thái cũ
    delete newFilters.type;
    delete newFilters.status;
    
    // Áp dụng bộ lọc mới dựa trên tab
    switch (value) {
      case 'prospect':
      case 'customer':
        newFilters.type = value;
        break;
      case 'active':
      case 'inactive':
        newFilters.status = value;
        break;
    }
    
    setCurrentFilters(newFilters);
    fetchCustomers(1, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khách hàng</h1>
          <p className="text-muted-foreground">
            Quản lý khách hàng và khách hàng tiềm năng
          </p>
        </div>
        {checkPermission('customers', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        )}
      </div>

      {/* Khách hàng Card */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs và Bộ lọc */}
          <div className="space-y-4 mb-2">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="customer">Khách hàng</TabsTrigger>
                <TabsTrigger value="prospect">Tiềm năng</TabsTrigger>
                <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
                <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Bảng khách hàng */}
          <CustomersTable
            data={customers}
            pageCount={totalPages}
            currentPage={page}
            onPageChange={changePage}
            onView={handleViewCustomer}
            onEdit={checkPermission('customers', 'update') ? handleEditCustomer : () => {}}
            onDelete={checkPermission('customers', 'delete') ? handleDeleteCustomer : async () => {}}
            onFilterChange={handleFilterChange}
          />
      
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {customers.length} trong tổng số {totalCustomers || customers.length * totalPages} khách hàng
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <div className="flex items-center text-sm">
                  Trang {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
            <DialogDescription>
              Tạo khách hàng mới hoặc khách hàng tiềm năng trong CRM của bạn.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khách hàng.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tên</h3>
                  <p>{selectedCustomer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Điện thoại</h3>
                  <p>{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Công ty</h3>
                  <p>{selectedCustomer.company || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Loại</h3>
                  <p className="capitalize">{selectedCustomer.type === 'customer' ? 'Khách hàng' : 'Tiềm năng'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                  <p className="capitalize">{selectedCustomer.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nguồn</h3>
                  <p className="capitalize">{selectedCustomer.source || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Người phụ trách</h3>
                  <p>{selectedCustomer.assignedTo?.name || 'Chưa phân công'}</p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ghi chú</h3>
                  <p className="whitespace-pre-line">{selectedCustomer.notes}</p>
                </div>
              )}
              <div className="flex justify-end">
                {checkPermission('customers', 'update') && (
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditCustomer(selectedCustomer);
                    }}
                  >
                    Chỉnh sửa khách hàng
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}