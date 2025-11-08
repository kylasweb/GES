'use client';

import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
    url: string;
    title: string;
    description?: string;
    image?: string;
}

export function SocialShare({ url, title, description, image }: SocialShareProps) {
    const { toast } = useToast();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description || '');

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        pinterest: image
            ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedTitle}`
            : null,
    };

    const handleShare = (platform: string, link: string) => {
        window.open(link, '_blank', 'width=600,height=400');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: 'Link Copied!',
                description: 'Product link copied to clipboard',
            });
        } catch (error) {
            toast({
                title: 'Copy Failed',
                description: 'Failed to copy link',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('Facebook', shareLinks.facebook)}
                className="hover:bg-blue-50 hover:text-blue-600"
            >
                <Facebook className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('Twitter', shareLinks.twitter)}
                className="hover:bg-sky-50 hover:text-sky-600"
            >
                <Twitter className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('LinkedIn', shareLinks.linkedin)}
                className="hover:bg-blue-50 hover:text-blue-700"
            >
                <Linkedin className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('WhatsApp', shareLinks.whatsapp)}
                className="hover:bg-green-50 hover:text-green-600"
            >
                <MessageCircle className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="hover:bg-gray-50"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}
