'use client';

import { useEffect, useState } from 'react';
import { TemplateRenderer } from '@/components/template-renderer';

export default function HomePage() {
  const [templateSlug, setTemplateSlug] = useState('default');
  const [data, setData] = useState({ categories: [], products: [], deals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch template and data client-side
        const [templateRes, dataRes] = await Promise.all([
          fetch('/api/v1/settings/site'),
          fetch('/api/v1/landing-data')
        ]);

        if (templateRes.ok) {
          const templateData = await templateRes.json();
          setTemplateSlug(templateData?.activeTemplate?.slug || 'default');
        }

        if (dataRes.ok) {
          const landingData = await dataRes.json();
          setData(landingData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <TemplateRenderer templateSlug={templateSlug} data={data} />;
}