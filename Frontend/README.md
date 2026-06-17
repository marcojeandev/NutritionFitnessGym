# IRON | Elite Fitness Management Platform

![IRON Luxury Gym](/src/assets/hero-preview.png)

IRON is a high-end, minimalist gym management PWA (Progressive Web App) designed for elite athletes and luxury fitness spaces. It combines precision tracking with a cinematic digital experience.

## ✨ Key Features

- **QR Attendance Tracking**: Instant, contactless check-ins with dynamic QR generation.
- **Elite Membership Management**: Streamlined digital contracts and luxury tier subscriptions.
- **Workout Planning**: Advanced routine builder with progress tracking metrics.
- **Smart Notifications**: Real-time alerts for classes, status, and personalized goals.
- **PWA Experience**: Full mobile-responsive design, installable on iOS and Android without an app store.
- **Cinematic UI**: Modern dark-mode aesthetic with fluid GSAP animations and glassmorphism.

## 🚀 Tech Stack

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Modern CSS-first approach)
- **Animations**: GSAP (GreenSock Animation Platform) + ScrollTrigger
- **UI Components**: Shadcn UI + Lucide React
- **Icons**: Lucide React
- **Architecture**: Atomic-inspired component structure

## 📂 Project Structure

```text
src/
├── components/
│   ├── layout/       # Navbar, Footer, Wrapper
│   ├── sections/     # Hero, Features, Membership, Experience
│   └── ui/           # Shared Shadcn UI components
├── lib/
│   ├── animations.ts # GSAP global configurations
│   └── utils.ts      # Tailwind merging and helper functions
├── styles/
│   └── index.css     # Global styles and Tailwind v4 utilities
└── App.tsx           # Main application entry
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

## 📱 PWA Support

This application is built as a PWA. To install:
1. Open the site in Safari (iOS) or Chrome (Android).
2. Tap the "Share" or "Menu" button.
3. Select **"Add to Home Screen"**.

## 📄 License

This project is proprietary and built for [Client Name/Gym Name]. All rights reserved.
