'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin/sidebar';
import {
    GitBranch,
    GitCommit,
    Calendar,
    User,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Code,
    Package,
    History
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface GitVersion {
    id: string;
    version: string;
    commitHash: string;
    commitMessage: string;
    branch: string;
    author: string;
    deployedBy: string;
    deployedAt: Date;
    isActive: boolean;
    changelog: string[];
    environment: string;
    buildNumber: number;
    rollbackable: boolean;
}

export default function VersionsPage() {
    const [versions, setVersions] = useState<GitVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<GitVersion | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchVersions();
    }, []);

    const fetchVersions = async () => {
        try {
            const response = await fetch('/api/v1/admin/versions');
            if (response.ok) {
                const data = await response.json();
                setVersions(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load versions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getEnvironmentColor = (env: string) => {
        const colors: Record<string, string> = {
            production: 'bg-green-100 text-green-800 border-green-300',
            staging: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            development: 'bg-blue-100 text-blue-800 border-blue-300',
        };
        return colors[env] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCommitHash = (hash: string) => {
        return hash.substring(0, 7);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    const activeVersion = versions.find(v => v.isActive);
    const productionVersions = versions.filter(v => v.environment === 'production');

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="h-6 w-6 text-primary" />
                            <h1 className="text-3xl font-bold">Version Control</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Track deployment history and manage application versions
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Current Version</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {activeVersion?.version || 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Build #{activeVersion?.buildNumber || 0}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{versions.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Production</CardTitle>
                                <GitBranch className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{productionVersions.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Latest Deploy</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium">
                                    {versions[0] ? formatDate(versions[0].deployedAt).split(',')[0] : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {versions[0] ? formatDate(versions[0].deployedAt).split(',')[1] : ''}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Version Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Deployment History
                            </CardTitle>
                            <CardDescription>
                                Chronological list of all deployments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {versions.map((version, index) => (
                                    <div key={version.id}>
                                        <div className="flex items-start gap-4">
                                            {/* Timeline connector */}
                                            <div className="flex flex-col items-center">
                                                <div className={`rounded-full p-2 ${version.isActive
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    {version.isActive ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <GitCommit className="h-4 w-4" />
                                                    )}
                                                </div>
                                                {index < versions.length - 1 && (
                                                    <div className="w-px h-16 bg-gray-200" />
                                                )}
                                            </div>

                                            {/* Version details */}
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {version.version}
                                                        </h3>
                                                        {version.isActive && (
                                                            <Badge className="bg-green-500 text-white">
                                                                Active
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant="outline"
                                                            className={getEnvironmentColor(version.environment)}
                                                        >
                                                            {version.environment}
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedVersion(version)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>

                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {version.commitMessage}
                                                </p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Code className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Commit:</span>
                                                        <code className="font-mono bg-gray-100 px-1 rounded">
                                                            {formatCommitHash(version.commitHash)}
                                                        </code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Branch:</span>
                                                        <span className="font-medium">{version.branch}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">By:</span>
                                                        <span className="font-medium">{version.deployedBy}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {formatDate(version.deployedAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {version.changelog.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                                            Key Changes:
                                                        </p>
                                                        <ul className="text-sm space-y-1">
                                                            {version.changelog.slice(0, 2).map((change, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <span className="text-green-600 mt-1">•</span>
                                                                    <span>{change}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {version.changelog.length > 2 && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="px-0 h-auto text-xs"
                                                                onClick={() => setSelectedVersion(version)}
                                                            >
                                                                View all {version.changelog.length} changes
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {index < versions.length - 1 && <Separator className="my-4" />}
                                    </div>
                                ))}

                                {versions.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>No deployment history found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Version Details Modal */}
                    <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5" />
                                    Version {selectedVersion?.version}
                                    {selectedVersion?.isActive && (
                                        <Badge className="bg-green-500 text-white">Active</Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription>
                                    Build #{selectedVersion?.buildNumber} • Deployed {selectedVersion && formatDate(selectedVersion.deployedAt)}
                                </DialogDescription>
                            </DialogHeader>

                            {selectedVersion && (
                                <div className="space-y-4">
                                    {/* Commit Info */}
                                    <div className="grid gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">Commit Information</h4>
                                            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Message:</span>
                                                    <span className="font-medium">{selectedVersion.commitMessage}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Hash:</span>
                                                    <code className="font-mono bg-white px-2 py-1 rounded">
                                                        {selectedVersion.commitHash}
                                                    </code>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Branch:</span>
                                                    <span className="font-medium">{selectedVersion.branch}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Author:</span>
                                                    <span className="font-medium">{selectedVersion.author}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Deployment Details</h4>
                                            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Environment:</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={getEnvironmentColor(selectedVersion.environment)}
                                                    >
                                                        {selectedVersion.environment}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Deployed By:</span>
                                                    <span className="font-medium">{selectedVersion.deployedBy}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Deployed At:</span>
                                                    <span className="font-medium">{formatDate(selectedVersion.deployedAt)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Rollbackable:</span>
                                                    <span className="font-medium">
                                                        {selectedVersion.rollbackable ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Changelog */}
                                    {selectedVersion.changelog.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Changelog</h4>
                                            <ul className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
                                                {selectedVersion.changelog.map((change, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{change}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedVersion(null)}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
