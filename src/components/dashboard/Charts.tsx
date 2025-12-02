/**
 * Charts Component
 * Analytics charts for user dashboard using Recharts
 */

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CHART_COLORS } from '../../constants/app';
import type { UserStats } from '../../types';

interface ChartsProps {
  stats: UserStats | null;
  loading?: boolean;
}

export const Charts: React.FC<ChartsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // User Status Distribution
  const statusData = [
    { name: 'Active', value: stats.activeUsers, color: CHART_COLORS.SUCCESS },
    { name: 'Inactive', value: stats.inactiveUsers, color: CHART_COLORS.DANGER },
  ];

  // Verification Status Distribution
  const verificationData = [
    { name: 'Verified', value: stats.verifiedUsers, color: CHART_COLORS.PRIMARY },
    { name: 'Unverified', value: stats.unverifiedUsers, color: CHART_COLORS.WARNING },
  ];

  // Registration Type Distribution
  const registrationData = [
    { name: 'Personal', value: stats.personalRegistrations, color: CHART_COLORS.INFO },
    { name: 'Institute', value: stats.instituteRegistrations, color: CHART_COLORS.PURPLE },
  ];

  // User Overview Bar Chart
  const overviewData = [
    {
      name: 'Users',
      Total: stats.totalUsers,
      Active: stats.activeUsers,
      Verified: stats.verifiedUsers,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Value: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Render pie chart label
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Status Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            User Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Verification Status Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={verificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {verificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Registration Type Distribution */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Registration Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {registrationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Overview Bar Chart */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            User Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Total" fill={CHART_COLORS.PRIMARY} radius={[8, 8, 0, 0]} />
              <Bar dataKey="Active" fill={CHART_COLORS.SUCCESS} radius={[8, 8, 0, 0]} />
              <Bar dataKey="Verified" fill={CHART_COLORS.INFO} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
