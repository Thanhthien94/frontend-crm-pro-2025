import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Edit,
  MessageSquare,
  Trash2,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { taskService } from "@/services/taskService";
import { useTasks } from "@/hooks/use-tasks";

interface Activity {
  _id: string;
  type:
    | "created"
    | "updated"
    | "completed"
    | "deleted"
    | "comment"
    | "status_change";
  description: string;
  user: {
    _id: string;
    name: string;
  };
  timestamp: string;
  details?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
    status?: string;
  };
}

interface TaskActivityProps {
  taskId: string;
}

export function TaskActivity({ taskId }: TaskActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getTaskActivities } = taskService;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await getTaskActivities(taskId);
        setActivities(response.data.data || []);
      } catch (error: any) {
        console.error("Error fetching task activities:", error);
        setError(
          error.response?.data?.error || "Không thể tải hoạt động của công việc"
        );

        // Dữ liệu mẫu để hiển thị nếu API không có sẵn
        if (loading && !activities.length) {
          const demoActivities: Activity[] = [
            {
              _id: "1",
              type: "created",
              description: "Tạo công việc mới",
              user: {
                _id: "user1",
                name: "Nguyễn Văn A",
              },
              timestamp: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              _id: "2",
              type: "updated",
              description: "Cập nhật thông tin công việc",
              user: {
                _id: "user2",
                name: "Trần Thị B",
              },
              timestamp: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              details: {
                field: "priority",
                oldValue: "medium",
                newValue: "high",
              },
            },
            {
              _id: "3",
              type: "status_change",
              description: "Thay đổi trạng thái",
              user: {
                _id: "user1",
                name: "Nguyễn Văn A",
              },
              timestamp: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              details: {
                oldValue: "todo",
                newValue: "in_progress",
              },
            },
            {
              _id: "4",
              type: "comment",
              description:
                'Đã bình luận: "Cần hoàn thành công việc này trước ngày 15"',
              user: {
                _id: "user3",
                name: "Lê Văn C",
              },
              timestamp: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ];
          setActivities(demoActivities);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [taskId, loading, activities.length]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <Calendar className="h-5 w-5 text-green-500" />;
      case "updated":
        return <Edit className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "deleted":
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "status_change":
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <User className="h-5 w-5 text-gray-500" />;
    }
  };

  // Hàm để render chi tiết của hoạt động
  const renderActivityDetails = (activity: Activity) => {
    if (!activity.details) return null;

    switch (activity.type) {
      case "updated":
        return (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">{activity.details.field}: </span>
            <span className="line-through">{activity.details.oldValue}</span>
            {" → "}
            <span>{activity.details.newValue}</span>
          </div>
        );
      case "status_change":
        const getStatusName = (status: string = "") => {
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

        return (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="line-through">
              {getStatusName(activity.details.oldValue)}
            </span>
            {" → "}
            <span className="font-medium">
              {getStatusName(activity.details.newValue)}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Đang tải hoạt động...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>Không thể tải hoạt động: {error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-lg font-medium">Chưa có hoạt động nào</p>
        <p className="text-sm">
          Các hoạt động liên quan đến công việc này sẽ được hiển thị tại đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative pl-6 border-l-2 border-muted space-y-8">
        {activities.map((activity) => (
          <div key={activity._id} className="relative pb-1">
            {/* Dot marker */}
            <div className="absolute w-4 h-4 rounded-full bg-background border-2 border-primary -left-[0.65rem] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </div>

            {/* Activity content */}
            <div className="ml-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {activity.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mt-1 flex items-center gap-1.5">
                    {getActivityIcon(activity.type)}
                    <span>{activity.description}</span>
                  </p>
                  {renderActivityDetails(activity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
