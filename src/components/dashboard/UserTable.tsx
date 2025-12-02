/**
 * User Table Component
 * Data table with pagination, search, and CRUD actions
 */

import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Key,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { formatDate, formatRelativeTime, debounce, capitalize } from '../../lib/utils';
import { PAGINATION } from '../../constants/app';
import { CONFIRMATION_MESSAGES, INFO_MESSAGES, ERROR_MESSAGES } from '../../constants/messages';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';
import type { User, CreateUserPayload, PaginationState } from '../../types';

interface UserTableProps {
  users: User[];
  pagination: PaginationState;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  pagination,
  loading,
  onPageChange,
  onLimitChange,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'view' | 'delete' | 'toggle' | 'role' | 'verify' | 'password' | 'create' | null;
  }>({ open: false, type: null });
  const [formData, setFormData] = useState<Partial<CreateUserPayload>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Search users with debounce
  const handleSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await adminService.searchUsers(query);
      setSearchResults(response.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const displayUsers = searchQuery.trim() ? searchResults : users;

  // Open action dialog
  const openDialog = (
    type: typeof actionDialog.type,
    user: User | null = null
  ) => {
    setSelectedUser(user);
    setActionDialog({ open: true, type });
    if (type === 'create') {
      setFormData({
        registrationType: 'personal',
        role: 'user',
      });
    }
  };

  // Close dialog
  const closeDialog = () => {
    setActionDialog({ open: false, type: null });
    setSelectedUser(null);
    setFormData({});
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await adminService.deleteUser(selectedUser._id);
      closeDialog();
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await adminService.toggleUserStatus(selectedUser._id);
      closeDialog();
      onRefresh();
    } catch (error) {
      console.error('Toggle status error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
      await adminService.updateUserRole(selectedUser._id, newRole);
      closeDialog();
      onRefresh();
    } catch (error) {
      console.error('Update role error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Verify user
  const handleVerify = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await adminService.verifyUser(selectedUser._id);
      closeDialog();
      onRefresh();
    } catch (error) {
      console.error('Verify error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!selectedUser || !formData.password) {
      toast.error(ERROR_MESSAGES.REQUIRED_FIELD);
      return;
    }

    setActionLoading(true);
    try {
      await adminService.updateUserPassword(selectedUser._id, formData.password);
      closeDialog();
    } catch (error) {
      console.error('Update password error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Create user
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    setActionLoading(true);
    try {
      await adminService.createUser(formData as CreateUserPayload);
      closeDialog();
      onRefresh();
    } catch (error) {
      console.error('Create user error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              User Management
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => openDialog('create')}
                variant="default"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={INFO_MESSAGES.SEARCH_PLACEHOLDER}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Found {searchResults.length} results
              </p>
            )}
          </div>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !searchQuery ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">{INFO_MESSAGES.LOADING}</p>
                    </TableCell>
                  </TableRow>
                ) : displayUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? INFO_MESSAGES.NO_USERS_FOUND : INFO_MESSAGES.EMPTY_STATE}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            {user.lastLogin && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last: {formatRelativeTime(user.lastLogin)}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'info' : 'secondary'}>
                          {capitalize(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {capitalize(user.registrationType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => openDialog('view', user)}
                            variant="ghost"
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!user.isVerified && (
                            <Button
                              onClick={() => openDialog('verify', user)}
                              variant="ghost"
                              size="sm"
                              title="Verify User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            onClick={() => openDialog('password', user)}
                            variant="ghost"
                            size="sm"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openDialog('role', user)}
                            variant="ghost"
                            size="sm"
                            title="Change Role"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openDialog('toggle', user)}
                            variant="ghost"
                            size="sm"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => openDialog('delete', user)}
                            variant="ghost"
                            size="sm"
                            title="Delete User"
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!searchQuery && displayUsers.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show
                </span>
                <Select
                  value={(pagination?.limit || PAGINATION.DEFAULT_LIMIT).toString()}
                  onChange={(e) => onLimitChange(Number(e.target.value))}
                  className="w-20"
                >
                  {PAGINATION.LIMIT_OPTIONS.map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </Select>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  per page
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination?.page || 1} of {pagination?.totalPages || 1} (Total: {pagination?.total || 0})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => onPageChange((pagination?.page || 1) - 1)}
                  disabled={(pagination?.page || 1) === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => onPageChange((pagination?.page || 1) + 1)}
                  disabled={(pagination?.page || 1) === (pagination?.totalPages || 1)}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'view'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog} className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">User Profile</DialogTitle>
            <DialogDescription>Complete user information and account details</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            {selectedUser && (
              <div className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={selectedUser.role === 'admin' ? 'info' : 'secondary'}>
                        {capitalize(selectedUser.role)}
                      </Badge>
                      <Badge variant={selectedUser.isActive ? 'success' : 'danger'}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={selectedUser.isVerified ? 'success' : 'warning'}>
                        {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Registration Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{capitalize(selectedUser.registrationType)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedUser._id.substring(0, 12)}...</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Login</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedUser.lastLogin)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(selectedUser.phoneNumber || selectedUser.address) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedUser.phoneNumber && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.phoneNumber}</p>
                        </div>
                      )}
                      {selectedUser.address && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Institute Information */}
                {selectedUser.registrationType === 'institute' && (selectedUser.instituteName || selectedUser.instituteId) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Institute Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.instituteName && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Institute Name</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.instituteName}</p>
                        </div>
                      )}
                      {selectedUser.instituteId && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Institute ID</p>
                          <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedUser.instituteId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete User</DialogTitle>
                <DialogDescription className="mt-1">{CONFIRMATION_MESSAGES.DELETE_USER}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-4">
            {selectedUser && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {selectedUser.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'toggle'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedUser?.isActive 
                  ? 'bg-orange-100 dark:bg-orange-900/20' 
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                {selectedUser?.isActive ? (
                  <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {selectedUser?.isActive ? 'Deactivate' : 'Activate'} User Account
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedUser?.isActive ? CONFIRMATION_MESSAGES.DEACTIVATE_USER : CONFIRMATION_MESSAGES.ACTIVATE_USER}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {selectedUser.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUser.email}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleToggleStatus} variant="default" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedUser?.isActive ? (
                    <><XCircle className="w-4 h-4 mr-2" /> Deactivate</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Activate</>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'role'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Change User Role</DialogTitle>
                <DialogDescription className="mt-1">{CONFIRMATION_MESSAGES.CHANGE_ROLE}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-4">
            {selectedUser && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Current Role</p>
                    <Badge variant={selectedUser.role === 'admin' ? 'info' : 'secondary'} className="text-sm">
                      {capitalize(selectedUser.role)}
                    </Badge>
                  </div>
                  <div className="text-gray-400">
                    →
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">New Role</p>
                    <Badge variant={selectedUser.role === 'admin' ? 'secondary' : 'info'} className="text-sm">
                      {selectedUser.role === 'admin' ? 'User' : 'Admin'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} variant="default" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify User Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'verify'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Verify User Account</DialogTitle>
                <DialogDescription className="mt-1">Manually verify this user's email address.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-4">
            {selectedUser && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {selectedUser.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser.email}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleVerify} variant="default" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'password'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Reset Password</DialogTitle>
                <DialogDescription className="mt-1">{CONFIRMATION_MESSAGES.RESET_PASSWORD}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 py-4">
            {selectedUser && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password *
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start">
                    <span className="mr-1">💡</span>
                    Minimum 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} variant="default" disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={actionDialog.open && actionDialog.type === 'create'}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent onClose={closeDialog} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <Select
                value={formData.role || 'user'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Registration Type
              </label>
              <Select
                value={formData.registrationType || 'personal'}
                onChange={(e) => setFormData({ ...formData, registrationType: e.target.value as any })}
              >
                <option value="personal">Personal</option>
                <option value="institute">Institute</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+919876543210"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
            {formData.registrationType === 'institute' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institute ID
                  </label>
                  <Input
                    type="text"
                    placeholder="STU2024001"
                    value={formData.instituteId || ''}
                    onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institute Name
                  </label>
                  <Input
                    type="text"
                    placeholder="University Name"
                    value={formData.instituteName || ''}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <Input
                type="text"
                placeholder="Full Address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog} variant="outline" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} variant="default" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
