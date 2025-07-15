# TalentHive Client

A React TypeScript application for the TalentHive talent barter platform.

## Features

- **Multi-page Application**: Complete routing with React Router
- **Authentication**: Login and registration with JWT tokens
- **Real-time Features**: Socket.IO integration for live messaging
- **Mobile-first Design**: Responsive design with Tailwind CSS
- **Interactive Dashboard**: User dashboard with stats and quick actions
- **Barter System**: Create and manage skill exchange requests
- **Meetups**: Organize and join local skill-sharing events
- **Profile Management**: Comprehensive user profiles with skills
- **Search & Discovery**: Find users and skills

## Pages

### Public Pages
- **Home** (`/`) - Landing page with features and statistics
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Multi-step user registration
- **About** (`/about`) - Information about TalentHive
- **Help** (`/help`) - Support and documentation

### Protected Pages
- **Dashboard** (`/dashboard`) - Main user dashboard
- **Profile** (`/profile`) - User profile view
- **Edit Profile** (`/profile/edit`) - Profile editing
- **Barter Requests** (`/barter`) - Browse and manage barters
- **Create Barter** (`/barter/create`) - Create new barter request
- **Meetups** (`/meetups`) - Local meetup events
- **Messages** (`/messages`) - Real-time messaging
- **Skills** (`/skills`) - Skill discovery and categories
- **Search** (`/search`) - User and skill search
- **Notifications** (`/notifications`) - Activity notifications
- **Settings** (`/settings`) - Account preferences

## Tech Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **Axios** for API calls
- **Socket.IO** for real-time features
- **Context API** for state management

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API endpoints:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Development

### Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── MobileNav.tsx   # Mobile navigation
│   ├── PrivateRoute.tsx # Protected route wrapper
│   └── LoadingSpinner.tsx # Loading component
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── SocketContext.tsx # Socket.IO connection
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Profile.tsx     # User profile
│   ├── BarterRequests.tsx # Barter listing
│   └── ...            # Other pages
├── App.tsx             # Main app component
└── index.tsx          # Entry point
```

### Key Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication Flow**: JWT-based authentication with protected routes
- **Real-time Communication**: Socket.IO for instant messaging
- **State Management**: React Context for global state
- **TypeScript**: Full type safety throughout the application

### Styling

The app uses Tailwind CSS with custom components:
- `.btn` - Button styles with variants
- `.card` - Card container styles
- `.badge` - Badge/tag styles
- `.form-input` - Form input styles
- `.mobile-nav` - Mobile navigation styles

## API Integration

The client connects to the TalentHive backend API with:
- Authentication endpoints
- User management
- Barter requests
- Meetup management
- Real-time messaging
- File uploads

## Future Enhancements

- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Dark mode support
- [ ] Multi-language support (Swahili)
- [ ] Video calling integration
- [ ] Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
