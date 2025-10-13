import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Heart
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers - Green Energy Solutions',
  description: 'Join our team and help build a sustainable future. Explore career opportunities at Green Energy Solutions.',
};

const jobOpenings = [
  {
    id: 1,
    title: "Senior Solar Engineer",
    department: "Engineering",
    location: "Bangalore, Karnataka",
    type: "Full-time",
    experience: "5+ years",
    salary: "₹15-25 LPA",
    description: "Lead solar panel design and installation projects, ensuring optimal performance and compliance with industry standards.",
    requirements: [
      "B.Tech/M.Tech in Electrical or Renewable Energy",
      "5+ years of experience in solar energy projects",
      "Strong knowledge of PV systems and design software",
      "Excellent project management skills"
    ],
    posted: "2 weeks ago"
  },
  {
    id: 2,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Mumbai, Maharashtra",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹12-18 LPA",
    description: "Develop and execute marketing strategies to promote our green energy solutions and expand our customer base.",
    requirements: [
      "MBA or equivalent in Marketing",
      "3-5 years of experience in B2C marketing",
      "Experience with digital marketing and SEO",
      "Strong analytical and communication skills"
    ],
    posted: "1 week ago"
  },
  {
    id: 3,
    title: "Sales Executive",
    department: "Sales",
    location: "Delhi, NCR",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹8-12 LPA + incentives",
    description: "Drive sales growth by identifying and converting leads for our solar panels and battery products.",
    requirements: [
      "Bachelor's degree in any discipline",
      "2-4 years of sales experience",
      "Excellent communication and negotiation skills",
      "Target-driven and result-oriented"
    ],
    posted: "3 days ago"
  },
  {
    id: 4,
    title: "Customer Support Specialist",
    department: "Customer Service",
    location: "Remote",
    type: "Full-time",
    experience: "1-3 years",
    salary: "₹4-6 LPA",
    description: "Provide exceptional customer support and technical assistance for our products and services.",
    requirements: [
      "Bachelor's degree or equivalent",
      "1-3 years of customer service experience",
      "Excellent problem-solving skills",
      "Fluent in English and Hindi"
    ],
    posted: "5 days ago"
  }
];

export default function CareersPage() {
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
              💼 Join Our Team
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build a Sustainable Future With Us
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Be part of a mission-driven team that's making a real difference in the renewable energy sector. Grow your career while helping create a greener planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Learn About Our Culture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Work With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer more than just a job - we offer a chance to make a meaningful impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="mb-2">Meaningful Work</CardTitle>
              <CardDescription>
                Contribute to projects that make a real difference in fighting climate change and promoting sustainability.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="mb-2">Great Culture</CardTitle>
              <CardDescription>
                Join a diverse, inclusive team that values collaboration, innovation, and work-life balance.
              </CardDescription>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="mb-2">Career Growth</CardTitle>
              <CardDescription>
                Access continuous learning opportunities, mentorship programs, and clear career advancement paths.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits & Perks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We take care of our team with comprehensive benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
              <CardTitle className="text-lg mb-2">Health Insurance</CardTitle>
              <CardDescription>
                Comprehensive medical coverage for you and your family
              </CardDescription>
            </Card>

            <Card className="p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
              <CardTitle className="text-lg mb-2">Flexible Work</CardTitle>
              <CardDescription>
                Hybrid work options and flexible hours
              </CardDescription>
            </Card>

            <Card className="p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
              <CardTitle className="text-lg mb-2">Professional Development</CardTitle>
              <CardDescription>
                Annual training budget and conference opportunities
              </CardDescription>
            </Card>

            <Card className="p-6">
              <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
              <CardTitle className="text-lg mb-2">Product Discounts</CardTitle>
              <CardDescription>
                Special discounts on our green energy products
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-20 bg-white">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Current Openings
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find your next opportunity with us
            </p>
          </div>
          
          <div className="space-y-6">
            {jobOpenings.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge variant="secondary">{job.department}</Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        {job.type}
                      </Badge>
                    </div>
                    
                    <CardDescription className="mb-4 leading-relaxed">
                      {job.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {job.experience}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salary}
                      </div>
                      <div className="text-gray-500">
                        Posted {job.posted}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Requirements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="lg:ml-6 mt-4 lg:mt-0">
                    <Button className="bg-green-600 hover:bg-green-700 w-full lg:w-auto">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {jobOpenings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No current openings, but we're always looking for talented people. 
                Send your resume to careers@greenenergy.com
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't See the Right Fit?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate individuals who share our vision. 
            Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Button className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
            Send Your Resume
          </Button>
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