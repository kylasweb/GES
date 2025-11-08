import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function DefaultFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Leaf className="h-6 w-6 text-green-500" />
                            <span className="text-xl font-bold text-white">GES</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Leading provider of renewable energy solutions for a sustainable future.
                        </p>
                        <div className="flex space-x-3">
                            <a href="#" className="hover:text-green-500 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-sm hover:text-green-500 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sm hover:text-green-500 transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm hover:text-green-500 transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-sm hover:text-green-500 transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm hover:text-green-500 transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/track" className="text-sm hover:text-green-500 transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-sm hover:text-green-500 transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link href="/warranty" className="text-sm hover:text-green-500 transition-colors">
                                    Warranty
                                </Link>
                            </li>
                            <li>
                                <Link href="/account" className="text-sm hover:text-green-500 transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/wishlist" className="text-sm hover:text-green-500 transition-colors">
                                    Wishlist
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@greenenergysolutions.in" className="text-sm hover:text-green-500 transition-colors">
                                    info@greenenergysolutions.in
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <a href="tel:+911234567890" className="text-sm hover:text-green-500 transition-colors">
                                    +91 1234567890
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">
                                    Mumbai, Maharashtra, India
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Green Energy Solutions. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
