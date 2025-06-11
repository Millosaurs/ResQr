# Restaurant QR Menu SaaS

## Overview

This SaaS application empowers restaurant owners to create digital menus accessible via QR codes. It offers a seamless experience for customers to view menus and provide feedback, while enabling restaurant owners to manage their offerings efficiently.

## 🛠️ Technologies Used

- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle
- **Authentication**: BetterAuth
- **Icons**: Lucide React
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Image Processing**: ImageKit
- **Email Service**: Resend

## 🔧 Project Setup

```bash
# Clone repository
git clone https://github.com/yourusername/resqr.git
cd resqr
```

# Install dependencies

```
bun install
```

# Setup environment variables

```
cp .env.example .env
```

# Update .env with these values:

```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://[user]:[password]@[neon-host]/[db-name]?sslmode=require"
RESEND_API="your_resend_api_key"
IMAGEKIT_PRIVATE_KEY="your_imagekit_private_key"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_imagekit_public_key"
BETTER_AUTH_SECRET="your_betterauth_secret"
```

# Run database migrations

```
bun run migrate
```

# Start development server

```
bun run dev
```

## 🏗️ Project Structure

```
├── app/              # Next.js 
application routes
│   ├── actions/      # Server actions 
(email sending)
│   ├── api/          # API endpoints
│   ├── dashboard/    # Restaurant owner 
dashboard
│   │   ├── account/    # Account 
management
│   │   ├── analytics/  # Usage analytics
│   │   ├── menus/      # Menu management
│   │   ├── qr-codes/   # QR code 
management
│   │   └── settings/   # Restaurant 
settings
│   ├── menu/         # Customer-facing 
menu
│   ├── onboarding/   # Restaurant 
onboarding
│   ├── preview/      # Menu preview
│   ├── sign-in/      # Authentication
│   └── sign-up/      # User registration
├── components/       # Reusable UI 
components
│   └── ui/           # Shadcn UI 
components
├── db/               # Database schema & 
migrations
├── hooks/            # Custom React hooks
├── lib/              # Auth and utility 
functions
├── public/           # Static assets
└── types/            # TypeScript type 
definitions
```

## 🔄 User Flow

```
flowchart TD
A[User Registration] --> B[Onboarding Process]
B --> C[Restaurant Dashboard]
C --> D[Create Menu]
D --> E[Generate QR Code]
C --> F[Analytics Dashboard]
F --> G[Track Scans & Feedback]
```

### Restaurant Owner Journey

```
1. Sign Up/Login - Authentication via BetterAuth
2. Onboarding - Guided setup for restaurant details
3. Menu Creation - Build digital menus with categories and items
4. QR Generation - Create scannable QR codes for tables
5. Analytics - Monitor customer engagement metrics
```

### Customer Experience

```
1. Scan QR Code - Access menu via mobile device
2. Browse Menu - View menu items organized by categories
3. Provide Feedback - Rate restaurant and menu items
```
