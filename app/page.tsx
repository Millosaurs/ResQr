"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ChefHat, TrendingUp, Users, Clock, Shield, CheckCircle, ArrowRight, Menu, X, Play, Phone, Mail, MapPin, Zap, BarChart3, Globe } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Owner, Noodle Bar",
      content: "Revenue increased 40% in the first quarter. The insights are incredible.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "GM, Coastal Kitchen",
      content: "Cut operational costs by 30%. Best investment we've made.",
      rating: 5,
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: "Owner, Verde Bistro",
      content: "Customer satisfaction scores went from 3.2 to 4.8 stars.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const features = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Real-time Analytics",
      description: "Track performance metrics that matter"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Optimization",
      description: "AI-powered recommendations for efficiency"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-location Support",
      description: "Scale across all your restaurant locations"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-level security for your data"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "For small restaurants",
      features: [
        "Basic analytics",
        "Up to 10 tables",
        "Email support"
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Advanced analytics",
        "Unlimited tables",
        "Priority support",
        "Staff management",
        "Inventory tracking"
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For restaurant chains",
      features: [
        "Multi-location dashboard",
        "Custom integrations",
        "Dedicated support",
        "Advanced reporting",
        "API access"
      ],
      popular: false,
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">RestaurantOS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Customers</a>
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:bg-muted">
                Sign In
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-muted-foreground hover:text-foreground text-sm font-medium">Features</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground text-sm font-medium">Pricing</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-foreground text-sm font-medium">Customers</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button variant="outline" size="sm" className="border-border text-muted-foreground">
                    Sign In
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
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
            <Badge className="bg-muted text-muted-foreground border-0 text-sm font-medium">
              Trusted by 25,000+ restaurants worldwide
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Restaurant management,
              <span className="text-muted-foreground"> simplified</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              One platform to manage orders, staff, inventory, and analytics.
              Built for modern restaurants that want to focus on what matters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium h-12"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted px-8 py-3 text-base font-medium h-12"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="text-sm text-muted-foreground pt-4">
              Free 14-day trial • No credit card required • Cancel anytime
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="bg-muted rounded-2xl p-8 border border-border">
              <div className="bg-background rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Today's Overview</h3>
                  <Badge className="bg-green-100 text-green-700 text-sm">Live</Badge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">$12,847</div>
                    <div className="text-sm text-muted-foreground mt-1">Revenue</div>
                    <div className="text-xs text-green-600 mt-1">+18.2%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">347</div>
                    <div className="text-sm text-muted-foreground mt-1">Orders</div>
                    <div className="text-xs text-green-600 mt-1">+12.4%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">4.8</div>
                    <div className="text-sm text-muted-foreground mt-1">Avg Rating</div>
                    <div className="text-xs text-green-600 mt-1">+0.3</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">12m</div>
                    <div className="text-sm text-muted-foreground mt-1">Avg Wait</div>
                    <div className="text-xs text-red-600 mt-1">-2.1m</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Built for efficiency
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a modern restaurant, from table management to predictive analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-background rounded-xl p-6 border border-border hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4 group-hover:bg-muted/80 transition-colors">
                    <div className="text-muted-foreground">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Trusted by restaurant owners
            </h2>
            <p className="text-xl text-muted-foreground">
              See how we're helping restaurants grow their business
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-muted rounded-2xl p-8 border border-border">
              <div className="text-center space-y-6">
                <div className="flex justify-center space-x-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl text-foreground font-medium leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {testimonials[activeTestimonial].avatar}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">{testimonials[activeTestimonial].name}</div>
                    <div className="text-muted-foreground text-sm">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${index === activeTestimonial ? 'bg-muted-foreground' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Simple pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-background rounded-2xl p-8 border ${plan.popular
                  ? 'border-border shadow-lg'
                  : 'border-border'
                  } relative`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground border-0">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-background border border-border text-foreground hover:bg-muted'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl font-bold text-primary-foreground">
            Ready to get started?
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Join thousands of restaurants already using RestaurantOS to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-muted px-8 py-3 font-medium h-12"
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary/80 px-8 py-3 font-medium h-12"
            >
              Schedule Demo
            </Button>
          </div>
          <div className="text-primary-foreground/70 text-sm">
            14-day free trial • No credit card required
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">RestaurantOS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Modern restaurant management for the digital age.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2025 RestaurantOS. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;