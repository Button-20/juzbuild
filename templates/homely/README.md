# 🏠 Real Estate Admin Dashboard

A modern, full-featured real estate website with a comprehensive admin dashboard for dynamic property management.

## ✨ Features

- **🏢 Property Management**: Complete CRUD operations for real estate listings
- **👨‍💼 Admin Dashboard**: Secure admin interface with authentication
- **🌓 Dark/Light Mode**: Built-in theme switching
- **📱 Responsive Design**: Mobile-first approach
- **🔒 Role-based Access**: Admin and user roles with protected routes
- **🗄️ MongoDB Integration**: Robust database with Mongoose ODM
- **🔐 Multi-auth Support**: Google, GitHub, and credentials authentication
- **📊 Analytics Dashboard**: Property statistics and insights
- **🖼️ Image Management**: Multiple images per property
- **🎯 Featured Properties**: Highlight special listings

## 🚀 Quick Start

### 1. Setup the Project

```bash
npm run setup
```

### 2. Configure Database

Update `.env.local` with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/real-estate
```

### 3. Test Database Connection

```bash
npm run test-mongodb
```

### 4. Create Admin User

```bash
npm run create-admin
```

### 5. Add Sample Data (Optional)

```bash
npm run seed-properties
```

### 6. Start Development Server

```bash
npm run dev
```

Visit:

- **Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Login**: admin@example.com / admin123

## 📚 Documentation

- **[Admin Setup Guide](README_ADMIN.md)** - Comprehensive admin dashboard documentation
- **[MongoDB Setup](MONGODB_SETUP.md)** - Database installation and configuration

## 🛠️ Available Scripts

| Script                    | Description                  |
| ------------------------- | ---------------------------- |
| `npm run dev`             | Start development server     |
| `npm run build`           | Build for production         |
| `npm run start`           | Start production server      |
| `npm run test-mongodb`    | Test database connection     |
| `npm run create-admin`    | Create admin user            |
| `npm run seed-properties` | Add sample properties        |
| `npm run db:reset`        | Reset database (development) |

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
