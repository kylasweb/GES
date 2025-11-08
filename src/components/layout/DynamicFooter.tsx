'use client';

import { useEffect, useState } from 'react';
import { DefaultFooter } from './footers/DefaultFooter';
import { MinimalFooter } from './footers/MinimalFooter';
import { NewsletterFooter } from './footers/NewsletterFooter';
import { SocialFooter } from './footers/SocialFooter';

interface DynamicFooterProps {
    defaultStyle?: string;
}

export function DynamicFooter({ defaultStyle = 'default' }: DynamicFooterProps) {
    const [footerStyle, setFooterStyle] = useState(defaultStyle);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchFooterStyle() {
            try {
                const response = await fetch('/api/v1/appearance');
                if (response.ok) {
                    const data = await response.json();
                    setFooterStyle(data.footerStyle || 'default');
                }
            } catch (error) {
                console.error('Failed to fetch footer style:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFooterStyle();
    }, []); if (isLoading) {
        // Return default footer while loading
        return <DefaultFooter />;
    }

    switch (footerStyle) {
        case 'minimal':
            return <MinimalFooter />;
        case 'newsletter':
            return <NewsletterFooter />;
        case 'social':
            return <SocialFooter />;
        case 'default':
        default:
            return <DefaultFooter />;
    }
}
