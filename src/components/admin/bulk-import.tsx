'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkImportProps {
  type: 'products' | 'orders' | 'users' | 'brands';
  onImportComplete?: () => void;
  className?: string;
}

export function BulkImport({ type, onImportComplete, className }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        setError('Please upload a CSV or Excel file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`/api/v1/admin/${type}/bulk-import`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${data.data?.successful || 0} ${type}. ${data.data?.failed || 0} failed.`,
        });
        
        // Reset form after success
        setTimeout(() => {
          setFile(null);
          setSuccess(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          if (onImportComplete) {
            onImportComplete();
          }
        }, 2000);
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Failed to import data',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create sample CSV template based on type
    let headers: string[] = [];
    let sampleData: string[] = [];

    switch (type) {
      case 'products':
        headers = [
          'name',
          'sku',
          'description',
          'shortDesc',
          'price',
          'comparePrice',
          'costPrice',
          'trackQuantity',
          'quantity',
          'weight',
          'categoryName',
          'brandName',
          'isActive',
          'featured',
          'seoTitle',
          'seoDesc',
          'images'
        ];
        sampleData = [
          'Sample Product 1',
          'SP001',
          'This is a detailed description of the product',
          'Short description',
          '99.99',
          '129.99',
          '50.00',
          'true',
          '100',
          '1.5',
          'Electronics',
          'Sample Brand',
          'true',
          'false',
          'Sample Product SEO Title',
          'Sample product SEO description',
          'https://example.com/image1.jpg,https://example.com/image2.jpg'
        ];
        break;
      case 'users':
        headers = ['name', 'email', 'role', 'isActive'];
        sampleData = ['John Doe', 'john@example.com', 'CUSTOMER', 'true'];
        break;
      case 'brands':
        headers = ['name', 'description', 'website', 'sortOrder', 'isActive'];
        sampleData = ['Sample Brand', 'Brand description', 'https://example.com', '0', 'true'];
        break;
      default:
        headers = ['name'];
        sampleData = ['Sample Item'];
    }

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_bulk_import_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Bulk Import {type.charAt(0).toUpperCase() + type.slice(1)}
        </CardTitle>
        <CardDescription>
          Upload a CSV or Excel file to import multiple {type} at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Import completed successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload File</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isUploading}
              className="flex-1"
            />
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              size="sm"
              disabled={isUploading}
            >
              <FileText className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: CSV, Excel (.xlsx). Max file size: 10MB
          </p>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              Importing... {uploadProgress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import {type.charAt(0).toUpperCase() + type.slice(1)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}