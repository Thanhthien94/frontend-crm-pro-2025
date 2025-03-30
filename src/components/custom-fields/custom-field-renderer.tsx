"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface CustomFieldProps {
  field: {
    id: string;
    name: string;
    key: string;
    type: "text" | "textarea" | "select" | "checkbox" | "date" | "number";
    entity: string;
    required: boolean;
    description?: string;
    options?: string[];
    defaultValue?: any;
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function CustomFieldRenderer({
  field,
  value,
  onChange,
  disabled = false,
}: CustomFieldProps) {
  // Render field dựa trên type
  switch (field.type) {
    case "text":
      return (
        <Input
          id={field.key}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.name}
          disabled={disabled}
        />
      );

    case "textarea":
      return (
        <Textarea
          id={field.key}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.name}
          disabled={disabled}
        />
      );

    case "select":
      return (
        <Select
          value={value || ""}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.name} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "checkbox":
      return (
        <Checkbox
          id={field.key}
          checked={value || false}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      );

    case "date":
      return (
        <Input
          id={field.key}
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case "number":
      return (
        <Input
          id={field.key}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    default:
      return null;
  }
}

// Hook để tải custom fields
export function useCustomFields(entity: "customer" | "deal" | "task") {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await api.get(`/custom-fields/entity/${entity}`);
        setFields(response.data.data || []);
      } catch (error) {
        console.error("Error fetching custom fields:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomFields();
  }, [entity]);

  return { fields, loading };
}

// Component để render nhiều custom fields
export function CustomFieldsSection({
  entity,
  values,
  onChange,
  disabled = false,
}: {
  entity: "customer" | "deal" | "task";
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}) {
  const { fields, loading } = useCustomFields(entity);

  if (loading) return <div>Loading custom fields...</div>;

  if (fields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium">
              {field.name}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <CustomFieldRenderer
              field={field}
              value={values[field.key]}
              onChange={(value) => onChange(field.key, value)}
              disabled={disabled}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
