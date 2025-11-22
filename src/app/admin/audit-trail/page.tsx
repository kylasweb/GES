'use client';

import { AdminSidebar } from '@/components/admin/sidebar';
import { AuditTrailViewer } from '@/components/admin/audit-trail-viewer';
import { useAuthStore } from '@/lib/store/auth';

export default function AuditTrailPage() {
  const { token } = useAuthStore();

  if (!token) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
            <p className="text-red-800 font-medium">Authentication required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-gray-600 mt-2">
              Track all changes made to your system
            </p>
          </div>

          {/* Audit Trail Viewer */}
          <AuditTrailViewer />
        </div>
      </div>
    </div>
  );
}
