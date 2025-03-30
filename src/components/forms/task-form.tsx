'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Task, TaskFormData } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { mapApiDataToTaskForm } from '@/utils/tasks-mapper';
import { taskService } from '@/services/taskService';
import api from '@/lib/api';
import { Customer } from '@/types/customer';
import { Deal } from '@/types/deal';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string(),
  status: z.string(),
  assignedTo: z.string().optional(),
  relatedTo: z.object({
    model: z.string().optional(),
    id: z.string().optional(),
  }).optional(),
  reminderDate: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringFrequency: z.string().optional().default("none"),
});

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  preselectedRelation?: {
    model: 'Customer' | 'Deal';
    id: string;
    name: string;
  };
  isSubmitting?: boolean;
}

export default function TaskForm({ 
  task, 
  onSubmit, 
  onCancel, 
  preselectedRelation,
  isSubmitting = false 
}: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [relatedModel, setRelatedModel] = useState<string | undefined>(
    task?.relatedTo?.model || preselectedRelation?.model || undefined
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task?.priority || 'medium',
      status: task?.status || 'pending',
      assignedTo: task?.assignedTo?._id || '',
      relatedTo: {
        model: task?.relatedTo?.model || preselectedRelation?.model || '',
        id: task?.relatedTo?.id || preselectedRelation?.id || '',
      },
      reminderDate: task?.reminderDate ? new Date(task.reminderDate).toISOString().split('T')[0] : '',
      isRecurring: task?.isRecurring || false,
      recurringFrequency: task?.recurringFrequency || 'none',
    },
  });

  useEffect(() => {
    // If a preselected relation is provided, update the form
    if (preselectedRelation && !task) {
      form.setValue('relatedTo.model', preselectedRelation.model);
      form.setValue('relatedTo.id', preselectedRelation.id);
      setRelatedModel(preselectedRelation.model);
    }
  }, [preselectedRelation, form, task]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.data.map((user: any) => ({
          id: user._id,
          name: user.name,
        })));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers?limit=100');
        setCustomers(response.data.data.map((customer: Customer) => ({
          id: customer._id,
          name: customer.name + (customer.company ? ` (${customer.company})` : ''),
        })));
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    
    const fetchDeals = async () => {
      try {
        const response = await api.get('/deals?limit=100');
        setDeals(response.data.data.map((deal: Deal) => ({
          id: deal._id,
          name: deal.title,
        })));
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      }
    };
    
    fetchUsers();
    fetchCustomers();
    fetchDeals();
  }, []);

  // Update the related entity ID options when the model changes
  const handleRelatedModelChange = (value: string) => {
    setRelatedModel(value);
    form.setValue('relatedTo.model', value);
    form.setValue('relatedTo.id', ''); // Reset the ID when model changes
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Clean up related entity if not fully selected
      if (!values.relatedTo?.model || !values.relatedTo?.id) {
        values.relatedTo = undefined;
      }
      
      await onSubmit(values as TaskFormData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề*</FormLabel>
                <FormControl>
                  <Input placeholder="Tiêu đề công việc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ ưu tiên*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ ưu tiên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Cần làm</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="canceled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày hết hạn</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reminderDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày nhắc nhở</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giao cho</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người thực hiện" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* <SelectItem value="">Chưa giao</SelectItem> */}
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Lặp lại công việc</FormLabel>
                  <FormDescription>
                    Công việc này sẽ được tạo lại theo định kỳ
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {form.watch("isRecurring") && (
            <FormField
              control={form.control}
              name="recurringFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tần suất lặp lại</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tần suất" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Không lặp lại</SelectItem>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Thông tin liên kết</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="relatedTo.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liên kết với</FormLabel>
                  <Select
                    onValueChange={handleRelatedModelChange}
                    defaultValue={field.value}
                    disabled={!!preselectedRelation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại liên kết" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* <SelectItem value="">Không liên kết</SelectItem> */}
                      <SelectItem value="Customer">Khách hàng</SelectItem>
                      <SelectItem value="Deal">Cơ hội</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {relatedModel && (
              <FormField
                control={form.control}
                name="relatedTo.id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chọn {relatedModel === 'Customer' ? 'khách hàng' : 'cơ hội'}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!preselectedRelation}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Chọn ${relatedModel === 'Customer' ? 'khách hàng' : 'cơ hội'}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {relatedModel === 'Customer'
                          ? customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))
                          : deals.map((deal) => (
                              <SelectItem key={deal.id} value={deal.id}>
                                {deal.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Chi tiết công việc"
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
            disabled={loading || isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? 'Cập nhật công việc' : 'Tạo công việc'}
          </Button>
        </div>
      </form>
    </Form>
  );
}