# ResQr - Restaurant QR Menu SaaS

## Overview

ResQr is a comprehensive SaaS platform that empowers restaurant owners to create beautiful digital menus accessible via QR codes. It provides a seamless contactless dining experience for customers while offering powerful management tools and analytics for restaurant owners.

## ✨ Key Features

- **Digital Menu Management** - Create and update menus in real-time
- **QR Code Generation** - Custom QR codes for tables and locations
- **Real-time Analytics** - Track customer engagement and popular items
- **Mobile Optimized** - Perfect experience across all devices
- **Multi-language Support** - Serve diverse customer bases
- **Custom Branding** - Match your restaurant's visual identity
- **Staff Management** - Control access and permissions
- **Revenue Tracking** - Monitor performance and growth

## 🛠️ Technologies Used

- **Frontend**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui Components
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: BetterAuth
- **File Storage**: ImageKit
- **Email Service**: Resend
- **Payment Processing**: Razorpay
- **Icons**: Lucide React, Tabler Icons
- **State Management**: React Context API
- **Form Handling**: React Hook Form

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_NAME="ResQr"

# Database
DATABASE_URL="postgresql://[user]:[password]@[neon-host]/[db-name]?sslmode=require"

# Authentication (BetterAuth)
BETTER_AUTH_SECRET="your-32-character-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Email Service (Resend)
RESEND_API="re_your_resend_api_key"
MAIL_USER="noreply@yourdomain.com"
MAIL_PASSWORD="your_mail_password"

# Image Storage (ImageKit)
IMAGEKIT_PRIVATE_KEY="private_your_imagekit_private_key"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_your_imagekit_public_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID="rzp_test_your_key_id"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/resqr.git
cd resqr

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

├── app/ # Next.js App Router
│ ├── (auth)/ # Authentication routes
│ │ ├── sign-in/ # Login page
│ │ └── sign-up/ # Registration page
│ ├── actions/ # Server actions
│ │ └── send-email.ts # Email sending functionality
│ ├── api/ # API routes
│ │ ├── auth/ # Authentication endpoints
│ │ ├── billing/ # Payment processing
│ │ ├── dashboard/ # Dashboard data endpoints
│ │ ├── menus/ # Menu management
│ │ ├── public/ # Public menu access
│ │ ├── qr-codes/ # QR code generation
│ │ ├── restaurants/ # Restaurant management
│ │ ├── upload/ # File upload handling
│ │ └── user/ # User management
│ ├── dashboard/ # Protected dashboard routes
│ │ ├── account/ # Account settings
│ │ ├── analytics/ # Analytics dashboard
│ │ ├── billing/ # Subscription management
│ │ ├── menus/ # Menu management interface
│ │ ├── qr-codes/ # QR code management
│ │ ├── security/ # Security settings
│ │ ├── settings/ # Restaurant settings
│ │ └── support/ # Help and support
│ ├── menu/ # Public menu viewing
│ ├── onboarding/ # New user onboarding
│ ├── preview/ # Menu preview functionality
│ ├── sign-in/ # Authentication pages
│ ├── sign-up/
│ ├── verify-payment/ # Payment verification
│ ├── favicon.ico # App favicon
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ ├── opengraph-image.png # Social media preview
│ └── page.tsx # Landing page
├── components/ # Reusable components
│ ├── ui/ # Shadcn UI components
│ ├── image-upload.tsx # Image upload component
│ ├── nav-\*.tsx # Navigation components
│ └── site-header.tsx # Site header
├── db/ # Database configuration
│ ├── migrations/ # Database migrations
│ ├── index.ts # Database connection
│ └── schema.ts # Database schema
├── hooks/ # Custom React hooks
├── lib/ # Utility functions
│ ├── auth-client.ts # Authentication client
│ ├── auth.ts # Auth configuration
│ └── utils.ts # General utilities
├── public/ # Static assets
├── types/ # TypeScript definitions
├── .env.example # Environment variables template
├── .gitignore # Git ignore rules
├── bun.lockb # Bun lock file
├── components.json # Shadcn configuration
├── drizzle.config.ts # Drizzle ORM configuration
├── next.config.js # Next.js configuration
├── package.json # Dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json # TypeScript configuration

## 🔄 User Flows

### Restaurant Owner Journey

Sign Up/Login → Authentication via BetterAuth
Onboarding → Guided restaurant setup process
Restaurant Setup → Configure basic information and branding
Menu Creation → Build digital menus with categories and items
QR Generation → Create custom QR codes for tables/locations
Analytics → Monitor customer engagement and performance
Billing → Manage subscription and payments

### Customer Experience

Scan QR Code → Access menu via mobile device camera
Browse Menu → View organized menu with images and descriptions
View Details → See item descriptions, prices, and allergen info
Provide Feedback → Rate items and leave reviews (optional)

## 🎨 Design System

The application uses a consistent design system built with:

- **Shadcn/ui** components for consistent UI elements
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme variables
- **Responsive Design** with mobile-first approach
- **Dark/Light Mode** support via CSS variables

## 🔐 Authentication & Security

- **BetterAuth** for secure authentication
- **JWT tokens** for session management
- **Email verification** for account security
- **Password hashing** with bcrypt
- **CSRF protection** built-in
- **Rate limiting** on API endpoints

## 💳 Payment Integration

- **Razorpay** for payment processing
- **Subscription management** with automatic billing
- **Webhook handling** for payment events
- **Invoice generation** and email delivery
- **Multiple payment methods** support

## 📊 Analytics & Insights

- **Real-time metrics** for menu performance
- **Customer engagement** tracking
- **Popular items** analysis
- **Peak hours** identification
- **Revenue tracking** and reporting
- **Export capabilities** for data analysis

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel
```

### Deploy

vercel

# Set environment variables in Vercel dashboard

# 📝 API Documentation

## Authentication Endpoints

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

## Restaurant Management

- `GET /api/restaurants` - Get restaurant details
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants` - Update restaurant
- `DELETE /api/restaurants` - Delete restaurant

## Menu Management

- `GET /api/menus` - List all menus
- `POST /api/menus` - Create new menu
- `PUT /api/menus/[id]` - Update menu
- `DELETE /api/menus/[id]` - Delete menu

## QR Code Management

- `GET /api/qr-codes` - List QR codes
- `POST /api/qr-codes` - Generate QR code
- `DELETE /api/qr-codes/[id]` - Delete QR code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.resqr.com](https://docs.resqr.com)
- **Email Support**: support@resqr.com
- **Community**: [Discord](https://discord.gg/resqr)
- **Issues**: [GitHub Issues](https://github.com/yourusername/resqr/issues)

## 🗺️ Roadmap

- [ ] **Multi-language menus** - Support for multiple languages
- [ ] **Order management** - Direct ordering through QR menus
- [ ] **Inventory tracking** - Real-time inventory management
- [ ] **Staff app** - Dedicated mobile app for staff
- [ ] **Advanced analytics** - AI-powered insights and recommendations
- [ ] **Integration marketplace** - Connect with POS systems and delivery platforms
- [ ] **White-label solution** - Custom branding for enterprise clients

---

Built with ❤️ by the Shrivatsav

```

```
