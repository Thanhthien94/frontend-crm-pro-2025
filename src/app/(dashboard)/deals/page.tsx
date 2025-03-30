'use client';

import { useState } from 'react';
import { useDeals } from '@/hooks/use-deals';
import { Deal, DealFormData } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { DealsTable } from '@/components/data-tables/deals-table';
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
import { Input } from '@/components/ui/input';
import DealForm from '@/components/forms/deal-form';
import { usePermission } from '@/hooks/use-permission';
import { useRouter } from 'next/navigation';

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { checkPermission } = usePermission();
  const router = useRouter();
  
  const {
    deals,
    loading,
    page,
    totalPages,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    changePage,
  } = useDeals();

  const handleViewDeal = (deal: Deal) => {
    router.push(`/deals/${deal._id}`);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDeal = async (id: string) => {
    await deleteDeal(id);
    fetchDeals(page, currentFilters);
  };

  const handleCreateSubmit = async (data: DealFormData) => {
    await createDeal(data);
    setIsCreateDialogOpen(false);
    fetchDeals(page, currentFilters);
  };

  const handleEditSubmit = async (data: DealFormData) => {
    if (selectedDeal) {
      await updateDeal(selectedDeal._id, data);
      setIsEditDialogOpen(false);
      fetchDeals(page, currentFilters);
    }
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters);
    fetchDeals(1, filters);
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
    fetchDeals(1, newFilters);
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
    delete newFilters.stage;
    
    // Áp dụng bộ lọc mới dựa trên tab
    switch (value) {
      case 'lead':
      case 'qualified':
      case 'proposal':
      case 'negotiation':
      case 'closed-won':
      case 'closed-lost':
        newFilters.stage = value;
        break;
    }
    
    setCurrentFilters(newFilters);
    fetchDeals(1, newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giao Dịch</h1>
          <p className="text-muted-foreground">
            Quản lý đường dẫn bán hàng và theo dõi cơ hội kinh doanh
          </p>
        </div>
        {checkPermission('deals', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Giao Dịch
          </Button>
        )}
      </div>
      
      {/* Giao dịch Card */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs và Bộ lọc */}
          <div className="space-y-4 mb-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="lead">Tiềm năng</TabsTrigger>
                <TabsTrigger value="qualified">Đủ điều kiện</TabsTrigger>
                <TabsTrigger value="proposal">Đề xuất</TabsTrigger>
                <TabsTrigger value="negotiation">Đàm phán</TabsTrigger>
                <TabsTrigger value="closed-won">Thành công</TabsTrigger>
                <TabsTrigger value="closed-lost">Thất bại</TabsTrigger>
              </TabsList>
            </Tabs>
          
            {/* <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Tìm kiếm giao dịch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="max-w-xs"
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div> */}
          </div>
          
          {/* Bảng giao dịch */}
          <DealsTable
            data={deals}
            pageCount={totalPages}
            currentPage={page}
            onPageChange={changePage}
            onView={handleViewDeal}
            onEdit={checkPermission('deals', 'update') ? handleEditDeal : () => {}}
            onDelete={checkPermission('deals', 'delete') ? handleDeleteDeal : async () => {}}
            onFilterChange={handleFilterChange}
            loading={loading}
          />
      
          {/* Phân trang tương tự TasksPage */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {deals.length} trong tổng số {deals.length * totalPages} giao dịch
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

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm Giao Dịch Mới</DialogTitle>
            <DialogDescription>
              Tạo cơ hội bán hàng mới trong đường dẫn của bạn.
            </DialogDescription>
          </DialogHeader>
          <DealForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Giao Dịch</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giao dịch.
            </DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <DealForm
              deal={{...selectedDeal, title: selectedDeal.title}}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}