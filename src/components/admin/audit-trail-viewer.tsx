'use client';

import { useState, useEffect, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Calendar, User, Database, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AuditTrailEntry {
  id: string;
  userId: string;
  tableName: string;
  recordId: string;
  action: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  user?: {
    name: string;
    email: string;
  };
}

interface AuditTrailViewerProps {
  className?: string;
}

export function AuditTrailViewer({ className }: AuditTrailViewerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditTrailEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/admin/audit-trail');
        const data = await response.json();

        if (data.success) {
          setAuditLogs(data.data);
          setFilteredLogs(data.data);
        } else {
          setError(data.error || 'Failed to fetch audit logs');
        }
      } catch (err) {
        setError('Failed to fetch audit logs');
        console.error('Fetch audit logs error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...auditLogs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.user?.name?.toLowerCase().includes(term) ||
        log.user?.email?.toLowerCase().includes(term) ||
        log.tableName.toLowerCase().includes(term) ||
        log.recordId.toLowerCase().includes(term)
      );
    }

    // Table filter
    if (tableFilter !== 'all') {
      result = result.filter(log => log.tableName === tableFilter);
    }

    // Action filter
    if (actionFilter !== 'all') {
      result = result.filter(log => log.action === actionFilter);
    }

    // Date filter
    if (dateFilter) {
      result = result.filter(log => 
        format(new Date(log.timestamp), 'yyyy-MM-dd') === dateFilter
      );
    }

    setFilteredLogs(result);
  }, [searchTerm, tableFilter, actionFilter, dateFilter, auditLogs]);

  // Get unique table names for filter
  const tableNames = Array.from(new Set(auditLogs.map(log => log.tableName)));

  // Get unique actions for filter
  const actions = Array.from(new Set(auditLogs.map(log => log.action)));

  // Get action badge variant
  const getActionVariant = (action: string) => {
    switch (action) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const renderChanges = (log: AuditTrailEntry) => {
    if (log.action === 'INSERT' && log.newValues) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {Object.entries(log.newValues).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      );
    }

    if (log.action === 'UPDATE' && log.oldValues && log.newValues) {
      const changedFields = Object.keys(log.newValues).filter(key => 
        log.oldValues?.[key] !== log.newValues?.[key]
      );

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          <div className="font-medium">Field</div>
          <div className="font-medium">Old Value</div>
          <div className="font-medium">New Value</div>
          {changedFields.map(key => (
            <Fragment key={key}>
              <div className="font-medium">{key}</div>
              <div className="text-red-600 line-through">{String(log.oldValues?.[key] ?? '')}</div>
              <div className="text-green-600">{String(log.newValues?.[key] ?? '')}</div>
            </Fragment>
          ))}
        </div>
      );
    }

    if (log.action === 'DELETE' && log.oldValues) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {Object.entries(log.oldValues).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      );
    }

    return <div className="text-sm text-gray-500 mt-2">No detailed changes available</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center p-4 bg-red-50 rounded-lg max-w-md">
          <p className="text-red-800 font-medium">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-1 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by user, table, or record..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="table" className="text-sm font-medium mb-1 block">
                Table
              </Label>
              <Select value={tableFilter} onValueChange={setTableFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {tableNames.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action" className="text-sm font-medium mb-1 block">
                Action
              </Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-sm font-medium mb-1 block">
                Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setTableFilter('all');
                  setActionFilter('all');
                  setDateFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity ({filteredLogs.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(log.id)}
                            className="p-0 h-6 w-6"
                          >
                            {expandedRows.has(log.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2" />
                            <div>
                              <div className="font-medium">{log.user?.name || 'Unknown User'}</div>
                              <div className="text-sm text-gray-500">{log.user?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Database className="w-4 h-4 mr-2 text-gray-500" />
                            {log.tableName}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.recordId}</TableCell>
                        <TableCell>
                          <Badge variant={getActionVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(log.timestamp), 'MMM d, yyyy')}
                            <div className="text-gray-500 text-xs">
                              {format(new Date(log.timestamp), 'h:mm a')}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4">
                              <h4 className="font-medium mb-2">Changes:</h4>
                              {renderChanges(log)}
                              <div className="mt-3 text-xs text-gray-500">
                                <div>IP: {log.ipAddress || 'Unknown'}</div>
                                <div className="truncate max-w-md">User Agent: {log.userAgent || 'Unknown'}</div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}