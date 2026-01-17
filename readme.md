# 📁 DocVault

A modern, secure document management application built with React Native and Expo. Organize your documents, manage sections, and keep everything in one place with a beautiful dark-themed interface.

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login
- Password reset via email
- Protected routes with automatic redirection
- Persistent login sessions
- Row Level Security for data protection

### 📱 Core Functionality
- Create custom sections to organize your documents
- Add and manage cards within each section
- Beautiful card-based interface
- Smooth navigation and animations
- Real-time data synchronization

### 👤 User Experience
- Personalized user profile
- Account information display
- Customizable preferences
- Dark mode interface
- Intuitive tab-based navigation

### ⚙️ Settings & Preferences
- View account details
- Toggle notifications
- Manage appearance settings
- Secure sign out with confirmation
- Version information display

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **UI**: Custom dark theme design system
- **Platform**: iOS, Android, Web

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)
- A Supabase account

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd docvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the credentials in `config/supabase.js`

4. **Set up the database**
   - Create the required tables (sections, cards)
   - Enable Row Level Security policies
   - Configure authentication settings

5. **Run the application**
   ```bash
   npx expo start
   ```
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 📁 Project Structure

```
docvault/
├── app/
│   ├── (auth)/           → Authentication screens
│   ├── (tabs)/           → Main application tabs
│   ├── _layout.jsx       → Root layout configuration
│   └── card screens      → Document card management
├── config/
│   └── supabase.js       → Backend configuration
├── services/
│   └── supabaseService.js → API service layer
└── assets/               → Images and resources
```

## 🎨 Design System

### Visual Identity
- **Modern Dark Theme**: Sophisticated slate-based color palette
- **Card-Based UI**: Clean, organized interface with rounded corners
- **Smooth Animations**: Fluid transitions between screens
- **Consistent Typography**: Clear hierarchy and readability
- **Intuitive Icons**: Emoji-based visual indicators

### Color Palette
- Deep slate backgrounds for comfortable viewing
- Blue accent colors for interactive elements
- Red highlights for destructive actions
- Subtle borders and shadows for depth

## 🔒 Security Features

- End-to-end authentication with Supabase
- Row Level Security (RLS) policies
- Secure password reset flow
- Protected API endpoints
- User data isolation
- Session management

## 📱 Platform Support

| Platform | Status |
|----------|--------|
| iOS      | ✅ Supported |
| Android  | ✅ Supported |
| Web      | ✅ Supported |

## 🌟 Key Highlights

- **Zero Configuration**: Works out of the box with minimal setup
- **Type Safety**: Built with best practices and error handling
- **Responsive Design**: Adapts to different screen sizes
- **Performance**: Optimized for smooth user experience
- **Scalable**: Easy to extend with new features

## 📚 Documentation

For detailed documentation on:
- Database schema and tables
- API endpoints and services
- Authentication flow
- Component structure
- Styling guidelines

Please refer to the inline code comments and documentation files.

## 🐛 Known Issues

Currently, there are no known issues. If you encounter any problems, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] File upload functionality
- [ ] Document sharing between users
- [ ] Advanced search and filtering
- [ ] Offline mode support
- [ ] Export functionality
- [ ] Push notifications
- [ ] Multi-language support