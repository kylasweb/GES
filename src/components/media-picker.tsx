'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Image as ImageIcon, Search, Upload, X, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface MediaFile {
    id: string;
    filename: string;
    originalName: string;
    url: string;
    thumbnailUrl?: string;
    type: string;
    size: number;
    alt?: string;
}

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (urls: string[]) => void;
    multiple?: boolean;
    type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'all';
    selectedUrls?: string[];
}

export function MediaPicker({
    isOpen,
    onClose,
    onSelect,
    multiple = false,
    type = 'IMAGE',
    selectedUrls = []
}: MediaPickerProps) {
    const { token } = useAuthStore();
    const { toast } = useToast();

    const [media, setMedia] = useState<MediaFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [folderFilter, setFolderFilter] = useState('all');
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedUrls));

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSelected(new Set(selectedUrls));
        }
    }, [isOpen, type, folderFilter, searchTerm]);

    const fetchMedia = async () => {
        try {
            const params = new URLSearchParams();
            if (type !== 'all') params.append('type', type);
            if (folderFilter !== 'all') params.append('folder', folderFilter);
            if (searchTerm) params.append('search', searchTerm);
            params.append('limit', '100');

            const response = await fetch(`/api/v1/admin/media?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setMedia(data.data.media);
            }
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelect = (url: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(url)) {
            newSelected.delete(url);
        } else {
            if (multiple) {
                newSelected.add(url);
            } else {
                newSelected.clear();
                newSelected.add(url);
            }
        }
        setSelected(newSelected);
    };

    const handleConfirm = () => {
        onSelect(Array.from(selected));
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Select Media {multiple && `(${selected.size} selected)`}
                    </DialogTitle>
                </DialogHeader>

                {/* Filters */}
                <div className="flex items-center space-x-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
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
                        </SelectContent>
                    </Select>
                </div>

                {/* Media Grid */}
                <div className="overflow-y-auto max-h-96">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-600">Loading media...</div>
                    ) : media.length === 0 ? (
                        <div className="text-center py-12">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600">No media files found</p>
                            <Button
                                variant="link"
                                onClick={() => window.open('/admin/media', '_blank')}
                                className="mt-2"
                            >
                                Upload files in Media Library
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${selected.has(item.url) ? 'ring-2 ring-blue-600' : ''
                                        }`}
                                    onClick={() => toggleSelect(item.url)}
                                >
                                    {item.type === 'IMAGE' ? (
                                        <Image
                                            src={item.thumbnailUrl || item.url}
                                            alt={item.alt || item.originalName}
                                            fill
                                            className="object-cover"
                                            sizes="25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    {selected.has(item.url) && (
                                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                                        <div className="text-white text-xs truncate">{item.originalName}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => window.open('/admin/media', '_blank')}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={selected.size === 0}>
                            Select {selected.size > 0 && `(${selected.size})`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
