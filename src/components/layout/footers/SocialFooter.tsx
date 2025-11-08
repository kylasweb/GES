import Link from 'next/link';
import { Leaf, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SocialFooter() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Social Section */}
            <div className="border-b border-gray-800">
                <div className="container px-4 py-12">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">Follow Us</h2>
                        <p className="text-gray-400 mb-8">
                            Stay connected with us on social media for updates, tips, and exclusive offers
                        </p>

                        {/* Large Social Icons */}
                        <div className="flex justify-center space-x-6 mb-8">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
                                    <Facebook className="h-8 w-8 text-white" />
                                </div>
                                <p className="text-sm mt-2 text-gray-400 group-hover:text-white transition-colors">Facebook</p>
                            </a>

                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center hover:bg-sky-600 transition-all hover:scale-110">
                                    <Twitter className="h-8 w-8 text-white" />
                                </div>
                                <p className="text-sm mt-2 text-gray-400 group-hover:text-white transition-colors">Twitter</p>
                            </a>

                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-all hover:scale-110">
                                    <Instagram className="h-8 w-8 text-white" />
                                </div>
                                <p className="text-sm mt-2 text-gray-400 group-hover:text-white transition-colors">Instagram</p>
                            </a>

                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition-all hover:scale-110">
                                    <Linkedin className="h-8 w-8 text-white" />
                                </div>
                                <p className="text-sm mt-2 text-gray-400 group-hover:text-white transition-colors">LinkedIn</p>
                            </a>

                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110">
                                    <Youtube className="h-8 w-8 text-white" />
                                </div>
                                <p className="text-sm mt-2 text-gray-400 group-hover:text-white transition-colors">YouTube</p>
                            </a>
                        </div>

                        {/* Newsletter CTA */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6">
                            <div className="flex items-center justify-center space-x-3 mb-3">
                                <Mail className="h-6 w-6 text-white" />
                                <h3 className="text-xl font-bold text-white">Join Our Newsletter</h3>
                            </div>
                            <p className="text-green-100 mb-4">Get exclusive deals and updates</p>
                            <Link href="/contact">
                                <Button className="bg-white text-green-600 hover:bg-green-50 font-semibold">
                                    Subscribe Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="container px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2">
                        <Leaf className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-white">Green Energy Solutions</span>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-6">
                        <Link href="/about" className="text-sm hover:text-green-500 transition-colors">
                            About
                        </Link>
                        <Link href="/products" className="text-sm hover:text-green-500 transition-colors">
                            Products
                        </Link>
                        <Link href="/blog" className="text-sm hover:text-green-500 transition-colors">
                            Blog
                        </Link>
                        <Link href="/contact" className="text-sm hover:text-green-500 transition-colors">
                            Contact
                        </Link>
                        <Link href="/careers" className="text-sm hover:text-green-500 transition-colors">
                            Careers
                        </Link>
                    </nav>

                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} GES
                    </p>
                </div>
            </div>
        </footer>
    );
}
