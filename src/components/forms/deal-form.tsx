'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Deal, DealFormData } from '@/types/deal';
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
import { mapApiDataToFormData } from '@/utils/deals-mapper';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  value: z.coerce.number().min(0, { message: 'Value must be a positive number' }),
  stage: z.string(),
  expectedCloseDate: z.string().optional(),
  customer: z.string(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  status: z.string().default('active'),
});

interface DealFormProps {
  deal?: Deal;
  initialFormData?: DealFormData & { name: string };
  onSubmit: (data: DealFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DealForm({ 
  deal, 
  initialFormData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: DealFormProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Tạo defaultValues từ initialFormData hoặc từ deal
  const getDefaultValues = () => {
    if (initialFormData) {
      return initialFormData;
    }
    
    if (deal) {
      return {
        name: deal.title,
        value: deal.value,
        stage: deal.stage,
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
        customer: deal.customer?._id || '',
        assignedTo: deal.assignedTo?._id || '',
        notes: deal.notes || '',
        probability: deal.probability || 0,
        status: deal.status || 'active',
      };
    }
    
    return {
      name: '',
      value: 0,
      stage: 'lead',
      expectedCloseDate: '',
      customer: '',
      assignedTo: '',
      notes: '',
      probability: 0,
      status: 'active',
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customers?limit=100');
        setCustomers(response.data.data.map((customer: any) => ({
          id: customer._id,
          name: customer.name + (customer.company ? ` (${customer.company})` : ''),
        })));
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
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
    
    fetchCustomers();
    fetchUsers();
  }, []);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await onSubmit(values as DealFormData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deal Title*</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Enterprise License" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value*</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Deal value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed-won">Closed (Won)</SelectItem>
                    <SelectItem value="closed-lost">Closed (Lost)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedCloseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Close Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      {loading ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Loading customers...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select customer" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
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
                    {/* <SelectItem value="unassigned">Unassigned</SelectItem> */}
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
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Probability (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100} 
                    placeholder="Probability" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this deal"
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {deal ? 'Update Deal' : 'Create Deal'}
          </Button>
        </div>
      </form>
    </Form>
  );
}