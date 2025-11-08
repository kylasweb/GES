import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function MinimalFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="container px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-gray-900">Green Energy Solutions</span>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center space-x-6">
                        <Link href="/about" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            About
                        </Link>
                        <Link href="/contact" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            Contact
                        </Link>
                        <Link href="/returns" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            Returns
                        </Link>
                        <Link href="/warranty" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
                            Warranty
                        </Link>
                    </nav>

                    {/* Copyright */}
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} GES
                    </p>
                </div>
            </div>
        </footer>
    );
}
