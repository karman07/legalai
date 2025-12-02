/**
 * Admin Dashboard Page
 * Main dashboard with user statistics, charts, and user management
 */

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { StatsCards } from '../components/dashboard/StatsCards';
import { Charts } from '../components/dashboard/Charts';
import { UserTable } from '../components/dashboard/UserTable';
import { adminService } from '../services/adminService';
import { PAGINATION } from '../constants/app';
import type { User, UserStats, PaginationState } from '../types';

export const Dashboard: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  // Sidebar state - open on desktop (>= 1024px), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user statistics
  const fetchStats = async () => {
    if (!adminService.isAuthenticated()) {
      return;
    }
    setStatsLoading(true);
    try {
      const data = await adminService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch users with pagination
  const fetchUsers = async (page: number = pagination.page, limit: number = pagination.limit) => {
    if (!adminService.isAuthenticated()) {
      return;
    }
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(page, limit);
      setUsers(response.users);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchStats();
    fetchUsers();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page, pagination.limit);
  };

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    fetchUsers(1, limit);
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
        <main className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button - visible on all screens */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                title="Toggle Sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  User Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and monitor all users on LegalPadhai.ai
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mb-8">
            <StatsCards stats={stats} loading={statsLoading} />
          </div>

          {/* Charts */}
          <div className="mb-8">
            <Charts stats={stats} loading={statsLoading} />
          </div>

          {/* User Table */}
          <UserTable
            users={users}
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onRefresh={handleRefresh}
          />
        </main>
      </div>
    </div>
  );
};
