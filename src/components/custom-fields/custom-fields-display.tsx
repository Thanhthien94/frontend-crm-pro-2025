// src/components/custom-fields/custom-fields-display.tsx
import { useEffect, useState } from "react";
import { customFieldService } from "@/services/customFieldService";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CustomField {
  id: string;
  name: string;
  key: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date" | "number";
  entity: string;
  required: boolean;
  description?: string;
  options?: string[];
  defaultValue?: any;
}

interface CustomFieldsDisplayProps {
  entity: "customer" | "deal" | "task" | "product";
  values: Record<string, any>;
}

export function CustomFieldsDisplay({
  entity,
  values,
}: CustomFieldsDisplayProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        setLoading(true);
        const response = await customFieldService.getCustomFieldsByEntity(
          entity
        );
        setFields(response.data.data || []);
      } catch (error: any) {
        console.error("Lỗi khi tải custom fields:", error);
        setError(
          error.response?.data?.error || "Không thể tải trường tùy chỉnh"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomFields();

    // Demo fields nếu không có API
    setTimeout(() => {
      if (loading && !fields.length) {
        // Mock data cho trường hợp demo
        const mockFields: CustomField[] = [
          {
            id: "1",
            name: "Độ ưu tiên kinh doanh",
            key: "business_priority",
            type: "select",
            entity: entity,
            required: false,
            options: ["Cao", "Trung bình", "Thấp"],
            description: "Mức độ ưu tiên về mặt kinh doanh",
          },
          {
            id: "2",
            name: "Mã dự án",
            key: "project_code",
            type: "text",
            entity: entity,
            required: false,
            description: "Mã dự án liên quan",
          },
          {
            id: "3",
            name: "Ngày dự kiến mở rộng",
            key: "expansion_date",
            type: "date",
            entity: entity,
            required: false,
          },
          {
            id: "4",
            name: "Ghi chú đặc biệt",
            key: "special_notes",
            type: "textarea",
            entity: entity,
            required: false,
          },
          {
            id: "5",
            name: "Đã phê duyệt",
            key: "is_approved",
            type: "checkbox",
            entity: entity,
            required: false,
          },
        ];

        setFields(mockFields);
        setLoading(false);
      }
    }, 1000);
  }, [entity]);

  const formatValue = (field: CustomField, value: any) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-muted-foreground italic">Không có</span>;
    }

    switch (field.type) {
      case "checkbox":
        return value ? "Có" : "Không";
      case "date":
        try {
          const date = new Date(value);
          return date.toLocaleDateString("vi-VN");
        } catch (error) {
          return value;
        }
      case "textarea":
        return <div className="whitespace-pre-line">{value}</div>;
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Đang tải trường tùy chỉnh...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive py-2">Lỗi: {error}</div>;
  }

  // Lọc và chỉ hiển thị các fields có giá trị
  const fieldsWithValues = fields.filter((field) => {
    const value = values[field.key];
    return value !== undefined && value !== null && value !== "";
  });

  if (fieldsWithValues.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>Không có dữ liệu trường tùy chỉnh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {fieldsWithValues.map((field) => (
          <div key={field.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{field.name}</h4>
              {field.description && (
                <span
                  className="inline-block text-xs text-muted-foreground hover:text-foreground cursor-help"
                  title={field.description}
                >
                  ℹ️
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatValue(field, values[field.key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
