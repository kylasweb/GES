import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  Calendar,
  Clock,
  ArrowRight,
  Sun,
  Battery,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Green Energy Solutions',
  description: 'Stay updated with the latest news, tips, and insights about renewable energy and sustainable living.',
};

const blogPosts = [
  {
    id: 1,
    title: "The Future of Solar Energy in India",
    excerpt: "Exploring the growing adoption of solar power across Indian households and businesses, and what it means for our energy future.",
    category: "Solar Energy",
    date: "2024-01-15",
    readTime: "5 min read",
    image: "/blog-solar-future.jpg",
    featured: true
  },
  {
    id: 2,
    title: "Choosing the Right Battery for Your Home",
    excerpt: "A comprehensive guide to selecting the perfect battery system for your home energy needs, including capacity, type, and budget considerations.",
    category: "Batteries",
    date: "2024-01-10",
    readTime: "7 min read",
    image: "/blog-battery-guide.jpg",
    featured: false
  },
  {
    id: 3,
    title: "5 Ways to Reduce Your Carbon Footprint",
    excerpt: "Simple yet effective strategies to minimize your environmental impact and contribute to a more sustainable future.",
    category: "Sustainability",
    date: "2024-01-05",
    readTime: "4 min read",
    image: "/blog-carbon-footprint.jpg",
    featured: false
  },
  {
    id: 4,
    title: "Understanding Net Metering for Solar Panels",
    excerpt: "Learn how net metering works and how you can benefit from feeding excess solar energy back to the grid.",
    category: "Solar Energy",
    date: "2023-12-28",
    readTime: "6 min read",
    image: "/blog-net-metering.jpg",
    featured: false
  },
  {
    id: 5,
    title: "Maintenance Tips for Solar Panel Systems",
    excerpt: "Essential maintenance practices to keep your solar panels operating at peak efficiency for years to come.",
    category: "Maintenance",
    date: "2023-12-20",
    readTime: "5 min read",
    image: "/blog-maintenance.jpg",
    featured: false
  },
  {
    id: 6,
    title: "The Economics of Going Solar",
    excerpt: "Break down the costs, savings, and return on investment for residential solar panel installations in India.",
    category: "Cost Analysis",
    date: "2023-12-15",
    readTime: "8 min read",
    image: "/blog-solar-economics.jpg",
    featured: false
  }
];

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Green Energy Solutions</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              Products
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </nav>

          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">
              📝 Green Energy Blog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Insights & Updates
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Stay informed about the latest trends, technologies, and tips in renewable energy and sustainable living.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 bg-white">
          <div className="container px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Article</h2>
              <div className="w-20 h-1 bg-green-600"></div>
            </div>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-video md:aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Sun className="h-24 w-24 text-green-600" />
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      {featuredPost.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-2xl mb-4">{featuredPost.title}</CardTitle>
                  <CardDescription className="text-lg mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </CardDescription>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Read Full Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Articles</h2>
            <div className="w-20 h-1 bg-green-600"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  {post.category === "Solar Energy" && <Sun className="h-16 w-16 text-green-600" />}
                  {post.category === "Batteries" && <Battery className="h-16 w-16 text-green-600" />}
                  {post.category === "Sustainability" && <Leaf className="h-16 w-16 text-green-600" />}
                  {post.category === "Maintenance" && <TrendingUp className="h-16 w-16 text-green-600" />}
                  {post.category === "Cost Analysis" && <TrendingUp className="h-16 w-16 text-green-600" />}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Green Energy Insights
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss an update on renewable energy trends and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-lg font-bold">Green Energy Solutions</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for sustainable energy solutions in India.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products/batteries" className="hover:text-white">Batteries</Link></li>
                <li><Link href="/products/solar-panels" className="hover:text-white">Solar Panels</Link></li>
                <li><Link href="/products/accessories" className="hover:text-white">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/warranty" className="hover:text-white">Warranty</Link></li>
                <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Green Energy Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}