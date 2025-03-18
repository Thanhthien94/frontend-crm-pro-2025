'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer, CustomerFormData } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '@/components/forms/customer-form';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { usePermission } from '@/hooks/use-permission';

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('customers', 'update')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to edit customers',
      });
      router.push('/customers');
      return;
    }
    
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch customer:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.response?.data?.error || 'Failed to fetch customer details',
        });
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id, router, toast, checkPermission]);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await api.put(`/customers/${id}`, data);
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      router.push(`/customers/${id}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update customer',
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Edit Customer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            customer={customer}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}