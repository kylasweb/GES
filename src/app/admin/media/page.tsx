'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Image as ImageIcon,
    Upload,
    Search,
    Trash2,
    Edit,
    FolderOpen,
    Grid,
    List,
    Download,
    Copy,
    X,
    FileVideo,
    FileText,
    File,
    Plus,
    Filter,
    CheckSquare,
    Square,
    RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    caption?: string;
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER';
    folder?: string;
    tags: string[];
    uploadedBy?: string;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function MediaLibraryPage() {
    const { token } = useAuthStore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [folderFilter, setFolderFilter] = useState('all');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Upload form state
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);
    const [uploadFolder, setUploadFolder] = useState('general');
    const [uploadAlt, setUploadAlt] = useState('');
    const [uploadCaption, setUploadCaption] = useState('');
    const [uploadTags, setUploadTags] = useState('');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        images: 0,
        videos: 0,
        documents: 0,
        totalSize: 0,
    });

    useEffect(() => {
        fetchMedia();
    }, [typeFilter, folderFilter, searchTerm]);

    const fetchMedia = async () => {
        try {
            const params = new URLSearchParams();
            if (typeFilter !== 'all') params.append('type', typeFilter);
            if (folderFilter !== 'all') params.append('folder', folderFilter);
            if (searchTerm) params.append('search', searchTerm);
            params.append('limit', '100');

            const response = await fetch(`/api/v1/admin/media?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setMedia(data.data.media);
                calculateStats(data.data.media);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to load media',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load media',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (mediaList: MediaFile[]) => {
        const stats = {
            total: mediaList.length,
            images: mediaList.filter(m => m.type === 'IMAGE').length,
            videos: mediaList.filter(m => m.type === 'VIDEO').length,
            documents: mediaList.filter(m => m.type === 'DOCUMENT').length,
            totalSize: mediaList.reduce((acc, m) => acc + m.size, 0),
        };
        setStats(stats);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadFiles(files);
        setIsUploadDialogOpen(true);
    };

    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;

        setIsUploading(true);

        try {
            const uploadPromises = uploadFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', uploadFolder);
                formData.append('alt', uploadAlt);
                formData.append('caption', uploadCaption);
                formData.append('tags', uploadTags);

                const response = await fetch('/api/v1/admin/media', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                return response.json();
            });

            const results = await Promise.all(uploadPromises);
            const successCount = results.filter(r => r.success).length;

            toast({
                title: 'Success',
                description: `Uploaded ${successCount} file(s) successfully`,
            });

            setIsUploadDialogOpen(false);
            setUploadFiles([]);
            setUploadAlt('');
            setUploadCaption('');
            setUploadTags('');
            fetchMedia();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload files',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (mediaItem: MediaFile) => {
        setEditingMedia(mediaItem);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingMedia) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/v1/admin/media/${editingMedia.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alt: editingMedia.alt,
                    caption: editingMedia.caption,
                    folder: editingMedia.folder,
                    tags: editingMedia.tags,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Media updated successfully',
                });
                setIsEditDialogOpen(false);
                fetchMedia();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to update media',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update media',
                variant: 'destructive',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const confirmDelete = (id: string) => {
        setMediaToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!mediaToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/v1/admin/media/${mediaToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Media deleted successfully',
                });
                fetchMedia();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to delete media',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete media',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setMediaToDelete(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedMedia.size === 0) return;

        setIsDeleting(true);
        try {
            const response = await fetch('/api/v1/admin/media', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: Array.from(selectedMedia) }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: `Deleted ${data.data.deleted} file(s) successfully`,
                });
                setSelectedMedia(new Set());
                fetchMedia();
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to delete media',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete media',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
            setBulkDeleteDialogOpen(false);
        }
    };

    const toggleSelectMedia = (id: string) => {
        const newSelected = new Set(selectedMedia);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedMedia(newSelected);
    };

    const selectAll = () => {
        if (selectedMedia.size === media.length) {
            setSelectedMedia(new Set());
        } else {
            setSelectedMedia(new Set(media.map(m => m.id)));
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({
            title: 'Copied',
            description: 'URL copied to clipboard',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'IMAGE': return <ImageIcon className="w-4 h-4" />;
            case 'VIDEO': return <FileVideo className="w-4 h-4" />;
            case 'DOCUMENT': return <FileText className="w-4 h-4" />;
            default: return <File className="w-4 h-4" />;
        }
    };

    const folders = Array.from(new Set(media.map(m => m.folder).filter(Boolean)));

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-100">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading media library...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ImageIcon className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                                    <p className="text-sm text-gray-600">Manage your media files</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Files
                                </Button>
                                {selectedMedia.size > 0 && (
                                    <Button variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete ({selectedMedia.size})
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600">Total Files</div>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600">Images</div>
                                    <div className="text-2xl font-bold text-blue-600">{stats.images}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600">Videos</div>
                                    <div className="text-2xl font-bold text-purple-600">{stats.videos}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600">Documents</div>
                                    <div className="text-2xl font-bold text-green-600">{stats.documents}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="text-sm text-gray-600">Total Size</div>
                                    <div className="text-2xl font-bold text-orange-600">{formatFileSize(stats.totalSize)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center justify-between mt-4 gap-4">
                            <div className="flex items-center space-x-2 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search media..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="IMAGE">Images</SelectItem>
                                        <SelectItem value="VIDEO">Videos</SelectItem>
                                        <SelectItem value="DOCUMENT">Documents</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={folderFilter} onValueChange={setFolderFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Folders</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="products">Products</SelectItem>
                                        <SelectItem value="banners">Banners</SelectItem>
                                        <SelectItem value="blog">Blog</SelectItem>
                                        {folders.map(folder => (
                                            folder && <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={selectedMedia.size === media.length && media.length > 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={selectAll}
                                >
                                    {selectedMedia.size === media.length && media.length > 0 ? (
                                        <CheckSquare className="w-4 h-4" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {media.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No media files</h3>
                            <p className="text-gray-600 mb-4">Upload your first file to get started</p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                            </Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {media.map((item) => (
                                <Card
                                    key={item.id}
                                    className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedMedia.has(item.id) ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                >
                                    <CardContent className="p-0">
                                        <div className="relative aspect-square bg-gray-100">
                                            <Checkbox
                                                checked={selectedMedia.has(item.id)}
                                                onCheckedChange={() => toggleSelectMedia(item.id)}
                                                className="absolute top-2 left-2 z-10 bg-white"
                                            />
                                            {item.type === 'IMAGE' ? (
                                                <img
                                                    src={item.thumbnailUrl || item.url}
                                                    alt={item.alt || item.originalName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {getMediaIcon(item.type)}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <div className="flex items-center justify-between text-white text-xs">
                                                    <span className="truncate flex-1">{item.originalName}</span>
                                                    <Badge variant="secondary" className="ml-1">{item.type}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            <div className="flex items-center justify-between text-xs text-gray-600">
                                                <span>{formatFileSize(item.size)}</span>
                                                {item.width && item.height && (
                                                    <span>{item.width} × {item.height}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 flex-1"
                                                    onClick={() => copyUrl(item.url)}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 flex-1"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 flex-1 text-red-600 hover:text-red-700"
                                                    onClick={() => confirmDelete(item.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="w-12 px-4 py-3 text-left">
                                                <Checkbox
                                                    checked={selectedMedia.size === media.length && media.length > 0}
                                                    onCheckedChange={selectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folder</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {media.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <Checkbox
                                                        checked={selectedMedia.has(item.id)}
                                                        onCheckedChange={() => toggleSelectMedia(item.id)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                                        {item.type === 'IMAGE' ? (
                                                            <img
                                                                src={item.thumbnailUrl || item.url}
                                                                alt={item.alt || item.originalName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            getMediaIcon(item.type)
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-gray-900">{item.originalName}</div>
                                                    {item.alt && <div className="text-xs text-gray-500">{item.alt}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="outline">{item.type}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(item.size)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {item.width && item.height ? `${item.width} × ${item.height}` : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary">{item.folder || 'general'}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyUrl(item.url)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => confirmDelete(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
                        <DialogHeader>
                            <DialogTitle>Upload Files</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Selected Files ({uploadFiles.length})</Label>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                    {uploadFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                            <span className="truncate flex-1">{file.name}</span>
                                            <span className="text-gray-600 ml-2">{formatFileSize(file.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="folder">Folder</Label>
                                <Select value={uploadFolder} onValueChange={setUploadFolder}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="products">Products</SelectItem>
                                        <SelectItem value="banners">Banners</SelectItem>
                                        <SelectItem value="blog">Blog</SelectItem>
                                        <SelectItem value="categories">Categories</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="alt">Alt Text (Optional)</Label>
                                <Input
                                    id="alt"
                                    value={uploadAlt}
                                    onChange={(e) => setUploadAlt(e.target.value)}
                                    placeholder="Description for accessibility"
                                />
                            </div>
                            <div>
                                <Label htmlFor="caption">Caption (Optional)</Label>
                                <Textarea
                                    id="caption"
                                    value={uploadCaption}
                                    onChange={(e) => setUploadCaption(e.target.value)}
                                    placeholder="Caption or description"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="tags">Tags (Optional)</Label>
                                <Input
                                    id="tags"
                                    value={uploadTags}
                                    onChange={(e) => setUploadTags(e.target.value)}
                                    placeholder="product, featured, banner (comma-separated)"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading || uploadFiles.length === 0}>
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                        <DialogHeader>
                            <DialogTitle>Edit Media</DialogTitle>
                        </DialogHeader>
                        {editingMedia && (
                            <div className="space-y-4">
                                <div className="flex space-x-4">
                                    <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {editingMedia.type === 'IMAGE' ? (
                                            <img
                                                src={editingMedia.url}
                                                alt={editingMedia.alt || editingMedia.originalName}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="text-center">
                                                {getMediaIcon(editingMedia.type)}
                                                <div className="text-sm text-gray-600 mt-2">{editingMedia.originalName}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <Label>File Name</Label>
                                            <Input value={editingMedia.originalName} disabled />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Type</Label>
                                                <Input value={editingMedia.type} disabled />
                                            </div>
                                            <div>
                                                <Label>Size</Label>
                                                <Input value={formatFileSize(editingMedia.size)} disabled />
                                            </div>
                                        </div>
                                        {editingMedia.width && editingMedia.height && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Width</Label>
                                                    <Input value={editingMedia.width} disabled />
                                                </div>
                                                <div>
                                                    <Label>Height</Label>
                                                    <Input value={editingMedia.height} disabled />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="edit-alt">Alt Text</Label>
                                    <Input
                                        id="edit-alt"
                                        value={editingMedia.alt || ''}
                                        onChange={(e) => setEditingMedia({ ...editingMedia, alt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-caption">Caption</Label>
                                    <Textarea
                                        id="edit-caption"
                                        value={editingMedia.caption || ''}
                                        onChange={(e) => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-folder">Folder</Label>
                                    <Select
                                        value={editingMedia.folder || 'general'}
                                        onValueChange={(value) => setEditingMedia({ ...editingMedia, folder: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="products">Products</SelectItem>
                                            <SelectItem value="banners">Banners</SelectItem>
                                            <SelectItem value="blog">Blog</SelectItem>
                                            <SelectItem value="categories">Categories</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="edit-tags">Tags</Label>
                                    <Input
                                        id="edit-tags"
                                        value={editingMedia.tags?.join(', ') || ''}
                                        onChange={(e) => setEditingMedia({
                                            ...editingMedia,
                                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                        })}
                                        placeholder="Comma-separated tags"
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the media file.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedMedia.size} selected files.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
