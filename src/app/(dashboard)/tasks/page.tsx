'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { Task, TaskFormData } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PlusCircle, Eye, Edit, Trash2, Search, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TaskForm from '@/components/forms/task-form';
import { usePermission } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';

export default function TasksPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();
  
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch tasks data using custom hook
  const {
    tasks,
    loading,
    page,
    totalPages,
    totalTasks,
    fetchTasks,
    createTask,
    deleteTask,
    completeTask,
    changePage,
  } = useTasks();

  // Handlers
  const handleViewTask = (task: Task) => {
    router.push(`/tasks/${task._id}`);
  };

  const handleEditTask = (task: Task) => {
    router.push(`/tasks/${task._id}/edit`);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleCompleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsCompleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask._id);
      setIsDeleteDialogOpen(false);
      fetchTasks(page, currentFilters);
    }
  };

  const confirmCompleteTask = async () => {
    if (selectedTask) {
      await completeTask(selectedTask._id);
      setIsCompleteDialogOpen(false);
      fetchTasks(page, currentFilters);
    }
  };

  const handleCreateSubmit = async (data: TaskFormData) => {
    await createTask(data);
    setIsCreateDialogOpen(false);
    fetchTasks(page, currentFilters);
  };

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newFilters: Record<string, any> = { ...currentFilters };
    
    // Clear previous status filters
    delete newFilters.status;
    delete newFilters.overdue;
    delete newFilters.upcoming;
    delete newFilters.my;
    
    // Apply new filters based on tab
    switch (value) {
      case 'overdue':
        newFilters.overdue = 'true';
        break;
      case 'today':
        newFilters.upcoming = 'true';
        break;
      case 'my':
        newFilters.my = 'true';
        break;
      case 'pending':
        newFilters.status = 'pending';
        break;
      case 'in_progress':
        newFilters.status = 'in_progress';
        break;
      case 'completed':
        newFilters.status = 'completed';
        break;
    }
    
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  // Filtering functions
  const handlePriorityFilter = (priority: string) => {
    const newFilters = { ...currentFilters };
    if (priority) {
      newFilters.priority = priority;
    } else {
      delete newFilters.priority;
    }
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  const handleSearch = () => {
    const newFilters = { ...currentFilters };
    if (searchQuery) {
      newFilters.search = searchQuery;
    } else {
      delete newFilters.search;
    }
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper functions
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'completed' && task.status !== 'canceled';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and activities
          </p>
        </div>
        
        {checkPermission('tasks', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Tasks Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs and Filters */}
          <div className="space-y-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="my">My Tasks</TabsTrigger>
                <TabsTrigger value="overdue" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </TabsTrigger>
                <TabsTrigger value="today" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due Today
                </TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="max-w-xs"
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <Select
                  onValueChange={handlePriorityFilter}
                  defaultValue={currentFilters.priority || ''}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Tasks Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No tasks found. Create a new task to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task._id} className={isTaskOverdue(task) ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-medium">
                        {task.title}
                        {isTaskOverdue(task) && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
                            Overdue
                          </span>
                        )}
                        {task.relatedTo && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Related to: {task.relatedTo.model}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            task.status
                          )}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {task.assignedTo?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {task.status !== 'completed' && task.status !== 'canceled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCompleteTask(task)}
                              title="Mark as completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTask(task)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {checkPermission('tasks', 'update') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTask(task)}
                              title="Edit task"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {checkPermission('tasks', 'delete') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task)}
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {tasks.length} of {totalTasks} tasks
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task or activity to track.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{selectedTask?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteTask}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{selectedTask?.title}" as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteTask}>
              Complete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}