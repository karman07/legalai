/**
 * Statistics Cards Component
 * Displays user statistics with beautiful cards and icons
 */

import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Building2,
  UserCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatNumber, calculatePercentage } from '../../lib/utils';
import type { UserStats } from '../../types';

interface StatsCardsProps {
  stats: UserStats | null;
  loading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const activePercentage = calculatePercentage(stats.activeUsers, stats.totalUsers);
  const verifiedPercentage = calculatePercentage(stats.verifiedUsers, stats.totalUsers);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'All registered users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: `${activePercentage}% of total users`,
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: UserX,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'Deactivated accounts',
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      icon: CheckCircle,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: `${verifiedPercentage}% verified`,
    },
    {
      title: 'Unverified Users',
      value: stats.unverifiedUsers,
      icon: XCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'Pending verification',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      description: 'Administrative accounts',
    },
    {
      title: 'Personal Accounts',
      value: stats.personalRegistrations,
      icon: UserCircle,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      description: 'Individual registrations',
    },
    {
      title: 'Institute Accounts',
      value: stats.instituteRegistrations,
      icon: Building2,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20',
      description: 'Organization accounts',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            variant="elevated"
            className="hover:scale-105 transition-transform duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stat.value)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
