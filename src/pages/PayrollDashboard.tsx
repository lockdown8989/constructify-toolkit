
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DollarSign, TrendingUp, Users, Download, Settings, Filter, Grid, List, Search, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PayrollDashboard = () => {
  const { user, isPayroll } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeView, setTimeView] = useState('Month');
  
  // Redirect if not payroll user
  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }

  const employees = [
    {
      id: "1",
      name: "Rhaenyra Targaryen",
      email: "rhaenyra@stellia.com",
      position: "Product Designer",
      salary: "$1,250.00",
      status: "Paid",
      overtime: "12hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "2", 
      name: "Daemon Targaryen",
      email: "daemon@stellia.com",
      position: "Finance Manager",
      salary: "$1,150.00",
      status: "Pending",
      overtime: "2hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "3",
      name: "Jon Snow",
      email: "jon@stellia.com", 
      position: "Sr Graphic Designer",
      salary: "$1,000.00",
      status: "Paid",
      overtime: "-",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "4",
      name: "Aegon Targaryen",
      email: "aegon@stellia.com",
      position: "Lead Product Designer", 
      salary: "$1,500.00",
      status: "Paid",
      overtime: "10hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    },
    {
      id: "5",
      name: "Alicent Hightower",
      email: "alicent@stellia.com",
      position: "Project Manager",
      salary: "$1,325.00", 
      status: "Paid",
      overtime: "8hrs",
      avatar: "/lovable-uploads/ff00229e-c65b-41be-aef7-572c8937cac0.png"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            Payroll Settings
          </Button>
          <Select defaultValue="26 Jan 2024 — 25 Feb 2024">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="26 Jan 2024 — 25 Feb 2024">26 Jan 2024 — 25 Feb 2024</SelectItem>
              <SelectItem value="26 Dec 2023 — 25 Jan 2024">26 Dec 2023 — 25 Jan 2024</SelectItem>
              <SelectItem value="26 Nov 2023 — 25 Dec 2023">26 Nov 2023 — 25 Dec 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="xl:col-span-1 space-y-4">
          {/* Monthly Payroll Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                Monthly Payroll
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">$3,230,250</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>

          {/* Overtime Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4" />
                Overtime
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">$220,500</span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-5.3%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>

          {/* Bonuses Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <DollarSign className="h-4 w-4" />
                Bonuses & Incentives
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">$150,000</span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-12.3%</span>
              </div>
              <p className="text-sm text-gray-500">.00</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="xl:col-span-3">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={timeView === 'Day' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Day')}
                    className="text-sm"
                  >
                    Day
                  </Button>
                  <Button 
                    variant={timeView === 'Week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Week')}
                    className="text-sm"
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeView === 'Month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeView('Month')}
                    className="text-sm"
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Chart */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-full p-8">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, index) => (
                    <div key={month} className="flex flex-col items-center">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="w-6 md:w-8 bg-blue-600 rounded-t" style={{ height: `${60 + index * 10}px` }}></div>
                        <div className="w-6 md:w-8 bg-blue-300 rounded-t" style={{ height: `${40 + index * 5}px` }}></div>
                        <div className="w-6 md:w-8 bg-purple-400 rounded-t" style={{ height: `${20 + index * 3}px` }}></div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Monthly Payroll</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Overtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Bonuses & Incentives</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              Employee
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search employees"
                  className="pl-10 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Recurring</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Overtime</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{employee.position}</td>
                    <td className="py-3 px-4 font-medium text-sm">{employee.salary}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">Recurring</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{employee.overtime}</td>
                    <td className="py-3 px-4">{getStatusBadge(employee.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          👁
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollDashboard;
