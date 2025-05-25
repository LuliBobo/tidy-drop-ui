import React, { useState, useEffect, useCallback } from 'react';
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
  status?: 'active' | 'inactive';
  lastLogin?: string;
  createdAt?: string;
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
  
  // Filter and sort state
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
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

  // Filter users based on search query
  const filterUsers = useCallback((usersList: User[], query: string) => {
    const filtered = query 
      ? usersList.filter(user => 
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.role.toLowerCase().includes(query.toLowerCase()) ||
          (user.status && user.status.toLowerCase().includes(query.toLowerCase()))
        )
      : usersList;
    
    setFilteredUsers(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / usersPerPage)));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [usersPerPage]);

  // Load users from backend
  const loadUsers = useCallback(async () => {
    try {
      if (window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('get-all-users');
        if (result.success) {
          const allUsers = result.users;
          setUsers(allUsers);
          filterUsers(allUsers, searchQuery);
        } else {
          throw new Error(result.error || 'Failed to load users');
        }
      } else {
        // Web version - mock data for demo
        const mockUsers: User[] = [
          { 
            username: 'admin', 
            role: 'admin', 
            status: 'active', 
            lastLogin: new Date().toISOString(), 
            createdAt: new Date(2024, 11, 1).toISOString() 
          },
          { 
            username: 'user1', 
            role: 'user', 
            status: 'active', 
            lastLogin: new Date(2025, 4, 22).toISOString(), 
            createdAt: new Date(2025, 0, 15).toISOString() 
          },
          { 
            username: 'user2', 
            role: 'user', 
            status: 'inactive', 
            lastLogin: new Date(2025, 2, 10).toISOString(), 
            createdAt: new Date(2024, 9, 5).toISOString() 
          },
          { 
            username: 'manager1', 
            role: 'admin', 
            status: 'active', 
            lastLogin: new Date(2025, 4, 24).toISOString(), 
            createdAt: new Date(2024, 11, 20).toISOString() 
          },
          { 
            username: 'test_user', 
            role: 'user', 
            status: 'inactive', 
            lastLogin: undefined, 
            createdAt: new Date(2025, 3, 15).toISOString() 
          },
          { 
            username: 'developer1', 
            role: 'user', 
            status: 'active', 
            lastLogin: new Date(2025, 4, 20).toISOString(), 
            createdAt: new Date(2025, 2, 1).toISOString() 
          },
          { 
            username: 'supervisor', 
            role: 'admin', 
            status: 'active', 
            lastLogin: new Date(2025, 4, 23).toISOString(), 
            createdAt: new Date(2024, 8, 10).toISOString() 
          }
        ];
        setUsers(mockUsers);
        filterUsers(mockUsers, searchQuery);
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
  }, [filterUsers, searchQuery]);

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
  }, [isAdmin, navigate, loadUsers]);
  
  // Apply search filter when search query changes
  useEffect(() => {
    if (users.length > 0) {
      filterUsers(users, searchQuery);
    }
  }, [searchQuery, users, filterUsers]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
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
    createForm.reset({
      username: '',
      password: '',
      role: 'user',
    });
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

  // Change page
  const changePage = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate paginated users
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage, 
    currentPage * usersPerPage
  );

  // Sort users by selected field and direction
  const sortUsers = useCallback((usersList: User[]) => {
    return [...usersList].sort((a, b) => {
      const aValue = a[sortField as keyof User];
      const bValue = b[sortField as keyof User];
      
      // Handle undefined or null values
      if (aValue === undefined || aValue === null) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (bValue === undefined || bValue === null) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      
      let comparison = 0;
      
      // Safe comparison after null checks
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sortField, sortDirection]);

  // Filter and sort users when filters, sort field, or sort direction change
  useEffect(() => {
    let updatedUsers = users;

    // Apply role filter
    if (filterRole) {
      updatedUsers = updatedUsers.filter(user => user.role === filterRole);
    }

    // Apply status filter
    if (filterStatus) {
      updatedUsers = updatedUsers.filter(user => user.status === filterStatus);
    }

    // Sort users
    updatedUsers = sortUsers(updatedUsers);

    setFilteredUsers(updatedUsers);
    setTotalPages(Math.max(1, Math.ceil(updatedUsers.length / usersPerPage)));
    
    // Reset to first page when filters or sort order change
    setCurrentPage(1);
  }, [users, filterRole, filterStatus, sortField, sortDirection, usersPerPage, sortUsers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">User Administration</h1>
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
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
          <Button 
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add New User
          </Button>
        </div>

        {/* Search and Pagination Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex-1 mb-4 sm:mb-0">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input 
                placeholder="Search by username..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-full sm:max-w-sm"
                aria-label="Search users"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
            {/* Role Filter */}
            <div className="flex items-center mb-4 sm:mb-0">
              <label className="text-gray-800 dark:text-gray-200 mr-2">
                Role:
              </label>
              <Select 
                onValueChange={(value) => setFilterRole(value === 'all' ? null : value)} 
                defaultValue={filterRole || "all"}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="all" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20m10-10H2"/>
                      </svg>
                      All roles
                    </SelectItem>
                    <SelectItem value="admin" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      </svg>
                      Admin
                    </SelectItem>
                    <SelectItem value="user" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      User
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center mb-4 sm:mb-0">
              <label className="text-gray-800 dark:text-gray-200 mr-2">
                Status:
              </label>
              <Select 
                onValueChange={(value) => setFilterStatus(value === 'all' ? null : value)} 
                defaultValue={filterStatus || "all"}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Statuses</SelectLabel>
                    <SelectItem value="all" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20m10-10H2"/>
                      </svg>
                      All statuses
                    </SelectItem>
                    <SelectItem value="active" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20m10-10H2"/>
                      </svg>
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20m10-10H2"/>
                      </svg>
                      Inactive
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center">
              <label className="text-gray-800 dark:text-gray-200 mr-2">
                Sort by:
              </label>
              <Select 
                onValueChange={(value) => {
                  const [field, direction] = value.split('_');
                  setSortField(field);
                  setSortDirection(direction as 'asc' | 'desc');
                }} 
                defaultValue={`${sortField}_${sortDirection}`}
              >
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Username (A-Z)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sort Options</SelectLabel>
                    <SelectItem value="username_asc" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 14 12 9l5 5"/>
                      </svg>
                      Username (A-Z)
                    </SelectItem>
                    <SelectItem value="username_desc" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 10l5 5 5-5"/>
                      </svg>
                      Username (Z-A)
                    </SelectItem>
                    <SelectItem value="role_asc" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 14 12 9l5 5"/>
                      </svg>
                      Role (Admin first)
                    </SelectItem>
                    <SelectItem value="role_desc" className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 10l5 5 5-5"/>
                      </svg>
                      Role (User first)
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Username</TableHead>
                <TableHead className="w-[20%]">Role</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[20%]">Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        }`}
                        aria-label={`User role: ${user.role}`}
                      >
                        {user.role === 'admin' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                          </svg>
                        )}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                        aria-label={`User status: ${user.status}`}
                      >
                        {user.status === 'active' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20m10-10H2"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12h20"/>
                          </svg>
                        )}
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {new Date(user.lastLogin).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Never
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(user)}
                          aria-label={`Edit user ${user.username}`}
                          className="flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteConfirm(user)}
                          aria-label={`Delete user ${user.username}`}
                          className="flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * usersPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> users
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
              className="hidden sm:flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m11 17-5-5 5-5"/>
                <path d="m18 17-5-5 5-5"/>
              </svg>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <div className="flex items-center mx-2">
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, idx) => {
                let pageToShow = currentPage;
                if (totalPages <= 3) {
                  pageToShow = idx + 1;
                } else if (currentPage === 1) {
                  pageToShow = idx + 1;
                } else if (currentPage === totalPages) {
                  pageToShow = totalPages - 2 + idx;
                } else {
                  pageToShow = currentPage - 1 + idx;
                }
                
                return (
                  <Button
                    key={idx}
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePage(pageToShow)}
                    className="hidden sm:flex w-9 h-9"
                    aria-label={`Page ${pageToShow}`}
                    aria-current={currentPage === pageToShow ? "page" : undefined}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
              <span className="sm:hidden">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
              className="hidden sm:flex"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m13 17 5-5-5-5"/>
                <path d="m6 17 5-5-5-5"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6" />
                <path d="M16 11h6" />
              </svg>
              Create New User
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details to create a new user account.
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 py-2">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username" 
                        className="bg-white dark:bg-gray-900"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter password" 
                        className="bg-white dark:bg-gray-900"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-900">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="admin" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            </svg>
                            Admin
                          </SelectItem>
                          <SelectItem value="user" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            User
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    createForm.reset();
                    setCreateDialogOpen(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#5558D6]"
                >
                  Create User
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
              Edit User: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedUser?.username}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Update user details. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">New Password (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Leave blank to keep current password" 
                        className="bg-white dark:bg-gray-900"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 dark:text-gray-200">Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-900">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="admin" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                            </svg>
                            Admin
                          </SelectItem>
                          <SelectItem value="user" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            User
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    setEditDialogOpen(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto bg-[#6366F1] hover:bg-[#5558D6]"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete user <span className="font-semibold">{selectedUser?.username}</span>?
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 my-2">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">{deleteError}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteError(null);
                setDeleteDialogOpen(false);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
