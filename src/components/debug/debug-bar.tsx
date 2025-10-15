'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Bug,
    Database,
    Server,
    Monitor,
    Clock,
    Wifi,
    WifiOff,
    ChevronUp,
    ChevronDown,
    X,
    RefreshCw,
    Copy,
    CheckCircle,
    AlertCircle,
    Info
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

interface DebugInfo {
    timestamp: string;
    userAgent: string;
    url: string;
    viewport: {
        width: number;
        height: number;
    };
    connection: {
        effectiveType: string;
        downlink: number;
        rtt: number;
    };
    memory?: {
        used: number;
        total: number;
        limit: number;
    };
    auth: {
        isAuthenticated: boolean;
        userRole?: string;
        userId?: string;
    };
    environment: {
        nodeEnv: string;
        nextPublicAppUrl: string;
    };
    performance: {
        loadTime: number;
        domContentLoaded: number;
        firstPaint?: number;
        largestContentfulPaint?: number;
    };
}

export function DebugBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const { user, token } = useAuthStore();

    // Show debug bar based on localStorage or default to hidden in production
    useEffect(() => {
        const debugBarEnabled = localStorage.getItem('debugBarEnabled');
        if (debugBarEnabled === 'true') {
            setIsVisible(true);
        } else if (process.env.NODE_ENV === 'development') {
            setIsVisible(true);
        }

        // Add keyboard shortcut to toggle debug bar (Ctrl+Shift+D)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                const newVisibility = !isVisible;
                setIsVisible(newVisibility);
                localStorage.setItem('debugBarEnabled', newVisibility.toString());
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]); const collectDebugInfo = () => {
        if (typeof window === 'undefined') return;

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const memory = (performance as any).memory;

        const info: DebugInfo = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            connection: {
                effectiveType: connection?.effectiveType || 'unknown',
                downlink: connection?.downlink || 0,
                rtt: connection?.rtt || 0,
            },
            auth: {
                isAuthenticated: !!token,
                userRole: user?.role,
                userId: user?.id,
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'unknown',
                nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'unknown',
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            },
        };

        if (memory) {
            info.memory = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            };
        }

        // Try to get performance metrics
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const fp = paintEntries.find(entry => entry.name === 'first-paint');
            const lcp = performance.getEntriesByType('largest-contentful-paint')[0];

            if (fp) info.performance.firstPaint = fp.startTime;
            if (lcp) info.performance.largestContentfulPaint = lcp.startTime;
        } catch (e) {
            // Performance API not fully supported
        }

        setDebugInfo(info);
    };

    const copyDebugInfo = async () => {
        if (!debugInfo) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy debug info:', err);
        }
    };

    const getConnectionIcon = () => {
        const type = debugInfo?.connection.effectiveType;
        if (!type || type === 'unknown') return <WifiOff className="w-4 h-4" />;
        return <Wifi className="w-4 h-4" />;
    };

    const getConnectionColor = () => {
        const type = debugInfo?.connection.effectiveType;
        switch (type) {
            case '4g': return 'text-green-600';
            case '3g': return 'text-yellow-600';
            case '2g':
            case 'slow-2g': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Debug Bar Toggle */}
            <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Bug className="w-4 h-4" />
                    <span className="text-sm font-medium">Debug Bar</span>
                    <Badge variant="secondary" className="text-xs">
                        DEV
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={collectDebugInfo}
                        className="text-white hover:bg-gray-800 h-6 px-2"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white hover:bg-gray-800 h-6 px-2"
                    >
                        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsVisible(false);
                            localStorage.setItem('debugBarEnabled', 'false');
                        }}
                        className="text-white hover:bg-gray-800 h-6 px-2"
                    >
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Debug Panel */}
            {isOpen && (
                <Card className="border-t-0 rounded-t-none max-h-96 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                                <Monitor className="w-4 h-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">Viewport</p>
                                    <p className="text-xs text-gray-600">
                                        {debugInfo?.viewport.width}×{debugInfo?.viewport.height}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className={getConnectionColor()}>
                                    {getConnectionIcon()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Connection</p>
                                    <p className="text-xs text-gray-600">
                                        {debugInfo?.connection.effectiveType?.toUpperCase() || 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Load Time</p>
                                    <p className="text-xs text-gray-600">
                                        {debugInfo?.performance.loadTime}ms
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {debugInfo?.auth.isAuthenticated ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                                <div>
                                    <p className="text-sm font-medium">Auth</p>
                                    <p className="text-xs text-gray-600">
                                        {debugInfo?.auth.isAuthenticated ? 'Logged in' : 'Not logged in'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Environment */}
                            <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                    <Server className="w-4 h-4 mr-1" />
                                    Environment
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Node Env:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {debugInfo?.environment.nodeEnv}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>App URL:</span>
                                        <span className="text-gray-600 truncate ml-2">
                                            {debugInfo?.environment.nextPublicAppUrl}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Authentication */}
                            <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                    <Info className="w-4 h-4 mr-1" />
                                    Authentication
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <Badge variant={debugInfo?.auth.isAuthenticated ? "default" : "secondary"} className="text-xs">
                                            {debugInfo?.auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                                        </Badge>
                                    </div>
                                    {debugInfo?.auth.userRole && (
                                        <div className="flex justify-between">
                                            <span>Role:</span>
                                            <span className="text-gray-600">{debugInfo.auth.userRole}</span>
                                        </div>
                                    )}
                                    {debugInfo?.auth.userId && (
                                        <div className="flex justify-between">
                                            <span>User ID:</span>
                                            <span className="text-gray-600 font-mono text-xs">{debugInfo.auth.userId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Performance */}
                            <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                    <Database className="w-4 h-4 mr-1" />
                                    Performance
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Load Time:</span>
                                        <span className="text-gray-600">{debugInfo?.performance.loadTime}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>DOM Ready:</span>
                                        <span className="text-gray-600">{debugInfo?.performance.domContentLoaded}ms</span>
                                    </div>
                                    {debugInfo?.performance.firstPaint && (
                                        <div className="flex justify-between">
                                            <span>First Paint:</span>
                                            <span className="text-gray-600">{Math.round(debugInfo.performance.firstPaint)}ms</span>
                                        </div>
                                    )}
                                    {debugInfo?.memory && (
                                        <div className="flex justify-between">
                                            <span>Memory:</span>
                                            <span className="text-gray-600">
                                                {debugInfo.memory.used}MB / {debugInfo.memory.total}MB
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Network */}
                            <div>
                                <h3 className="text-sm font-medium mb-2 flex items-center">
                                    <Wifi className="w-4 h-4 mr-1" />
                                    Network
                                </h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="text-gray-600">{debugInfo?.connection.effectiveType || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Downlink:</span>
                                        <span className="text-gray-600">{debugInfo?.connection.downlink} Mbps</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>RTT:</span>
                                        <span className="text-gray-600">{debugInfo?.connection.rtt}ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>URL:</span>
                                        <span className="text-gray-600 truncate ml-2" title={debugInfo?.url}>
                                            {debugInfo?.url}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-2 pt-2 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyDebugInfo}
                                className="text-xs"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copy Debug Info
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}