'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Deal } from '@/types/deal';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  DollarSign, 
  User, 
  Calendar
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/use-permission';
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

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/deals/${id}`);
        setDeal(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch deal:', error);
        toast.error(error.response?.data?.error || 'Không thể lấy thông tin giao dịch');
        router.push('/deals');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeal();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      await api.delete(`/deals/${id}`);
      toast.success('Đã xóa giao dịch thành công', {
        description: 'Giao dịch đã được xóa khỏi hệ thống.',
      });
      router.push('/deals');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể xóa giao dịch');
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

  if (loading) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  if (!deal) {
    return <div>Không tìm thấy giao dịch</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push('/deals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Giao dịch
        </Button>
        <div className="flex space-x-2">
          {checkPermission('deals', 'update') && (
            <Button onClick={() => router.push(`/deals/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
          {checkPermission('deals', 'delete') && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-2xl">{deal.title}</CardTitle>
                  <CardDescription>
                    {renderStageBadge(deal.stage)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold flex items-center justify-end">
                    <DollarSign className="h-5 w-5" />
                    {deal.value.toLocaleString()}
                  </div>
                  {deal.probability !== undefined && (
                    <CardDescription>{deal.probability}% khả năng thành công</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                  <TabsTrigger value="tasks">Công việc</TabsTrigger>
                  <TabsTrigger value="activities">Hoạt động</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày dự kiến đóng</p>
                      <p>{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                      <p className="capitalize">{deal.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                      <p>{formatDate(deal.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cập nhật lần cuối</p>
                      <p>{formatDate(deal.updatedAt)}</p>
                    </div>
                  </div>
                  {deal.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ghi chú</p>
                      <p className="whitespace-pre-line mt-1">{deal.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="p-4 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">Chưa có công việc nào</h3>
                    <p className="text-sm text-gray-500">
                      Tạo một công việc mới liên quan đến giao dịch này.
                    </p>
                    <Button className="mt-4" onClick={() => router.push('/tasks/new')}>
                      Tạo công việc
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activities">
                  <div className="p-4 text-center">
                    <User className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">Chưa có hoạt động nào</h3>
                    <p className="text-sm text-gray-500">
                      Các hoạt động liên quan đến giao dịch này sẽ xuất hiện ở đây.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{deal.customer.name}</h3>
                  <p className="text-sm text-muted-foreground">{deal.customer.email}</p>
                  {deal.customer.company && (
                    <p className="text-sm">{deal.customer.company}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/customers/${deal.customer._id}`)}
                >
                  Xem khách hàng
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Người phụ trách</CardTitle>
            </CardHeader>
            <CardContent>
              {deal.assignedTo ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {deal.assignedTo.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{deal.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">{deal.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa phân công cho ai</p>
              )}
              
              {checkPermission('deals', 'update') && (
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push(`/deals/${id}/edit`)}>
                  Thay đổi phân công
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn giao dịch {deal.title}. Bạn không thể hoàn tác việc này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}