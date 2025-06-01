# Build a Restaurant QR Menu SaaS Application

## Project Overview
Create a complete SaaS web application that allows restaurant owners to create digital menus with QR codes. Customers scan QR codes to view menus and rate restaurants on Google.

## Tech Stack Requirements
- **Frontend**: Next.js 14+ with App Router
- **Backend**: Supabase (Database + Auth + Storage)
- **Authentication**: NextAuth.js (Auth.js) with Supabase integration
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **QR Generation**: qrcode.js library
- **Icons**: Lucide React

## Core Features & User Flows

### Restaurant Owner Flow
1. **Registration/Login** → Authentication system
2. **Onboarding Process** → Multi-step restaurant setup
3. **Dashboard** → Menu management interface
4. **Menu Builder** → Create/edit menus with categories and items
5. **QR Generation** → Export printable QR codes for tables

### Customer Flow
1. **Scan QR Code** → Direct access to specific restaurant menu
2. **Browse Menu** → View categorized items with prices and descriptions
3. **Rate Restaurant** → Redirect to restaurant's Google Business page

## Database Schema (Supabase)

Create the following tables with proper relationships and RLS policies:

```sql
-- Enable RLS on all tables
-- Create UUID extension if not exists

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  google_business_url TEXT,
  google_rating DECIMAL(2,1),
  cuisine_type VARCHAR(100),
  description TEXT,
  logo_url TEXT,
  color_theme VARCHAR(7) DEFAULT '#000000',
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'FREE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Main Menu',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  qr_code_id VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  allergens TEXT[], -- Array: ['gluten', 'dairy', 'nuts']
  dietary_tags TEXT[], -- Array: ['vegan', 'keto', 'spicy']
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Analytics
CREATE TABLE qr_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create necessary indexes and RLS policies
-- Add triggers for updated_at timestamps
```

## Application Structure

```
restaurant-qr-menu/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── menu/
│   │   │   │   │   └── [menuId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── menu/
│   │   │   └── [qrCodeId]/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── restaurants/
│   │   │   │   └── route.ts
│   │   │   ├── menus/
│   │   │   │   └── route.ts
│   │   │   └── qr-analytics/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── onboarding/
│   │   │   ├── restaurant-details-form.tsx
│   │   │   ├── google-business-form.tsx
│   │   │   ├── branding-form.tsx
│   │   │   ├── first-menu-form.tsx
│   │   │   └── onboarding-progress.tsx
│   │   ├── dashboard/
│   │   │   ├── dashboard-nav.tsx
│   │   │   ├── restaurant-overview.tsx
│   │   │   ├── menu-list.tsx
│   │   │   └── qr-download.tsx
│   │   ├── menu-builder/
│   │   │   ├── menu-builder.tsx
│   │   │   ├── category-manager.tsx
│   │   │   ├── item-manager.tsx
│   │   │   ├── item-form.tsx
│   │   │   └── menu-preview.tsx
│   │   ├── public-menu/
│   │   │   ├── public-menu.tsx
│   │   │   ├── restaurant-header.tsx
│   │   │   ├── menu-categories.tsx
│   │   │   ├── menu-item-card.tsx
│   │   │   ├── rating-button.tsx
│   │   │   └── menu-search.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   └── loading.tsx
│   │   └── common/
│   │       ├── navbar.tsx
│   │       ├── footer.tsx
│   │       └── qr-generator.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   └── providers.ts
│   │   ├── utils/
│   │   │   ├── qr-generator.ts
│   │   │   ├── image-upload.ts
│   │   │   └── validators.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-restaurant.ts
│   │   ├── use-menu.ts
│   │   └── use-auth.ts
│   └── types/
│       ├── database.ts
│       ├── auth.ts
│       └── menu.ts
├── public/
│   ├── images/
│   └── icons/
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Key Implementation Requirements

### 1. Authentication Setup (NextAuth.js + Supabase)

```typescript
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add email/password provider
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
}
```

### 2. Onboarding Flow Components

Create a multi-step onboarding process with:
- Step 1: Restaurant basic information (name, address, phone, cuisine type)
- Step 2: Google Business profile URL input and validation
- Step 3: Restaurant branding (logo upload, color theme selection)
- Step 4: Create first menu with sample categories

### 3. Menu Builder Interface

Build a comprehensive menu management system with:
- Drag-and-drop category and item reordering
- Real-time preview of customer-facing menu
- Image upload for menu items
- Allergen and dietary tag management
- Bulk import/export capabilities
- Item availability toggles

### 4. QR Code Generation & Management

```typescript
// lib/utils/qr-generator.ts
import QRCode from 'qrcode'

export const generateMenuQR = async (
  qrCodeId: string,
  options?: {
    size?: number
    margin?: number
    color?: { dark: string; light: string }
  }
) => {
  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu/${qrCodeId}`
  
  const qrOptions = {
    width: options?.size || 300,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF'
    }
  }
  
  const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, qrOptions)
  return qrCodeDataUrl
}

export const generatePrintableQR = async (
  qrCodeId: string,
  restaurant: Restaurant
) => {
  // Generate PDF with restaurant branding and QR code
  // Include table tent template
}
```

### 5. Public Menu Display

Create a mobile-optimized public menu with:
- Restaurant header with logo and info
- Categorized menu items with search/filter
- Price display with currency formatting
- Allergen and dietary tag indicators
- "Rate Us" button linking to Google Business page
- Analytics tracking for menu views

### 6. Dashboard Features

Build a comprehensive dashboard with:
- Restaurant overview and statistics
- Menu management (create, edit, delete)
- QR code download options (PNG, PDF, printable templates)
- Basic analytics (scan counts, popular items)
- Settings and subscription management

## Subscription Tiers & Limitations

```typescript
// lib/constants.ts
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      menus: 1,
      items: 25,
      categories: 10,
      imageUploads: 5
    },
    features: [
      'Basic QR codes',
      'Mobile-optimized menus',
      'Google rating integration'
    ]
  },
  BASIC: {
    name: 'Basic',
    price: 15,
    limits: {
      menus: 3,
      items: 100,
      categories: 50,
      imageUploads: 50
    },
    features: [
      'Custom QR branding',
      'Menu analytics',
      'Multiple menus',
      'Priority support'
    ]
  },
  PRO: {
    name: 'Professional',
    price: 35,
    limits: {
      menus: -1, // unlimited
      items: -1,
      categories: -1,
      imageUploads: 200
    },
    features: [
      'Unlimited menus & items',
      'Advanced analytics',
      'Custom domain support',
      'White-label options',
      'API access'
    ]
  }
}
```

## UI/UX Requirements

### Design System
- Use a clean, modern design with Tailwind CSS
- Implement a consistent color scheme and typography
- Create responsive layouts for all screen sizes
- Use proper loading states and error handling
- Implement smooth transitions and micro-animations

### Mobile-First Approach
- All public menus must be touch-friendly
- Fast loading times (< 3 seconds)
- Offline fallback for menu display
- Easy navigation between categories
- Large, readable fonts and buttons

### Accessibility
- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility
- Alt text for all images

## Analytics & Tracking

Implement basic analytics for:
- QR code scan counts by menu
- Popular menu items based on views
- Peak scanning times
- Customer engagement metrics
- Restaurant performance dashboard

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

## Deployment Requirements

- Deploy to Vercel with proper environment variables
- Set up Supabase project with database and storage
- Configure Google OAuth application
- Set up domain and SSL certificates
- Implement proper error monitoring

## Additional Features to Implement

1. **Image optimization** for menu item photos
2. **Multi-language support** for tourist areas
3. **Seasonal menu toggles** for changing offerings
4. **Order integration** (future premium feature)
5. **Staff management** for multi-location restaurants
6. **Customer feedback collection** beyond Google ratings
7. **Menu PDF export** for printing
8. **Social media integration** for sharing menus

## Success Metrics

- User registration and onboarding completion rates
- Menu creation and QR code generation usage
- Customer menu scan engagement
- Subscription conversion rates
- User retention and feature adoption

## Development Timeline

- **Week 1-2**: Authentication, database setup, basic UI components
- **Week 3-4**: Onboarding flow and restaurant management
- **Week 5-6**: Menu builder with full CRUD operations
- **Week 7-8**: QR generation and public menu display
- **Week 9-10**: Dashboard, analytics, and subscription features
- **Week 11-12**: Testing, optimization, and deployment

Build this as a production-ready SaaS application with proper error handling, security measures, and scalable architecture. Focus on user experience and ensure the application works seamlessly on both desktop and mobile devices.