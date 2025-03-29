'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Edit, Eye, Trash, Search, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

interface CustomersTableProps {
  data: Customer[];
  currentPage: number;
  pageCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => Promise<void>;
  onFilterChange: (filters: Record<string, any>) => void;
}

export function CustomersTable({
  data,
  currentPage,
  pageCount,
  loading = false,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onFilterChange,
}: CustomersTableProps) {
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'type' && value === 'all') {
      newFilters.type = '';
    }
    if (key === 'status' && value === 'all') {
      newFilters.status = '';
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      setIsDeleting(true);
      try {
        await onDelete(customerToDelete);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setCustomerToDelete(null);
      }
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case 'lead':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'prospect':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'churned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFilterChange(filters)}
            className="max-w-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => onFilterChange(filters)}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không tìm thấy khách hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.company || 'N/A'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeClass(
                        customer.type
                      )}`}
                    >
                      {customer.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        customer.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {customer.status}
                    </span>
                  </TableCell>
                  <TableCell>{customer.source || 'N/A'}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(customer)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(customer._id)}
                        title="Xóa"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trang trước
          </Button>
          <div className="flex items-center space-x-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
          >
            Trang sau
          </Button>
        </div>
      )}

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa khách hàng vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}