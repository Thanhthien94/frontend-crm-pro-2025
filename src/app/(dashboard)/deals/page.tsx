'use client';

import { useState } from 'react';
import { useDeals } from '@/hooks/use-deals';
import { Deal, DealFormData } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { DealsTable } from '@/components/data-tables/deals-table';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DealForm from '@/components/forms/deal-form';
import { usePermission } from '@/hooks/use-permission';
import { useRouter } from 'next/navigation';

export default function DealsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const { checkPermission } = usePermission();
  const router = useRouter();
  
  const {
    deals,
    loading,
    page,
    totalPages,
    totalDeals,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    changePage,
  } = useDeals();

  const handleViewDeal = (deal: Deal) => {
    router.push(`/deals/${deal._id}`);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDeal = async (id: string) => {
    await deleteDeal(id);
    fetchDeals(page, currentFilters);
  };

  const handleCreateSubmit = async (data: DealFormData) => {
    await createDeal(data);
    setIsCreateDialogOpen(false);
    fetchDeals(page, currentFilters);
  };

  const handleEditSubmit = async (data: DealFormData) => {
    if (selectedDeal) {
      await updateDeal(selectedDeal._id, data);
      setIsEditDialogOpen(false);
      fetchDeals(page, currentFilters);
    }
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters);
    fetchDeals(1, filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track opportunities
          </p>
        </div>
        {checkPermission('deals', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        )}
      </div>

      <DealsTable
        data={deals}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={changePage}
        onView={handleViewDeal}
        onEdit={checkPermission('deals', 'update') ? handleEditDeal : () => {}}
        onDelete={checkPermission('deals', 'delete') ? handleDeleteDeal : async () => {}}
        onFilterChange={handleFilterChange}
      />

      {/* Create Deal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new sales opportunity in your pipeline.
            </DialogDescription>
          </DialogHeader>
          <DealForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
            <DialogDescription>
              Update deal information.
            </DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <DealForm
              deal={selectedDeal}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}