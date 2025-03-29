"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Customer } from "@/types/customer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, DollarSign, CheckSquare } from "lucide-react";
import api from "@/lib/api";
import { usePermission } from "@/hooks/use-permission";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { checkPermission } = usePermission();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data.data);
      } catch (error: any) {
        console.error("Failed to fetch customer:", error);
        toast.error("Failed to fetch customer details", {
          description: error.response?.data?.error || "An error occurred",
        });
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, router, toast]);

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      router.push("/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete customer");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">Loading...</div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
        <div className="flex space-x-2">
          {checkPermission("customers", "update") && (
            <Button onClick={() => router.push(`/customers/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {checkPermission("customers", "delete") && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="deals">Deals</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{customer.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Company
                      </p>
                      <p>{customer.company || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="capitalize">{customer.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Status
                      </p>
                      <p className="capitalize">{customer.status}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Source
                      </p>
                      <p className="capitalize">{customer.source || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p>{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                  {customer.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="whitespace-pre-line mt-1">
                        {customer.notes}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="deals">
                  <div className="p-4 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">No deals yet</h3>
                    <p className="text-sm text-gray-500">
                      Create a new deal for this customer to track
                      opportunities.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/deals/new")}
                    >
                      Create Deal
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="tasks">
                  <div className="p-4 text-center">
                    <CheckSquare className="h-12 w-12 mx-auto text-gray-300" />
                    <h3 className="mt-2 text-lg font-semibold">No tasks yet</h3>
                    <p className="text-sm text-gray-500">
                      Create a new task related to this customer.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/tasks/new")}
                    >
                      Create Task
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.assignedTo ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {customer.assignedTo.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.assignedTo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Not assigned to anyone</p>
              )}

              {checkPermission("customers", "update") && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push(`/customers/${id}/edit`)}
                >
                  Change Assignment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer {customer.name}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
