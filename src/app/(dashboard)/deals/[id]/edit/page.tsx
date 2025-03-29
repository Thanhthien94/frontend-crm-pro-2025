'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Deal, DealFormData } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DealForm from '@/components/forms/deal-form';
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import {toast } from 'sonner';

export default function EditDealPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('deals', 'update')) {
      toast.error('You do not have permission to edit deals');
      router.push('/deals');
      return;
    }
    
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/deals/${id}`);
        setDeal(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch deal:', error);
        toast.error(error.response?.data?.error || 'Failed to fetch deal details');
        router.push('/deals');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeal();
  }, [id, router, checkPermission]);

  const handleSubmit = async (data: DealFormData) => {
    try {
      await api.put(`/deals/${id}`, data);
      toast.success('Deal updated successfully');
      router.push(`/deals/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update deal');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (!deal) {
    return <div>Deal not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Edit Deal</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            deal={deal}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}