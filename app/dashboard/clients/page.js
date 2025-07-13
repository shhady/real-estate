'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaSearch, FaPhone, FaWhatsapp, FaEnvelope, FaEdit, FaTrash, FaEye, FaUsers } from 'react-icons/fa';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Fetch clients
  const fetchClients = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (intentFilter) params.append('intent', intentFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/clients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter, intentFilter, priorityFilter]);

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (!confirm('האם אתה בטוח שאתה רוצה למחוק את הלקוח?')) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClients(clients.filter(client => client._id !== clientId));
      } else {
        throw new Error('Failed to delete client');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      prospect: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.prospect;
  };

  // Get priority badge color
  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  // Get intent badge color
  const getIntentBadge = (intent) => {
    const colors = {
      buyer: 'bg-green-100 text-green-800',
      seller: 'bg-blue-100 text-blue-800',
      renter: 'bg-orange-100 text-orange-800',
      landlord: 'bg-indigo-100 text-indigo-800',
      both: 'bg-purple-100 text-purple-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[intent] || colors.unknown;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">לקוחות שלי</h1>
            <Link
              href="/dashboard/clients/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              הוסף לקוח חדש
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חיפוש לקוח..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">כל הסטטוסים</option>
              <option value="prospect">פרוספקט</option>
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
              <option value="closed">סגור</option>
            </select>

            {/* Intent Filter */}
            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">כל הכוונות</option>
              <option value="buyer">קונה</option>
              <option value="seller">מוכר</option>
              <option value="renter">שוכר</option>
              <option value="landlord">משכיר</option>
              <option value="both">קונה ומוכר</option>
              <option value="unknown">לא ידוע</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value="">כל הדחיפויות</option>
              <option value="high">דחיפות גבוהה</option>
              <option value="medium">דחיפות בינונית</option>
              <option value="low">דחיפות נמוכה</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Clients List */}
        <div className="bg-white rounded-lg shadow-md">
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין לקוחות עדיין</h3>
              <p className="text-gray-500 mb-4">התחל על ידי הוספת הלקוח הראשון שלך</p>
              <Link
                href="/dashboard/clients/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                הוסף לקוח
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      לקוח
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פרטי קשר
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס וכוונה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      דחיפות
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שיחות
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      עדכון אחרון
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                          {client.preferredLocation && (
                            <div className="text-sm text-gray-500">📍 {client.preferredLocation}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <FaPhone className="w-3 h-3 ml-2" />
                            {client.phoneNumber}
                          </div>
                          {client.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <FaEnvelope className="w-3 h-3 ml-2" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(client.status)}`}>
                            {client.status === 'active' ? 'פעיל' :
                             client.status === 'prospect' ? 'פרוספקט' :
                             client.status === 'inactive' ? 'לא פעיל' : 'סגור'}
                          </span>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntentBadge(client.intent)}`}>
                              {client.intent === 'buyer' ? 'קונה' :
                               client.intent === 'seller' ? 'מוכר' :
                               client.intent === 'renter' ? 'שוכר' :
                               client.intent === 'landlord' ? 'משכיר' :
                               client.intent === 'both' ? 'קונה ומוכר' : 'לא ידוע'}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.preApproval ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {client.preApproval ? 'יש אישור עקרוני' : 'אין אישור עקרוני'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(client.priority)}`}>
                          {client.priority === 'high' ? 'גבוהה' :
                           client.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.calls?.length || 0} שיחות
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-4">
                          <Link
                            href={`/dashboard/clients/${client._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/clients/${client._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClient(client._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 