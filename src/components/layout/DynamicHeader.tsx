'use client';

import { useEffect, useState } from 'react';
import { DefaultHeader } from './headers/DefaultHeader';
import { MinimalHeader } from './headers/MinimalHeader';
import { CenteredHeader } from './headers/CenteredHeader';
import { TransparentHeader } from './headers/TransparentHeader';
import { MegaHeader } from './headers/MegaHeader';

interface DynamicHeaderProps {
    defaultStyle?: string;
}

export function DynamicHeader({ defaultStyle = 'default' }: DynamicHeaderProps) {
    const [headerStyle, setHeaderStyle] = useState(defaultStyle);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchHeaderStyle() {
            try {
                const response = await fetch('/api/v1/appearance');
                if (response.ok) {
                    const data = await response.json();
                    setHeaderStyle(data.headerStyle || 'default');
                }
            } catch (error) {
                console.error('Failed to fetch header style:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchHeaderStyle();
    }, []); if (isLoading) {
        // Return default header while loading
        return <DefaultHeader />;
    }

    switch (headerStyle) {
        case 'minimal':
            return <MinimalHeader />;
        case 'centered':
            return <CenteredHeader />;
        case 'transparent':
            return <TransparentHeader />;
        case 'mega':
            return <MegaHeader />;
        case 'default':
        default:
            return <DefaultHeader />;
    }
}
