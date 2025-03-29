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
import { Loader2 } from 'lucide-react';
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
}

export default function TaskForm({ task, onSubmit, onCancel, preselectedRelation }: TaskFormProps) {
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
                <FormLabel>Title*</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
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
                <FormLabel>Priority*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
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
                <FormLabel>Status*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
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
                <FormLabel>Due Date</FormLabel>
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
                <FormLabel>Reminder Date</FormLabel>
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
                <FormLabel>Assigned To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
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
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Related Entity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="relatedTo.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related To</FormLabel>
                  <Select
                    onValueChange={handleRelatedModelChange}
                    defaultValue={field.value}
                    disabled={!!preselectedRelation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Deal">Deal</SelectItem>
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
                    <FormLabel>Select {relatedModel}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!preselectedRelation}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${relatedModel.toLowerCase()}`} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Task description"
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
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}