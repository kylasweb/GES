'use client';

import { BulkAIGenerator } from '@/components/admin/bulk-ai-generator';

export default function BulkGeneratePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Bulk AI Product Generator</h1>
                <p className="text-gray-600 mt-2">
                    Generate multiple products at once using AI-powered content generation
                </p>
            </div>

            <BulkAIGenerator />
        </div>
    );
}
