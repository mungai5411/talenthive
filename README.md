# TalentHive 🐝

A comprehensive talent barter platform designed for university students in Kenya to exchange skills, organize meetups, and build meaningful connections without monetary transactions.

## 🌟 Features

### Core Platform Features
- **Talent Barter System**: Exchange skills without money - perfect for students
- **Physical Meet-Up Support**: Connect locally for in-person collaborations
- **University Community Focus**: Tailored for Kenyan universities and students
- **Real-time Messaging**: Chat with other students and coordinate exchanges
- **Rating & Review System**: Build trust through peer feedback
- **Mobile-First Design**: Optimized for mobile devices and low-bandwidth usage

### Advanced Features
- **Smart Matching Algorithm**: Find compatible skill exchange partners
- **Meetup Organization**: Create and join local skill-sharing events
- **Multi-language Support**: English and Swahili (planned)
- **Future M-Pesa Integration**: Monetization ready for future phases
- **Admin Dashboard**: Content moderation and platform management
- **Dispute Resolution**: Fair conflict resolution system

## 🏗️ Architecture

### Frontend (React TypeScript)
- **Multi-page Application**: 19+ interactive pages with React Router
- **Authentication System**: JWT-based login/register with protected routes
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Features**: Socket.IO integration for live messaging
- **State Management**: React Context for global state
- **Professional UI/UX**: Modern design with Heroicons

### Backend (Node.js/Express)
- **RESTful API**: Comprehensive endpoints for all features
- **MongoDB Database**: 5 data models for users, barters, messages, meetups, reviews
- **JWT Authentication**: Secure token-based authentication
- **Socket.IO Integration**: Real-time messaging and notifications
- **File Upload Support**: Profile pictures and media handling
- **Admin Analytics**: User metrics and platform insights

## 📱 Application Pages

### Public Pages
- **Home** (`/`) - Landing page with features and statistics
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Multi-step registration with Kenyan universities
- **About** (`/about`) - Platform information
- **Help** (`/help`) - Support and documentation

### Protected Pages
- **Dashboard** (`/dashboard`) - Main user hub with stats and quick actions
- **Profile** (`/profile`) - User profile management
- **Barter Requests** (`/barter`) - Browse and manage skill exchanges
- **Meetups** (`/meetups`) - Local meetup events
- **Messages** (`/messages`) - Real-time messaging system
- **Skills** (`/skills`) - Skill discovery and categories
- **Search** (`/search`) - Find users and opportunities
- **Notifications** (`/notifications`) - Activity updates
- **Settings** (`/settings`) - Account preferences

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Clone and navigate to server directory**:
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/talenthive
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # File Upload
   MAX_FILE_UPLOAD=1000000
   FILE_UPLOAD_PATH=./public/uploads
   
   # M-Pesa Configuration (Future)
   MPESA_CONSUMER_KEY=your-mpesa-consumer-key
   MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
   MPESA_SHORTCODE=your-mpesa-shortcode
   
   # PayPal Configuration (Future)
   PAYPAL_CLIENT_ID=your-paypal-client-id
   PAYPAL_CLIENT_SECRET=your-paypal-client-secret
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Configure your `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Models

### User Model
- Personal information (name, email, avatar)
- University details (institution, course, year)
- Location (county, town)
- Skills offered and needed
- Ratings and verification status

### Barter Request Model
- Skill exchange details
- Status tracking (pending, active, completed)
- Participants and progress
- Future monetization fields

### Message Model
- Real-time messaging system
- Conversation threads
- Read status and timestamps

### Meetup Model
- Event organization
- Location and participant management
- Announcements and updates

### Review Model
- User ratings and feedback
- Moderation and dispute resolution

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/suggestions` - Get user suggestions

### Barters
- `GET /api/barter` - Get all barters
- `POST /api/barter` - Create new barter
- `GET /api/barter/:id` - Get barter by ID
- `PUT /api/barter/:id` - Update barter
- `POST /api/barter/:id/accept` - Accept barter request

### Meetups
- `GET /api/meetups` - Get all meetups
- `POST /api/meetups` - Create new meetup
- `POST /api/meetups/:id/join` - Join meetup
- `POST /api/meetups/:id/announce` - Make announcement

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### Skills
- `GET /api/skills/categories` - Get skill categories
- `GET /api/skills/popular` - Get popular skills
- `GET /api/skills/trending` - Get trending skills

## 🎯 User Journey

1. **Discovery**: Visit landing page and learn about TalentHive
2. **Registration**: Multi-step signup with Kenyan university details
3. **Profile Setup**: Add skills, bio, and preferences
4. **Dashboard**: Access personalized hub with stats and recommendations
5. **Skill Exchange**: Browse barters, create requests, and connect with peers
6. **Meetups**: Join local events and organize skill-sharing sessions
7. **Communication**: Real-time messaging and coordination
8. **Growth**: Build reputation through successful exchanges and reviews

## 🌍 Kenyan Context

### Supported Universities
- University of Nairobi
- Kenyatta University
- Moi University
- Strathmore University
- JKUAT (Jomo Kenyatta University of Agriculture and Technology)
- And 30+ other Kenyan institutions

### Local Features
- All 47 Kenyan counties supported
- Local currency considerations (KES)
- Future M-Pesa integration
- Cultural context and local language support
- Mobile-first design for local connectivity

## 🔮 Future Roadmap

### Phase 1 (Current) - Free Barter System
- ✅ User registration and profiles
- ✅ Skill exchange matching
- ✅ Real-time messaging
- ✅ Meetup organization
- ✅ Rating and review system

### Phase 2 - Enhanced Features
- [ ] Advanced search and filtering
- [ ] Video calling integration
- [ ] Mobile app development
- [ ] Swahili language support
- [ ] Offline functionality

### Phase 3 - Monetization
- [ ] M-Pesa payment integration
- [ ] PayPal support
- [ ] Premium features
- [ ] Transaction fees
- [ ] Advertising platform

### Phase 4 - Expansion
- [ ] Other East African countries
- [ ] Corporate partnerships
- [ ] University integrations
- [ ] Skills certification
- [ ] Job placement assistance

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Maintain responsive design principles
- Consider mobile-first approach
- Include proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kenyan university students for inspiration
- Open source community for tools and libraries
- Contributors and beta testers
- Local tech community support

## 📞 Support

- **Email**: support@talenthive.co.ke
- **Phone**: +254 700 000 000
- **Location**: Nairobi, Kenya
- **Documentation**: [docs.talenthive.co.ke](https://docs.talenthive.co.ke)

---

**Built with ❤️ for Kenyan students by the TalentHive team**