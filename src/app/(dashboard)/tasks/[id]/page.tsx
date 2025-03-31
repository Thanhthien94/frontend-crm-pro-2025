"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Task } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building,
  DollarSign,
  AlertCircle,
  MessageSquare,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/hooks/use-permission";
import { formatDate, formatDateTime } from "@/lib/utils";
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
import { Separator } from "@/components/ui/separator";
import { TaskActivity } from "@/components/tasks/task-activity";
import { CustomFieldsDisplay } from "@/components/custom-fields/custom-fields-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTasks } from "@/hooks/use-tasks";

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const { checkPermission } = usePermission();

  // Sử dụng hook useTasks thay vì gọi API trực tiếp
  const { fetchTask, deleteTask, updateTask, completeTask } = useTasks();

  // Tải thông tin task
  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        const taskData = await fetchTask(id as string);
        setTask(taskData);
      } catch {
        router.push("/tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id, router, fetchTask]);

  // Xử lý xóa task
  const handleDelete = async () => {
    await deleteTask(id as string);
  };

  // Xử lý hoàn thành task
  const handleComplete = async () => {
    setStatusChanging(true);
    const updatedTask = await completeTask(id as string);

    // Cập nhật task trong state
    setTask(updatedTask);
    setIsCompleteDialogOpen(false);
    setStatusChanging(false);
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (newStatus: string) => {
    try {
      setStatusChanging(true);

      const updatedTask = await updateTask(id as string, {
        status: newStatus,
        ...(newStatus === "completed"
          ? { completedDate: new Date().toISOString() }
          : {}),
      });

      // Cập nhật task trong state
      setTask(updatedTask);

      toast.success(`Đã cập nhật trạng thái sang ${getStatusName(newStatus)}`);
    } catch {
    } finally {
      setStatusChanging(false);
    }
  };

  // Lấy tên ưu tiên từ giá trị
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Cao";
      case "medium":
        return "Trung bình";
      case "low":
        return "Thấp";
      default:
        return priority;
    }
  };

  // Lấy tên trạng thái từ giá trị
  const getStatusName = (status: string) => {
    switch (status) {
      case "todo":
        return "Cần làm";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Lấy class cho ưu tiên
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Lấy class cho trạng thái
  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "todo":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300";
    }
  };

  // Kiểm tra xem task có quá hạn không
  const isTaskOverdue = (task: Task) => {
    if (
      !task.dueDate ||
      task.status === "completed" ||
      task.status === "canceled"
    )
      return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Tính toán thời gian còn lại/quá hạn
  const getDueStatus = (task: Task) => {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.status === "completed" || task.status === "canceled") {
      return null;
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: "overdue",
        days: Math.abs(diffDays),
        message: `Quá hạn ${Math.abs(diffDays)} ngày`,
      };
    } else if (diffDays === 0) {
      return {
        type: "today",
        days: 0,
        message: "Đến hạn hôm nay",
      };
    } else if (diffDays <= 2) {
      return {
        type: "soon",
        days: diffDays,
        message: `Còn ${diffDays} ngày`,
      };
    }

    return {
      type: "normal",
      days: diffDays,
      message: `Còn ${diffDays} ngày`,
    };
  };

  const renderDueStatus = (task: Task) => {
    const status = getDueStatus(task);
    if (!status) return null;

    const classMap = {
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      today:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      normal:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          classMap[status.type as keyof typeof classMap]
        }`}
      >
        {status.message}
      </span>
    );
  };

  // Rendering
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Đang tải thông tin công việc...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg">Không tìm thấy công việc</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/tasks")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const canComplete =
    task.status !== "completed" && task.status !== "canceled";
  const canChangeStatus =
    task.status !== "completed" && task.status !== "canceled";

  return (
    <div className="space-y-6">
      {/* Header với actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => router.push("/tasks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
          <h1 className="ml-4 text-2xl font-bold tracking-tight hidden sm:block">
            Chi tiết công việc
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {canChangeStatus && (
            <div className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap">
                Thay đổi trạng thái:
              </span>
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
                disabled={statusChanging}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Cần làm</SelectItem>
                  <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {canComplete && (
            <Button
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => setIsCompleteDialogOpen(true)}
              disabled={statusChanging}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Hoàn thành
            </Button>
          )}

          {checkPermission("task", "update") && (
            <Button onClick={() => router.push(`/tasks/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}

          {checkPermission("task", "delete") && (
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

      {/* Title card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              {isTaskOverdue(task) && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-300">
                  Quá hạn
                </span>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(
                  task.priority
                )}`}
              >
                {getPriorityLabel(task.priority)}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                  task.status
                )}`}
              >
                {getStatusName(task.status)}
              </span>
              {renderDueStatus(task)}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Chi tiết</TabsTrigger>
              <TabsTrigger value="links">Liên kết</TabsTrigger>
              <TabsTrigger value="activities">Hoạt động</TabsTrigger>
              {task.customFields &&
                Object.keys(task.customFields).length > 0 && (
                  <TabsTrigger value="custom-fields">
                    Trường tùy chỉnh
                  </TabsTrigger>
                )}
            </TabsList>

            {/* Chi tiết tab */}
            <TabsContent value="details" className="space-y-4">
              {task.description && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Mô tả</h3>
                  <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
                    {task.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 py-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Ngày hết hạn</p>
                    <p className="text-muted-foreground">
                      {task.dueDate ? formatDate(task.dueDate) : "Không có"}
                    </p>
                  </div>
                </div>

                {task.completedDate && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Ngày hoàn thành</p>
                      <p className="text-muted-foreground">
                        {formatDate(task.completedDate)}
                      </p>
                      {task.completedBy && (
                        <p className="text-xs text-muted-foreground">
                          Người hoàn thành:{" "}
                          {typeof task.completedBy === "string"
                            ? "ID: " + task.completedBy
                            : task.completedBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {task.reminderDate && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Nhắc nhở</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(task.reminderDate)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Người phụ trách</p>
                    <p className="text-muted-foreground">
                      {task.assignedTo?.name || "Chưa giao cho ai"}
                    </p>
                  </div>
                </div>
              </div>

              {task.isRecurring && task.recurringFrequency !== "none" && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Thông tin lặp lại</h3>
                  <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium">Công việc lặp lại</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {task.recurringFrequency === "daily" && "Hàng ngày"}
                        {task.recurringFrequency === "weekly" && "Hàng tuần"}
                        {task.recurringFrequency === "monthly" && "Hàng tháng"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Links tab */}
            <TabsContent value="links" className="space-y-4">
              {!task.relatedTo ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Building className="h-16 w-16 text-muted-foreground/40 mb-4" />
                  <p className="text-lg font-medium">Không có liên kết nào</p>
                  <p className="text-sm">
                    Công việc này không được liên kết với bất kỳ khách hàng hoặc
                    thương vụ nào
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {task.relatedTo.model === "Customer" && task.customer && (
                    <div className="bg-muted/30 p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">Khách hàng liên quan</h3>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-lg">
                            {task.customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {task.customer.email}
                          </p>
                          {task.customer.company && (
                            <p className="text-sm text-muted-foreground">
                              {task.customer.company}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/customers/${task.customer?._id}`)
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  )}

                  {task.relatedTo.model === "Deal" && task.deal && (
                    <div className="bg-muted/30 p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">Cơ hội liên quan</h3>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-lg">
                            {task.deal.title}
                          </p>
                          <div className="flex items-center mt-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                            <p className="text-sm text-muted-foreground">
                              {task.deal.value?.toLocaleString() || 0} VND
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/deals/${task.deal?._id}`)
                          }
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Hoạt động tab */}
            <TabsContent value="activities" className="py-2">
              <TaskActivity taskId={task._id} />
            </TabsContent>

            {/* Custom fields tab */}
            {task.customFields && Object.keys(task.customFields).length > 0 && (
              <TabsContent value="custom-fields" className="py-2">
                <CustomFieldsDisplay entity="task" values={task.customFields} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Thông tin thêm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Người phụ trách */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Người phụ trách</CardTitle>
          </CardHeader>
          <CardContent>
            {task.assignedTo ? (
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{task.assignedTo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.assignedTo.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 bg-muted">
                  <AvatarFallback className="text-muted-foreground">
                    ?
                  </AvatarFallback>
                </Avatar>
                <p className="text-muted-foreground">Chưa giao cho ai</p>
              </div>
            )}

            {checkPermission("task", "update") && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => router.push(`/tasks/${id}/edit`)}
              >
                Thay đổi người phụ trách
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Thông tin khác */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin tạo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Tạo bởi</p>
                {task.createdBy ? (
                  <p className="text-sm text-muted-foreground">
                    {task.createdBy.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Không có thông tin
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Ngày tạo</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Cập nhật lần cuối</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(task.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nút tương tác bổ sung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checkPermission("task", "update") && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/tasks/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa công việc
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/tasks/new")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo công việc mới
            </Button>

            {task.relatedTo?.model === "Customer" && task.customer && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/customers/${task.customer?._id}`)}
              >
                <Building className="mr-2 h-4 w-4" />
                Xem khách hàng
              </Button>
            )}

            {task.relatedTo?.model === "Deal" && task.deal && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/deals/${task.deal?._id}`)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Xem thương vụ
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() =>
                (window.location.href = `mailto:${
                  task.assignedTo?.email || ""
                }`)
              }
              disabled={!task.assignedTo}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Liên hệ người phụ trách
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn công việc &quot;{task.title}&quot;. Không thể
              hoàn tác thao tác này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hoàn thành công việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đánh dấu công việc &quot;{task.title}&quot; là đã hoàn
              thành?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Hoàn thành
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
