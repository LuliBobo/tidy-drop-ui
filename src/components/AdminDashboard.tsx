import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface User {
  username: string;
  role: string;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Form schema for user editing
  const userFormSchema = z.object({
    password: z.string().min(4, 'Password must be at least 4 characters').optional(),
    role: z.enum(['admin', 'user']),
  });
  
  type UserFormValues = z.infer<typeof userFormSchema>;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      password: '',
      role: 'user',
    },
  });

  // Form schema for user creation
  const createUserFormSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    role: z.enum(['admin', 'user']),
  });
  
  type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'user',
    },
  });

  // Check if the current user is admin and load users
  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        if (!isAdmin) {
          toast({
            variant: 'destructive',
            title: 'Access denied',
            description: 'You do not have permission to access this page.',
          });
          navigate('/');
          return;
        }

        await loadUsers();
      } catch (error) {
        console.error('Error in admin dashboard:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load user data.',
        });
      }
    };

    checkAdminAndLoadUsers();
  }, [isAdmin, navigate]);
  
  // Apply search filter when search query changes
  useEffect(() => {
    if (users.length > 0) {
      applyFilters(users, searchQuery);
    }
  }, [searchQuery, users, usersPerPage]);

  // Load users from backend
  const loadUsers = async () => {
    try {
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('get-all-users');
        if (result.success) {
          const allUsers = result.users;
          setUsers(allUsers);
          applyFilters(allUsers, searchQuery);
        } else {
          throw new Error(result.error || 'Failed to load users');
        }
      } else {
        // Web version - mock data for demo
        const mockUsers = [
          { username: 'admin', role: 'admin' },
          { username: 'user1', role: 'user' },
          { username: 'user2', role: 'user' },
          { username: 'manager1', role: 'admin' },
          { username: 'test_user', role: 'user' },
          { username: 'developer1', role: 'user' },
          { username: 'supervisor', role: 'admin' }
        ];
        setUsers(mockUsers);
        applyFilters(mockUsers, searchQuery);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const applyFilters = (usersList: User[], query: string) => {
    const filtered = query 
      ? usersList.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.role.toLowerCase().includes(query.toLowerCase())
        )
      : usersList;
    
    setFilteredUsers(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / usersPerPage)));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(users, query);
  };

  // Get current page users
  const getCurrentPageUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };

  // Handle user edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.reset({
      password: '',
      role: user.role as 'admin' | 'user',
    });
    setEditDialogOpen(true);
  };

  // Handle user delete confirmation
  const handleDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle user creation
  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  // Submit updated user data
  const onSubmitEdit = async (data: UserFormValues) => {
    try {
      if (!selectedUser) return;

      const updates: { password?: string; role?: 'admin' | 'user' } = {};
      
      if (data.password && data.password.trim() !== '') {
        updates.password = data.password;
      }
      
      updates.role = data.role;

      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke(
          'update-user', 
          selectedUser.username, 
          updates
        );

        if (result.success) {
          toast({
            title: 'Success',
            description: `User ${selectedUser.username} was updated.`,
          });
          
          // Refresh user list
          await loadUsers();
        } else {
          throw new Error(result.error || 'Failed to update user');
        }
      } else {
        // Web version - mock success
        toast({
          title: 'Success',
          description: `User ${selectedUser.username} was updated.`,
        });
        
        // Update local state for demo
        setUsers(users.map(user => 
          user.username === selectedUser.username 
            ? { ...user, role: data.role } 
            : user
        ));
      }

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user.',
      });
    }
  };

  // Create new user
  const onSubmitCreate = async (data: CreateUserFormValues) => {
    try {
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke(
          'register-user',
          data.username,
          data.password,
          data.role
        );

        if (result) {
          toast({
            title: 'Success',
            description: `User ${data.username} was created successfully.`,
          });
          
          // Refresh user list
          await loadUsers();
        } else {
          throw new Error('Failed to create user - username may already exist');
        }
      } else {
        // Web version - mock success
        toast({
          title: 'Success',
          description: `User ${data.username} was created successfully.`,
        });
        
        // Update local state for demo
        setUsers([
          ...users,
          { username: data.username, role: data.role }
        ]);
      }

      setCreateDialogOpen(false);
      createForm.reset();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create user: ${error}`,
      });
    }
  };

  // Delete a user
  const handleDelete = async () => {
    try {
      if (!selectedUser) return;
      
      setDeleteError(null);

      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke(
          'delete-user', 
          selectedUser.username
        );

        if (result.success) {
          toast({
            title: 'Success',
            description: `User ${selectedUser.username} was deleted.`,
          });
          
          // Refresh user list
          await loadUsers();
          setDeleteDialogOpen(false);
        } else {
          // Display specific error message from backend
          setDeleteError(result.error || 'Failed to delete user');
          
          if (result.error?.includes('last administrator')) {
            toast({
              variant: 'destructive',
              title: 'Cannot Delete Admin',
              description: 'Cannot delete the last administrator account. Create another admin user first.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: result.error || 'Failed to delete user',
            });
          }
          
          // Keep dialog open when there's an error with the last admin
          if (result.error?.includes('last administrator')) {
            return;
          }
          
          setDeleteDialogOpen(false);
        }
      } else {
        // Web version - mock success or failure for demo
        // Simulate prevention of deleting last admin
        const isLastAdmin = selectedUser.role === 'admin' && 
                          users.filter(u => u.role === 'admin').length <= 1;
                          
        if (isLastAdmin) {
          setDeleteError('Cannot delete the last administrator account');
          toast({
            variant: 'destructive',
            title: 'Cannot Delete Admin',
            description: 'Cannot delete the last administrator account. Create another admin user first.',
          });
          return;
        }
        
        toast({
          title: 'Success',
          description: `User ${selectedUser.username} was deleted.`,
        });
        
        // Update local state for demo
        setUsers(users.filter(user => user.username !== selectedUser.username));
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete user: ${error}`,
      });
    }
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter users based on search query
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / usersPerPage)); // Update total pages
    setCurrentPage(1); // Reset to first page
  };

  // Change page
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate paginated users
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage, 
    currentPage * usersPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Administration</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Management</h2>
          <Button 
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Add New User
          </Button>
        </div>

        {/* Search and Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex-1 mb-4 sm:mb-0">
            <Input 
              placeholder="Search by username..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteConfirm(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user account.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave blank to keep current password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user "{selectedUser?.username}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
