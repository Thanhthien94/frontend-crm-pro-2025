"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Customer } from "@/types/customer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, DollarSign, CheckSquare } from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { usePermission } from "@/hooks/use-permission";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { checkPermission } = usePermission();
  const { getCustomer, deleteCustomer } = useCustomers();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const customerData = await getCustomer(id as string);
        setCustomer(customerData);
      } catch (error: any) {
        console.error("Failed to fetch customer:", error);
        toast.error("Không thể lấy thông tin khách hàng", {
          description: error.response?.data?.error || "Đã xảy ra lỗi",
        });
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router, getCustomer]);

  const handleDelete = async () => {
    try {
      await deleteCustomer(id as string);
      toast.success("Đã xóa khách hàng thành công");
      router.push("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Không thể xóa khách hàng");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Đang tải...</div>
    );
  }

  if (!customer) {
    return <div>Không tìm thấy khách hàng</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex space-x-2">
          {checkPermission("customer", "update") && (
            <Button onClick={() => router.push(`/customers/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
          {checkPermission("customer", "delete") && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
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
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                  <TabsTrigger value="deals">Giao dịch</TabsTrigger>
                  <TabsTrigger value="tasks">Công việc</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Điện thoại
                      </p>
                      <p>{customer.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Công ty
                      </p>
                      <p>{customer.company || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Loại</p>
                      <p className="capitalize">
                        {customer.type === "customer"
                          ? "Khách hàng"
                          : "Tiềm năng"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </p>
                      <p className="capitalize">
                        {customer.status === "active"
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nguồn</p>
                      <p className="capitalize">{customer.source || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Ngày tạo
                      </p>
                      <p>{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                  {customer.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Ghi chú
                      </p>
                      <p className="whitespace-pre-line mt-1">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="deals">
                  <div className="p-4 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">
                      Chưa có giao dịch nào
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tạo giao dịch mới cho khách hàng này để theo dõi cơ hội.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/deals/new")}
                    >
                      Tạo giao dịch
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="p-4 text-center">
                    <CheckSquare className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">
                      Chưa có công việc nào
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tạo công việc mới liên quan đến khách hàng này.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/tasks/new")}
                    >
                      Tạo công việc
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Người phụ trách</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.assignedTo ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {customer.assignedTo.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.assignedTo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa phân công cho ai</p>
              )}

              {checkPermission("customers", "update") && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push(`/customers/${id}/edit`)}
                >
                  Thay đổi phân công
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn khách hàng {customer.name}. Bạn
              không thể hoàn tác việc này.
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
