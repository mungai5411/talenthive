import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import BarterRequests from './pages/BarterRequests';
import CreateBarter from './pages/CreateBarter';
import BarterDetail from './pages/BarterDetail';
import Meetups from './pages/Meetups';
import CreateMeetup from './pages/CreateMeetup';
import MeetupDetail from './pages/MeetupDetail';
import Messages from './pages/Messages';
import Conversation from './pages/Conversation';
import Skills from './pages/Skills';
import UserProfile from './pages/UserProfile';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Help from './pages/Help';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                
                {/* Private routes with layout */}
                <Route element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/edit" element={<EditProfile />} />
                    <Route path="/profile/:userId" element={<UserProfile />} />
                    
                    {/* Barter routes */}
                    <Route path="/barter" element={<BarterRequests />} />
                    <Route path="/barter/create" element={<CreateBarter />} />
                    <Route path="/barter/:id" element={<BarterDetail />} />
                    
                    {/* Meetup routes */}
                    <Route path="/meetups" element={<Meetups />} />
                    <Route path="/meetups/create" element={<CreateMeetup />} />
                    <Route path="/meetups/:id" element={<MeetupDetail />} />
                    
                    {/* Communication routes */}
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/messages/:userId" element={<Conversation />} />
                    
                    {/* Discovery routes */}
                    <Route path="/skills" element={<Skills />} />
                    <Route path="/search" element={<Search />} />
                    
                    {/* Settings and utilities */}
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>
                
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
