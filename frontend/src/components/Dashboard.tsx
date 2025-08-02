import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Filter, 
  Plus, 
  Search, 
  User, 
  Settings,
  Bell,
  TrendingUp,
  ArrowLeft,
  Download
} from 'lucide-react';
import KanbanBoard from './KanbanBoard';
import AnalyticsWidgets from './AnalyticsWidgets';

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  productType: string;
  issue: string;
  status: 'new' | 'validation' | 'awaiting_dispatch' | 'assigned_epr' | 'estimate_provided' | 'under_repair' | 'ready_return' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  photos: string[];
  description: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const [activeView, setActiveView] = useState<'kanban' | 'analytics'>('kanban');
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock data - In real app, this would come from Google Sheets
  useEffect(() => {
    const mockTickets: ServiceTicket[] = [
      {
        id: '1',
        ticketNumber: 'TR-001234',
        customerName: 'John Smith',
        productType: 'Energizer Power Bank',
        issue: 'Not charging',
        status: 'new',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        photos: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop'],
        description: 'Device stopped charging after 6 months of use'
      },
      {
        id: '2',
        ticketNumber: 'TR-001235',
        customerName: 'Sarah Johnson',
        productType: 'Gate Motor Controller',
        issue: 'Remote not working',
        status: 'under_repair',
        priority: 'medium',
        assignedTo: 'Tech Team A',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        photos: [],
        description: 'Remote control stopped responding to commands'
      },
      {
        id: '3',
        ticketNumber: 'TR-001236',
        customerName: 'Mike Davis',
        productType: 'Power Adapter',
        issue: 'Overheating',
        status: 'estimate_provided',
        priority: 'high',
        assignedTo: 'Tech Team B',
        createdAt: '2024-01-13T16:45:00Z',
        updatedAt: '2024-01-14T11:30:00Z',
        photos: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=200&h=200&fit=crop'],
        description: 'Adapter gets extremely hot during use'
      }
    ];
    setTickets(mockTickets);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.productType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => ['validation', 'awaiting_dispatch', 'assigned_epr', 'under_repair'].includes(t.status)).length,
    completed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getGreeting()}, {user?.name}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome to your {user?.role === 'service_team' ? 'Service' : 'EPR'} Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={logout}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'kanban'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'analytics'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_repair">Under Repair</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeView === 'kanban' ? (
          <KanbanBoard tickets={filteredTickets} setTickets={setTickets} />
        ) : (
          <AnalyticsWidgets tickets={tickets} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;