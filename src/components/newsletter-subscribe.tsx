'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/v1/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'footer' }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success!',
                    description: 'You have successfully subscribed to our newsletter',
                });
                setEmail('');
            } else {
                toast({
                    title: 'Subscription Failed',
                    description: data.error || 'Something went wrong',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to subscribe. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
                Subscribe to get updates on new products and exclusive offers.
            </p>
        </div>
    );
}
