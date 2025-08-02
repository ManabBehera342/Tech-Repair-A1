import React, { useEffect } from 'react';
import { Clock, User, AlertCircle, Camera, MessageSquare } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

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

interface KanbanBoardProps {
  tickets: ServiceTicket[];
  setTickets: React.Dispatch<React.SetStateAction<ServiceTicket[]>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, setTickets }) => {
  const { addNotification } = useNotification();

  const columns = [
    { id: 'new', title: 'New', color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'validation', title: 'Under Validation', color: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' },
    { id: 'awaiting_dispatch', title: 'Awaiting Dispatch', color: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    { id: 'assigned_epr', title: 'Assigned to EPR', color: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'estimate_provided', title: 'Estimate Provided', color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
    { id: 'under_repair', title: 'Under Repair', color: 'border-red-500 bg-red-50 dark:bg-red-900/20' },
    { id: 'ready_return', title: 'Ready for Return', color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'closed', title: 'Closed', color: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  useEffect(() => {
    async function fetchTickets() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/service-requests', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          }
        });
        if (!res.ok) throw new Error('Failed to fetch tickets');

        const data = await res.json();
        setTickets(data.tickets || data);
      } catch (error) {
        addNotification({ type: 'error', title: 'Load Failed', message: (error as Error).message });
      }
    }
    fetchTickets();
  }, [setTickets, addNotification]);

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');

    try {
      const token = localStorage.getItem('token');
      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) throw new Error('Ticket not found');

      // Optimistically update UI
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: newStatus as ServiceTicket['status'], updatedAt: new Date().toISOString() }
            : ticket
        )
      );

      // Patch backend
      const res = await fetch(`http://localhost:3000/service-requests/${ticketToUpdate.ticketNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update ticket status');

      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `Ticket moved to ${columns.find(col => col.id === newStatus)?.title}`
      });
    } catch (error) {
      addNotification({ type: 'error', title: 'Update Failed', message: (error as Error).message });
    }
  };

  const assignTechnician = async (ticketId: string, technician: string) => {
    try {
      const token = localStorage.getItem('token');

      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId
            ? { ...ticket, assignedTo: technician, updatedAt: new Date().toISOString() }
            : ticket
        )
      );

      const ticketToUpdate = tickets.find(t => t.id === ticketId);
      if (!ticketToUpdate) throw new Error('Ticket not found');

      const res = await fetch(`http://localhost:3000/service-requests/${ticketToUpdate.ticketNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ assignedTo: technician }),
      });

      if (!res.ok) throw new Error('Failed to assign technician');

      addNotification({
        type: 'success',
        title: 'Technician Assigned',
        message: `Ticket assigned to ${technician}`
      });
    } catch (error) {
      addNotification({ type: 'error', title: 'Assignment Failed', message: (error as Error).message });
    }
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map(column => {
        const columnTickets = tickets.filter(ticket => ticket.status === column.id);
        
        return (
          <div
            key={column.id}
            className={`min-w-80 ${column.color} rounded-lg border-t-4 bg-white dark:bg-gray-800 shadow-sm`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {column.title}
                </h3>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm px-2 py-1 rounded-full">
                  {columnTickets.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4 min-h-96">
              {columnTickets.map(ticket => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ticket.id)}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 cursor-move hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        #{ticket.ticketNumber}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {ticket.customerName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {ticket.productType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ticket.issue}
                    </p>
                  </div>

                  {ticket.photos.length > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <Camera className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {ticket.photos.length} photo{ticket.photos.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(ticket.updatedAt)}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-20">{ticket.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {!ticket.assignedTo && column.id !== 'new' && column.id !== 'closed' && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <select
                        onChange={(e) => assignTechnician(ticket.id, e.target.value)}
                        value=""
                        className="w-full text-xs py-1 px-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Assign Technician</option>
                        <option value="Tech Team A">Tech Team A</option>
                        <option value="Tech Team B">Tech Team B</option>
                        <option value="Senior Tech">Senior Tech</option>
                        <option value="Specialist">Specialist</option>
                      </select>
                    </div>
                  )}

                  <div className="mt-3 flex space-x-2">
                    <button className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      <MessageSquare className="w-3 h-3" />
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      <AlertCircle className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
