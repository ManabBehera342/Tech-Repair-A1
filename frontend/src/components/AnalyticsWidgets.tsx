import React from 'react';
import { BarChart3, PieChart, TrendingUp, Clock, Wrench, AlertCircle } from 'lucide-react';

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

interface AnalyticsWidgetsProps {
  tickets: ServiceTicket[];
}

const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({ tickets }) => {
  // Calculate analytics data
  const statusCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.productType] = (acc[ticket.productType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = tickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonIssues = tickets.reduce((acc, ticket) => {
    acc[ticket.issue] = (acc[ticket.issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getAverageResolutionTime = () => {
    const closedTickets = tickets.filter(t => t.status === 'closed');
    if (closedTickets.length === 0) return '0 days';
    
    const totalTime = closedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt);
      const updated = new Date(ticket.updatedAt);
      return sum + (updated.getTime() - created.getTime());
    }, 0);
    
    const avgTime = totalTime / closedTickets.length;
    const days = Math.floor(avgTime / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{getAverageResolutionTime()}</p>
              <p className="text-sm text-green-600 dark:text-green-400">↓ 12% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94.2%</p>
              <p className="text-sm text-green-600 dark:text-green-400">↑ 2.1% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">First-Time Fix Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87.5%</p>
              <p className="text-sm text-green-600 dark:text-green-400">↑ 5.2% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Escalated Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{priorityCounts.high || 0}</p>
              <p className="text-sm text-red-600 dark:text-red-400">↑ 8.3% vs last month</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Status Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = ((count / tickets.length) * 100).toFixed(1);
              const statusColors: Record<string, string> = {
                new: 'bg-blue-500',
                validation: 'bg-orange-500',
                awaiting_dispatch: 'bg-purple-500',
                assigned_epr: 'bg-indigo-500',
                estimate_provided: 'bg-yellow-500',
                under_repair: 'bg-red-500',
                ready_return: 'bg-emerald-500',
                closed: 'bg-gray-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Breakdown</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(productCounts)
              .sort(([,a], [,b]) => b - a)
              .map(([product, count]) => {
                const percentage = ((count / tickets.length) * 100).toFixed(1);
                return (
                  <div key={product} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{product}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Root Cause Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Most Common Issues</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(commonIssues)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([issue, count], index) => (
              <div key={issue} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{issue}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / Math.max(...Object.values(commonIssues))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{count} cases</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsWidgets;