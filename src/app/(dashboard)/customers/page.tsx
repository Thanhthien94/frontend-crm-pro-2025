'use client';

import { useState } from 'react';
import { useCustomers } from '@/hooks/use-customers';
import { Customer, CustomerFormData } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { CustomersTable } from '@/components/data-tables/customers-table';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomerForm from '@/components/forms/customer-form';
import { usePermission } from '@/hooks/use-permission';

export default function CustomersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const { checkPermission } = usePermission();
  
  const {
    customers,
    loading,
    page,
    totalPages,
    totalCustomers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    changePage,
  } = useCustomers();

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomer(id);
    fetchCustomers(page, currentFilters);
  };

  const handleCreateSubmit = async (data: CustomerFormData) => {
    await createCustomer(data);
    setIsCreateDialogOpen(false);
    fetchCustomers(page, currentFilters);
  };

  const handleEditSubmit = async (data: CustomerFormData) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer._id, data);
      setIsEditDialogOpen(false);
      fetchCustomers(page, currentFilters);
    }
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters);
    fetchCustomers(1, filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customers and prospects
          </p>
        </div>
        {checkPermission('customers', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      <CustomersTable
        data={customers}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={changePage}
        onView={handleViewCustomer}
        onEdit={checkPermission('customers', 'update') ? handleEditCustomer : () => {}}
        onDelete={checkPermission('customers', 'delete') ? handleDeleteCustomer : async () => {}}
        onFilterChange={handleFilterChange}
      />

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer or prospect in your CRM.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedCustomer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p>{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p>{selectedCustomer.company || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="capitalize">{selectedCustomer.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="capitalize">{selectedCustomer.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Source</h3>
                  <p className="capitalize">{selectedCustomer.source || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                  <p>{selectedCustomer.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>
              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="whitespace-pre-line">{selectedCustomer.notes}</p>
                </div>
              )}
              <div className="flex justify-end">
                {checkPermission('customers', 'update') && (
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditCustomer(selectedCustomer);
                    }}
                  >
                    Edit Customer
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}