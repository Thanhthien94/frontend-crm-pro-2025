"use client";

import { Task } from "@/types/task";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Edit, Trash, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TasksTableProps {
  data: Task[];
  loading: boolean;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function TasksTable({
  data,
  loading,
  onView,
  onEdit,
  onDelete,
  onComplete,
  canUpdate,
  canDelete,
}: TasksTableProps) {
  // Helper functions
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "todo":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Hàm dịch tên trạng thái
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

  // Hàm dịch tên ưu tiên
  const getPriorityName = (priority: string) => {
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

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      dueDate < today &&
      task.status !== "completed" &&
      task.status !== "canceled"
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Tiêu đề</TableHead>
            <TableHead>Ngày hết hạn</TableHead>
            <TableHead>Độ ưu tiên</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Giao cho</TableHead>
            <TableHead className="text-right pr-2">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  Đang tải...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Không tìm thấy công việc nào. Tạo công việc mới để bắt đầu.
              </TableCell>
            </TableRow>
          ) : (
            data.map((task) => (
              <TableRow
                key={task._id}
                className={
                  isTaskOverdue(task) ? "bg-red-50 dark:bg-red-950/20" : ""
                }
              >
                <TableCell className="font-medium">
                  {task.title}
                  {isTaskOverdue(task) && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                      Quá hạn
                    </span>
                  )}
                  {task.relatedTo && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Liên quan đến:{" "}
                      {task.relatedTo.model === "Customer" ? (
                        <span>Khách hàng {task.customer?.name || ""}</span>
                      ) : (
                        <span>Cơ hội {task.deal?.title || ""}</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.dueDate ? formatDate(task.dueDate) : "Không có"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                      task.priority
                    )}`}
                  >
                    {getPriorityName(task.priority)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      task.status
                    )}`}
                  >
                    {getStatusName(task.status)}
                  </span>
                </TableCell>
                <TableCell>{task.assignedTo?.name || "Chưa giao"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {
                      task.status !== "canceled" && (
                        <Button
                          disabled={task.status === "completed"}
                          variant="ghost"
                          size="icon"
                          onClick={() => onComplete(task)}
                          title="Đánh dấu hoàn thành"
                          className="cursor-pointer"
                        >
                          <CheckCircle data-active={task.status === 'completed'} className="h-4 w-4 data-[active=true]:text-green-400" />
                        </Button>
                      )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(task)}
                      title="Xem chi tiết"
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                        title="Sửa công việc"
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(task)}
                        title="Xóa công việc"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
