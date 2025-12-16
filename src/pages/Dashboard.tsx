/**
 * Admin Dashboard Page
 * Main dashboard with user statistics, charts, and user management
 */

import React, { useState, useEffect } from 'react';
import { StatsCards } from '../components/dashboard/StatsCards';
import { Charts } from '../components/dashboard/Charts';
import { UserTable } from '../components/dashboard/UserTable';
import { adminService } from '../services/adminService';
import { PAGINATION } from '../constants/app';
import type { User, UserStats, PaginationState } from '../types';

export const Dashboard: React.FC = () => {
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

  // content-only component; sidebar is controlled by parent layout

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Main Content */}
      <div className="transition-all duration-300">
        <main className="p-6 lg:p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
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
          <div className="mb-6">
            <StatsCards stats={stats} loading={statsLoading} />
          </div>

          {/* Charts */}
          <div className="mb-6">
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
