'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterFooter() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate newsletter subscription
        setTimeout(() => {
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <footer className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
            {/* Newsletter Section */}
            <div className="border-b border-green-500/30">
                <div className="container px-4 py-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-3">Stay Updated</h2>
                        <p className="text-green-100 mb-6">
                            Subscribe to our newsletter for the latest updates on renewable energy solutions
                        </p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white/10 border-white/30 text-white placeholder:text-green-200 focus:bg-white/20"
                            />
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-white text-green-600 hover:bg-green-50 font-semibold"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="container px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Company */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Leaf className="h-6 w-6" />
                            <span className="text-xl font-bold">GES</span>
                        </div>
                        <p className="text-green-100 text-sm">
                            Leading provider of renewable energy solutions
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-sm text-green-100 hover:text-white transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-green-100 hover:text-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-green-100 hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2 text-sm text-green-100">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:info@greenenergysolutions.in" className="hover:text-white transition-colors">
                                    info@greenenergysolutions.in
                                </a>
                            </li>
                            <li className="flex items-center space-x-2 text-sm text-green-100">
                                <Phone className="h-4 w-4" />
                                <a href="tel:+911234567890" className="hover:text-white transition-colors">
                                    +91 1234567890
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-green-500/30 pt-6 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-sm text-green-100 mb-4 md:mb-0">
                        © {new Date().getFullYear()} Green Energy Solutions. All rights reserved.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-white transition-colors">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
