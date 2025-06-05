# 📊 Project Showcase: Restaurant QR Menu SaaS

## Overview

This SaaS application empowers restaurant owners to create digital menus accessible via QR codes. It offers a seamless experience for customers to view menus and provide feedback, while enabling restaurant owners to manage their offerings efficiently.

## Data-Driven Features

### 1. **QR Code Analytics**

- **Scan Tracking**: Each QR code scan is logged with timestamp, IP address, and user agent.
- **Insights**: Analyze peak dining times, customer device preferences, and geographic distribution.

### 2. **Menu Interaction Metrics**

- **Item Popularity**: Monitor which menu items are viewed most frequently.
- **Category Engagement**: Assess which categories attract the most attention.

### 3. **Customer Feedback Integration**

- **Google Ratings**: Redirect customers to the restaurant's Google Business page for reviews.
- **Feedback Analysis**: Aggregate and analyze customer ratings over time.

## Data Architecture

### **Database Schema Highlights**

- **Restaurants**: Stores restaurant details, including contact information and branding.
- **Menus**: Contains menu metadata and links to QR codes.
- **Menu Categories & Items**: Organizes menu items into categories with detailed descriptions and pricing.
- **QR Scans**: Logs each QR code scan event for analytics.([getsuper.ai][1])

### **Data Relationships**

- **One-to-Many**: A restaurant can have multiple menus; each menu can have multiple categories; each category can have multiple items.
- **Foreign Keys**: Ensure data integrity across related tables.

## Technologies Used

- **Database**: Neon (PostgreSQL) for scalable and reliable data storage.
- **ORM**: Drizzle for type-safe and efficient database interactions.
- **Authentication**: BetterAuth for secure user authentication and authorization.
- **Frontend**: Next.js 14+ with App Router for dynamic and responsive UI.
- **Styling**: Tailwind CSS for utility-first and customizable design.
- **QR Code Generation**: qrcode.js library for creating scannable codes.
- **Icons**: Lucide React for consistent and scalable iconography.([careerfoundry.com][2], [datascienceweekly.org][3])

## Visualizations & Dashboards

- **Admin Dashboard**: Provides restaurant owners with insights into menu performance and customer engagement.
- **Analytics Charts**: Visual representations of scan frequency, item popularity, and customer feedback trends.

## Conclusion

This project exemplifies the integration of data analytics into a SaaS platform, offering valuable insights to restaurant owners and enhancing the dining experience for customers.
