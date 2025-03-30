'use client';

import { useState } from 'react';
import { Deal } from '@/types/deal';
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
import { DollarSign, Edit, Eye, Trash, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
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

interface DealsTableProps {
  data: Deal[];
  currentPage: number;
  pageCount: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onView: (deal: Deal) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => Promise<void>;
  onFilterChange: (filters: Record<string, any>) => void;
}

export function DealsTable({
  data,
  currentPage,
  pageCount,
  loading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onFilterChange,
}: DealsTableProps) {
  const [filters, setFilters] = useState({
    stage: '',
    status: '',
    search: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDelete = (id: string) => {
    setDealToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (dealToDelete) {
      setIsDeleting(true);
      try {
        await onDelete(dealToDelete);
      } finally {
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
        setDealToDelete(null);
      }
    }
  };

  // Function to render stage badge with appropriate colors
  const renderStageBadge = (stage: string) => {
    const colorMap: Record<string, string> = {
      'lead': 'bg-gray-100 text-gray-800',
      'qualified': 'bg-blue-100 text-blue-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'negotiation': 'bg-yellow-100 text-yellow-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800',
    };
    
    const style = colorMap[stage] || 'bg-gray-100 text-gray-800';
    const label = stage.replace('-', ' ');
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm thương vụ..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <Select
          value={filters.stage}
          onValueChange={(value) => handleFilterChange('stage', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lọc theo giai đoạn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giai đoạn</SelectItem>
            <SelectItem value="lead">Tiềm năng</SelectItem>
            <SelectItem value="qualified">Đủ điều kiện</SelectItem>
            <SelectItem value="proposal">Đề xuất</SelectItem>
            <SelectItem value="negotiation">Đàm phán</SelectItem>
            <SelectItem value="closed-won">Đã đóng (Thành công)</SelectItem>
            <SelectItem value="closed-lost">Đã đóng (Thất bại)</SelectItem>
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
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề thương vụ</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Giai đoạn</TableHead>
              <TableHead>Ngày dự kiến đóng</TableHead>
              <TableHead>Người phụ trách</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    Đang tải thương vụ...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không tìm thấy thương vụ nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((deal) => (
                <TableRow key={deal._id}>
                  <TableCell className="font-medium">{deal.title}</TableCell>
                  <TableCell>
                    {deal.customer.name}
                    {deal.customer.company && (
                      <div className="text-xs text-muted-foreground">
                        {deal.customer.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                      {deal.value.toLocaleString()}
                      {deal.currency && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {deal.currency}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStageBadge(deal.stage)}</TableCell>
                  <TableCell>
                    {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {deal.assignedTo?.name || 'Chưa gán'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(deal)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(deal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal._id)}
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

      {/* Loại bỏ phân trang ở đây vì sẽ sử dụng phân trang ở cấp page */}

      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn thương vụ. Bạn không thể hoàn tác việc này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy bỏ</AlertDialogCancel>
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