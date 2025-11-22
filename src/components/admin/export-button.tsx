'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  type: 'products' | 'orders' | 'users' | 'brands';
  className?: string;
}

export function ExportButton({ type, className }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/v1/admin/export?type=${type}&format=${format}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Export failed');
      }

      if (format === 'json') {
        // For JSON, create a download link
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For CSV, use the download URL
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      toast({
        title: 'Export Successful',
        description: `Your ${type} data has been exported successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        disabled={isLoading}
        className="mr-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('json')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export JSON
      </Button>
    </div>
  );
}