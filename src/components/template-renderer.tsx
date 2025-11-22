'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateRendererProps {
  templateSlug: string;
  data?: any;
}

const templateComponents: Record<string, any> = {
  default: lazy(() => import('@/app/page')),
  flipkart: lazy(() => import('@/app/templates/flipkart/page')),
  neomorphic: lazy(() => import('@/app/templates/neomorphic/page')),
};

export function TemplateRenderer({ templateSlug, data }: TemplateRendererProps) {
  // If template doesn't exist, fall back to default
  const TemplateComponent = templateComponents[templateSlug] || templateComponents.default;

  return (
    <Suspense fallback={<TemplateLoadingSkeleton />}>
      <TemplateComponent data={data} />
    </Suspense>
  );
}

function TemplateLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[500px] w-full" />
      <Skeleton className="h-[300px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}