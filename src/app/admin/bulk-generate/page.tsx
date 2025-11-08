'use client';

import { BulkAIGenerator } from '@/components/admin/bulk-ai-generator';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function BulkGeneratePage() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Bulk AI Product Generator</h1>
                        <p className="text-gray-600 mt-2">
                            Generate multiple products at once using AI-powered content generation
                        </p>
                    </div>

                    <BulkAIGenerator />
                </div>
            </div>
        </div>
    );
}
