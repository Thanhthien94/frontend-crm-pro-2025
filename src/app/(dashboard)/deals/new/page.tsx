'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DealFormData } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DealForm from '@/components/forms/deal-form';
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import {toast} from 'sonner';

export default function NewDealPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('deals', 'create')) {
      toast.error('You do not have permission to create deals');
      router.push('/deals');
    }
  }, [router, checkPermission]);

  const handleSubmit = async (data: DealFormData) => {
    try {
      const response = await api.post('/deals', data);
      toast.success('Deal created successfully');
      router.push(`/deals/${response.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create deal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Create New Deal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}