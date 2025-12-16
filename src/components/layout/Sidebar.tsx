/**
 * Sidebar Component
 * Navigation sidebar with theme toggle and user info
 */

import React from 'react';
import {
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Music,
  FileText,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout?: () => void;
  onNavigate?: (view: 'dashboard' | 'quizzes' | 'media') => void;
  currentView?: 'dashboard' | 'quizzes' | 'media';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onLogout, onNavigate, currentView = 'dashboard' }) => {
  const { theme, toggleTheme } = useTheme();
  const currentUser = adminService.getCurrentUser();

  const handleLogout = () => {
    adminService.logout();
    if (onLogout) {
      onLogout();
    }
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: 'User Dashboard',
      href: '#',
      key: 'dashboard' as const,
    },
    {
      icon: LayoutDashboard,
      label: 'Quizzes',
      href: '#',
      key: 'quizzes' as const,
    },
    {
      icon: Music,
      label: 'Media Manager',
      href: '#',
      key: 'media' as const,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  LegalPadhai
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate?.(item.key)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left",
                    currentView === item.key
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center space-x-3">
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </span>
            </button>

            {/* User Info */}
            {currentUser && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
    </>
  );
};
