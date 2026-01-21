![Portfolio](https://img.shields.io/badge/Portfolio-black)

# DocVault 📂
Secure document and card storage application with family sharing capabilities.

#Download 📥[Link](https://github.com/Arshad-ashuu/docvault/releases/download/v1.0.0/docvault.apk)

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Build](#build)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## About

DocVault is a React Native mobile application designed for secure storage and management of important documents and cards. The app enables family members to share and control access to sensitive information through a clean, intuitive interface.

## Features

- 🔐 Secure document and card storage
- 👨‍👩‍👧‍👦 Family member management and invitations
- 🔄 Document sharing with granular access control
- 📱 Clean and responsive UI
- 🖼️ Image capture and upload functionality
- 💾 Persistent local and cloud storage
- 🔑 Authentication system with password recovery

## Tech Stack

### Frontend
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **TypeScript/JavaScript** - Programming languages

### Backend & Services
- **Supabase** - Backend as a Service
  - Authentication
  - Database (PostgreSQL)
  - Storage
  - Real-time subscriptions

### Build & Deployment
- **EAS (Expo Application Services)** - Build and deployment
- **Expo Go** - Development testing

## Project Structure

```
DOCVAULT/
├── app/
│   ├── (auth)/                 # Authentication screens
│   │   ├── _layout.jsx
│   │   ├── forgot-password.jsx
│   │   ├── signin.jsx
│   │   └── signup.jsx
│   └── (tabs)/                 # Main app tabs
│       ├── _layout.jsx
│       ├── family.jsx
│       ├── index.jsx
│       └── settings.jsx
├── assets/                     # Static assets
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── config/                     # Configuration files
│   └── supabase.js
├── hooks/                      # Custom React hooks
│   └── useAuth.js
├── services/                   # API and service layers
│   ├── storageService.js
│   └── supabaseService.js
├── utils/                      # Utility functions
│   └── downloadImage.js
├── card.jsx                    # Card components
├── cardDetail.jsx
├── familyCards.jsx
├── index.jsx
├── .gitignore
├── app.json                    # Expo configuration
├── package.json
└── README.md
```

## Installation

### Prerequisites

- Node.js >= 16.x
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/docvault.git
cd docvault
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server
```bash
npx expo start
```

## Configuration

### Supabase Setup

1. Create a project on [Supabase](https://supabase.com)
2. Set up authentication providers
3. Create necessary tables and storage buckets
4. Update `config/supabase.js` with your credentials

## Build

### Development Build

```bash
npx expo start
```

### Production Build (EAS)

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

### Generate APK

```bash
eas build -p android --profile preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Version:** 1.0.0  
**Status:** Production Ready
