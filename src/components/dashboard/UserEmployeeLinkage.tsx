
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLinkUserToEmployee, useEmployees } from '@/hooks/use-employees';
import { Input } from "@/components/ui/input";
import { Search, UserCog } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
  employee_id: string | null;
}

const UserEmployeeLinkage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get all users with their roles and linked employee IDs
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      // Get user-employee mappings
      const { data: mappings, error: mappingsError } = await supabase
        .from('user_employee_mapping')
        .select('*');
      
      if (mappingsError) throw mappingsError;
      
      // Combine the data
      return authUsers.users.map(user => {
        const userRole = userRoles?.find(role => role.user_id === user.id);
        const mapping = mappings?.find(mapping => mapping.user_id === user.id);
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          role: userRole?.role || null,
          employee_id: mapping?.employee_id || null
        };
      }) as User[];
    }
  });
  
  // Get all employees for dropdown
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  
  // Link user to employee mutation
  const linkUserToEmployee = useLinkUserToEmployee();
  
  // Handle linking a user to an employee
  const handleLinkUser = async (userId: string, employeeId: string) => {
    try {
      await linkUserToEmployee.mutateAsync({ userId, employeeId });
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    } catch (error) {
      console.error('Error linking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to link user to employee',
        variant: 'destructive',
      });
    }
  };
  
  // Filter users based on search query
  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          User-Employee Linkage
        </CardTitle>
        <CardDescription>
          Connect user accounts to employee records to establish proper access control.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Linked Employee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading || employeesLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const linkedEmployee = employees.find(emp => emp.id === user.employee_id);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="capitalize">{user.role || 'employee'}</span>
                      </TableCell>
                      <TableCell>
                        {linkedEmployee ? (
                          <span>{linkedEmployee.name}</span>
                        ) : (
                          <span className="text-gray-400">Not linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.employee_id || ''}
                          onValueChange={(value) => {
                            if (value) {
                              handleLinkUser(user.id, value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Link to employee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {employees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name} - {employee.job_title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserEmployeeLinkage;
