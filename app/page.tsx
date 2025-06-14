"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ChefHat,
  CheckCircle,
  Menu,
  X,
  Play,
  Zap,
  BarChart3,
  Globe,
  Shield,
  QrCode,
  Smartphone,
  Users,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Plus,
  Eye,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const { data: session } = useSession();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % detailedFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Noodle Bar",
      content:
        "Revenue increased 40% in the first quarter. The insights are incredible.",
      rating: 5,
      avatar: "SC",
      restaurant: "Noodle Bar",
      location: "San Francisco, CA",
    },
    {
      name: "Marcus Johnson",
      role: "GM, Coastal Kitchen",
      content: "Cut operational costs by 30%. Best investment we've made.",
      rating: 5,
      avatar: "MJ",
      restaurant: "Coastal Kitchen",
      location: "Miami, FL",
    },
    {
      name: "Elena Rodriguez",
      role: "Owner, Verde Bistro",
      content: "Customer satisfaction scores went from 3.2 to 4.8 stars.",
      rating: 5,
      avatar: "ER",
      restaurant: "Verde Bistro",
      location: "Austin, TX",
    },
  ];

  const features = [
    {
      icon: <QrCode className="w-5 h-5" />,
      title: "QR Menu System",
      description: "Contactless digital menus accessible via QR codes",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Real-time Analytics",
      description: "Track performance metrics that matter",
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Mobile Optimized",
      description: "Perfect experience on all devices",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-level security for your data",
    },
  ];

  const detailedFeatures = [
    {
      title: "Digital Menu Management",
      description:
        "Create beautiful, interactive menus that customers can access instantly by scanning QR codes. Update prices and items in real-time.",
      image: "/api/placeholder/600/400",
      benefits: [
        "Instant menu updates",
        "Multi-language support",
        "Rich media integration",
        "Allergen information",
      ],
    },
    {
      title: "Advanced Analytics Dashboard",
      description:
        "Get deep insights into customer behavior, popular items, peak hours, and revenue trends with our comprehensive analytics suite.",
      image: "/api/placeholder/600/400",
      benefits: [
        "Customer engagement metrics",
        "Popular item tracking",
        "Revenue analytics",
        "Peak time analysis",
      ],
    },
    {
      title: "QR Code Generator",
      description:
        "Generate custom QR codes for each table or location. Track scans and customer interactions across all touchpoints.",
      image: "/api/placeholder/600/400",
      benefits: [
        "Custom QR designs",
        "Table-specific codes",
        "Scan tracking",
        "Print-ready formats",
      ],
    },
  ];

  const stats = [
    { number: "25,000+", label: "Restaurants" },
    { number: "2.5M+", label: "Menu Scans" },
    { number: "98%", label: "Uptime" },
    { number: "4.9/5", label: "Rating" },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "",
      originalPrice: null,
      description: "Perfect for getting started",
      features: [
        "1 Menu",
        "4 Categories",
        "20 Items",
        "Basic QR codes",
        "Mobile responsive",
      ],
      limitations: [
        "No Analytics",
        "No Immediate Support",
        "No Custom QR Generation",
        "No Custom Branding",
        "No Early Features",
        "No Feedback System",
      ],
      popular: false,
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Premium",
      price: billingCycle === "monthly" ? "₹299" : "₹3,999",
      period: billingCycle === "monthly" ? "/month" : "/year",
      originalPrice: billingCycle === "annual" ? "₹3,588" : null,
      description: "Everything you need to grow",
      features: [
        "Unlimited Menus",
        "Unlimited Categories",
        "Unlimited Items",
        "Advanced Analytics",
        "Immediate Support",
        "Custom QR Generation (on request)",
        "Custom Branding (on request)",
        "Early Features Sneak Peeks",
        "Feedback System",
        "Priority Support",
        "Custom Domain",
      ],
      popular: true,
      cta:
        billingCycle === "monthly" ? "Start Monthly Plan" : "Start Annual Plan",
      highlight: true,
      savings: billingCycle === "annual" ? "Save ₹589/year" : null,
    },
  ];

  const faqs = [
    {
      question: "How quickly can I set up my digital menu?",
      answer:
        "You can have your first digital menu live in under 10 minutes. Our intuitive interface makes it easy to add items, set prices, and generate QR codes instantly.",
    },
    {
      question: "Do customers need to download an app?",
      answer:
        "No! Customers simply scan the QR code with their phone's camera and view your menu in their web browser. No app downloads required.",
    },
    {
      question: "Can I update my menu in real-time?",
      answer:
        "Absolutely! Any changes you make to your menu are instantly reflected for all customers. Perfect for daily specials, price changes, or sold-out items.",
    },
    {
      question: "What's included in the Free plan?",
      answer:
        "The Free plan includes 1 menu with up to 4 categories and 20 items. You get basic QR codes and mobile-responsive menus. Perfect for small restaurants getting started.",
    },
    {
      question: "What additional features do I get with Premium?",
      answer:
        "Premium includes unlimited menus and items, advanced analytics, immediate support, custom QR generation, custom branding, early feature access, and a feedback system.",
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer:
        "Yes! You can upgrade to Premium anytime to unlock all features. You can also downgrade, though some features will be limited based on your plan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                ResQr
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Reviews
              </a>
              {session ? (
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/sign-in">Sign In</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/sign-up">Get Started</a>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="#testimonials"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reviews
                </a>
                <div className="flex flex-col space-y-2 pt-4">
                  {session ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard">Dashboard</a>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/sign-in">Sign In</a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href="/sign-up">Get Started</a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <Badge variant="secondary" className="text-sm font-medium">
              Trusted by 25,000+ restaurants worldwide
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Digital menus that
              <span className="text-primary"> customers love</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Create beautiful QR code menus in minutes. No app downloads, no
              printing costs, no hassle. Just scan, browse, and order.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="px-8 py-3 text-base font-medium h-12"
                asChild
              >
                <a href="/sign-up">Start Free Trial</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-base font-medium h-12"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
              Start free forever • No credit card required • Upgrade anytime
            </div>
          </div>

          {/* Enhanced Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="bg-muted/50 rounded-2xl p-4 md:p-8 border border-border">
              {/* Dashboard Container */}
              <div className="bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
                {/* Dashboard Layout */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="hidden md:block w-64 bg-muted/30 border-r border-border">
                    <div className="p-4 space-y-6">
                      {/* Logo */}
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                          <ChefHat className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">
                          ResQr
                        </span>
                      </div>

                      {/* Quick Create Button */}
                      <Button size="sm" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Create
                      </Button>

                      {/* Navigation */}
                      <nav className="space-y-1">
                        <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
                          <BarChart3 className="w-4 h-4" />
                          <span>Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <Menu className="w-4 h-4" />
                          <span>Menus</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <QrCode className="w-4 h-4" />
                          <span>QR Codes</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>Analytics</span>
                        </div>
                      </nav>

                      {/* Bottom Navigation */}
                      <div className="space-y-1 pt-4 border-t border-border">
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <HelpCircle className="w-4 h-4" />
                          <span>Get Help</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground text-sm">
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </div>
                      </div>

                      {/* User Profile */}
                      <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-md">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            SS
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            Sarah Smith
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            sarah@restaurant.com
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4 md:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">
                          Dashboard
                        </h1>
                      </div>
                    </div>

                    {/* Restaurant Info Card */}
                    <Card>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                                Bella Vista Bistro
                              </h2>
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                Active
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                PREMIUM
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-3 h-3" />
                                <span>123 Main Street, Downtown</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3" />
                                <span>contact@bellavista.com</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3" />
                                <span>+91 98765 43210</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ChefHat className="w-3 h-3" />
                                <span>Italian Cuisine</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">
                            8
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Total Menus
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">
                            142
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Menu Items
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">
                            24
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            QR Codes
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">
                            4.8
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Rating
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground">
                              Menu "Dinner Special" updated
                            </span>
                            <span className="text-xs text-muted-foreground">
                              2h ago
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground">
                              New item "Truffle Pasta" added
                            </span>
                            <span className="text-xs text-muted-foreground">
                              4h ago
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground">
                              QR Code for "Table 12" generated
                            </span>
                            <span className="text-xs text-muted-foreground">
                              6h ago
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-foreground">
                              Menu scan count reached 1,000
                            </span>
                            <span className="text-xs text-muted-foreground">
                              1d ago
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Everything you need for digital menus
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From QR code generation to advanced analytics, we've got
              everything covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-md transition-all"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground">
                  {detailedFeatures[activeFeature].title}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {detailedFeatures[activeFeature].description}
                </p>
              </div>

              <div className="space-y-3">
                {detailedFeatures[activeFeature].benefits.map(
                  (benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  )
                )}
              </div>

              <div className="flex space-x-2">
                {detailedFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeFeature ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-background rounded-2xl p-8 border border-border shadow-lg">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      Feature Preview Coming Soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">How it works</h2>
            <p className="text-xl text-muted-foreground">
              Get your digital menu up and running in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Create Your Menu
              </h3>
              <p className="text-muted-foreground">
                Add your dishes, prices, and descriptions using our intuitive
                menu builder.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Generate QR Codes
              </h3>
              <p className="text-muted-foreground">
                Create custom QR codes for each table or location with your
                branding.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary-foreground">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Track & Optimize
              </h3>
              <p className="text-muted-foreground">
                Monitor customer engagement and optimize your menu based on
                real-time data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Loved by restaurant owners
            </h2>
            <p className="text-xl text-muted-foreground">
              See how we're helping restaurants grow their business
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardContent className="text-center space-y-6 p-0">
                <div className="flex justify-center space-x-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>
                <blockquote className="text-xl text-foreground font-medium leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonials[activeTestimonial].avatar}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {testimonials[activeTestimonial].role}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonials[activeTestimonial].location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeTestimonial
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-muted p-1 rounded-lg flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "annual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <Badge className="ml-2 bg-green-100 text-green-700 text-xs">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.highlight
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  </div>
                  {plan.savings && (
                    <div className="text-sm text-green-600 font-medium">
                      {plan.savings}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">
                      Included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-foreground text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations && (
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-3">
                        Not included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li
                            key={limitationIndex}
                            className="flex items-center space-x-3"
                          >
                            <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-primary hover:bg-primary/90"
                        : "variant-outline"
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                    asChild
                  >
                    <a href="/sign-up">{plan.cta}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about ResQr
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-primary-foreground">
            Ready to modernize your restaurant?
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Start with our free plan and upgrade when you're ready. No credit
            card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-muted px-8 py-3 font-medium h-12"
              asChild
            >
              <a href="/sign-up">Start Free Today</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 font-medium h-12"
            >
              Schedule Demo
            </Button>
          </div>
          <div className="text-primary-foreground/70 text-sm">
            Free forever plan • No credit card required • Upgrade anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  ResQr
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                The modern way to manage restaurant menus. Create beautiful
                digital menus that customers can access instantly with QR codes.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Status
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Press
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 ResQr. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
