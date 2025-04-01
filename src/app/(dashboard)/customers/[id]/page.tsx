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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  CheckSquare,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { usePermission } from "@/hooks/use-permission";
import { formatDate, formatCurrency } from "@/lib/utils";
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
import { Badge } from "@/components/ui/badge";

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
      } catch {
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
      // toast.success("Đã xóa khách hàng thành công");
      router.push("/customers");
    } catch {
      // toast.error(error.response?.data?.error || "Không thể xóa khách hàng");
      console.warn("Error deleting customer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "proposal":
        return "bg-blue-100 text-blue-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800";
      case "closed_won":
        return "bg-green-100 text-green-800";
      case "closed_lost":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "customer":
        return "Khách hàng";
      case "lead":
        return "Tiềm năng";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "proposal":
        return "Đề xuất";
      case "negotiation":
        return "Đàm phán";
      case "closed_won":
        return "Đã thắng";
      case "closed_lost":
        return "Đã thua";
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Đang chờ";
      case "in_progress":
        return "Đang xử lý";
      default:
        return status;
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
                  <TabsTrigger value="deals">Thương vụ</TabsTrigger>
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
                        {getTypeLabel(customer.type)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </p>
                      <p className="capitalize">
                        {getStatusLabel(customer.status)}
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
                    {customer.customFields &&
                      Object.keys(customer.customFields).length > 0 &&
                      Object.entries(customer.customFields).map(
                        ([key, value]) => (
                          <div key={key}>
                            <p className="text-sm font-medium text-gray-500 capitalize">
                              {key}
                            </p>
                            <p>{value}</p>
                          </div>
                        )
                      )}
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
                  {customer.relatedDeals && customer.relatedDeals.length > 0 ? (
                    <div className="space-y-4">
                      {customer.relatedDeals.map((deal) => (
                        <Card key={deal._id} className="overflow-hidden">
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  {deal.name}
                                </CardTitle>
                                <CardDescription>
                                  {formatCurrency(deal.value, deal.currency)} -{" "}
                                  {deal.probability}% xác suất
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(deal.stage)}>
                                {getStatusLabel(deal.stage)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>
                                  Dự kiến đóng:{" "}
                                  {formatDate(deal.expectedCloseDate as string)}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>Phụ trách: {deal.assignedTo?.name}</span>
                              </div>
                            </div>
                            {deal.products && deal.products.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-1">
                                  Sản phẩm:
                                </p>
                                <div className="space-y-1">
                                  {deal.products.map((product) => (
                                    <div
                                      key={product._id}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>{product.name}</span>
                                      <span>
                                        {product.quantity} x{" "}
                                        {formatCurrency(product.price)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/deals/${deal._id}`)}
                            >
                              Chi tiết
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-gray-300" />
                      <h3 className="mt-2 text-lg font-semibold">
                        Chưa có thương vụ nào
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tạo thương vụ mới cho khách hàng này để theo dõi cơ hội.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() =>
                          router.push(`/deals/new?customer=${customer._id}`)
                        }
                      >
                        Tạo thương vụ
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tasks">
                  {customer.relatedTasks && customer.relatedTasks.length > 0 ? (
                    <div className="space-y-4">
                      {customer.relatedTasks.map((task) => (
                        <Card key={task._id}>
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  {task.title}
                                </CardTitle>
                                <CardDescription>
                                  {(task.description as string)?.substring(0, 100)}
                                  {(task.description as string)?.length > 100 ? "..." : ""}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className={getStatusColor(task.status)}>
                                  {getStatusLabel(task.status)}
                                </Badge>
                                <Badge
                                  className={getPriorityColor(task.priority)}
                                >
                                  {task.priority === "high"
                                    ? "Cao"
                                    : task.priority === "medium"
                                    ? "Trung bình"
                                    : "Thấp"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Hạn: {formatDate(task.dueDate as string)}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span>Phụ trách: {task.assignedTo?.name}</span>
                              </div>
                              {task.isRecurring && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>
                                    Lặp lại:{" "}
                                    {task.recurringFrequency === "daily"
                                      ? "Hàng ngày"
                                      : task.recurringFrequency === "weekly"
                                      ? "Hàng tuần"
                                      : task.recurringFrequency === "monthly"
                                      ? "Hàng tháng"
                                      : "Định kỳ"}
                                  </span>
                                </div>
                              )}
                              {task.completedAt && (
                                <div className="flex items-center">
                                  <CheckSquare className="h-4 w-4 mr-1" />
                                  <span>
                                    Hoàn thành: {formatDate(task.completedAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {task.deal && (
                              <div className="mt-2 text-sm flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>
                                  Liên quan đến thương vụ: {task.deal.name}
                                </span>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/tasks/${task._id}`)}
                            >
                              Chi tiết
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
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
                        onClick={() =>
                          router.push(`/tasks/new?customer=${customer._id}`)
                        }
                      >
                        Tạo công việc
                      </Button>
                    </div>
                  )}
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

              {checkPermission("customer", "update") && (
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
