# 🚀 A Multi-Vendor E-Commerce Marketplace — Built with Next.js 15, React 19, Stripe Connect, MongoDB

A real multi-tenant e-commerce app where creators have their own storefronts, sell digital products, and get paid through Stripe Connect.

## 🚀 Live Demo

[View Live Website](https://advanced-ecommerce-amber.vercel.app)

## ✨ Features

- 🏬 Multi-tenant architecture
- 🌐 Vendor subdomains
- 🎨 Custom merchant storefronts
- 💳 Stripe Connect integration
- 💰 Automatic platform fees
- ⭐ Product ratings & reviews
- 📚 User purchase library
- 🧑‍💼 Role-based access control
- 🛠️ Admin dashboard
- 🧾 Merchant dashboard
- 🧱 Payload CMS backend
- 🗂️ Category & product filtering
- 🔍 Search functionality
- 🖼️ Image upload support
- ⚙️ Built with Next.js 15
- 🎨 TailwindCSS V4 styling
- 💅 ShadcnUI components

## 🛠️ Tech Stack

### Frontend

- Next.js, React, Typescript, Tanstack Query, Nuqs, Zustand, TailwindCSS, ShadcnUI

### Backend

- Next.js, Typescript, tRPC, PayloadCMS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 20.0 or higher)
- **bun** / **npm** / **yarn** / **pnpm**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sonwjnn/advanced-ecommerce.git
cd advanced-ecommerce
```

### 2. Install Dependencies

```bash
# Using bun
bun install

# Using yarn
yarn install

```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PAYLOAD_SECRET=
DATABASE_URI=

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ROOT_DOMAIN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 4. Run Development Server

```bash
# Using bun
bun dev

# Using yarn
yarn dev

```

Open [http://localhost:3000](http://localhost:3000) to view the website in your browser.

## 📁 Project Structure

```
advanced-ecommerce/
├── media/                # Static assets storage
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # Reusable components
│   ├── collections/      # Define models Payload CMS
│   │   ├── Users.ts
│   │   └── Reviews.ts
│   ├── hooks/            # Custom global hooks
│   ├── lib/              # Utilities
│   ├── trpc/             # tRPC routers for API endpoint definitions
│   ├── modules/          # Modularized feature directories
│   │   ├── auth/
│   │   │   ├── server/   # Server-side logic
│   │   │   ├── ui/
│   │   │   │   ├── components/
│   │   │   │   └── views/
│   │   │   ├── hooks/
│   │   │   ├── utils.ts  
│   │   │   └── schema.ts
│   │   ├── home/
│   │   ├── products/
│   │   └── checkout/
│   ├── payload-types.ts   # Automatic generate TypeScript types for Payload CMS
│   └── payload.config.ts  # Payload CMS config
├── .env                   
├── next.config.ts         
└── package.json           
```
