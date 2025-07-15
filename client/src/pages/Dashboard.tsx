import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowsRightLeftIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentBarters, setRecentBarters] = useState([]);
  const [upcomingMeetups, setUpcomingMeetups] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    {
      name: 'Active Barters',
      value: user?.activeBarters || 0,
      icon: ArrowsRightLeftIcon,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Completed Barters',
      value: user?.completedBarters || 0,
      icon: TrophyIcon,
      color: 'bg-green-500',
      change: '+5',
      changeType: 'increase'
    },
    {
      name: 'Rating',
      value: user?.rating?.average?.toFixed(1) || '0.0',
      icon: StarIcon,
      color: 'bg-yellow-500',
      change: '+0.2',
      changeType: 'increase'
    },
    {
      name: 'Total Meetups',
      value: '12',
      icon: CalendarIcon,
      color: 'bg-purple-500',
      change: '+3',
      changeType: 'increase'
    }
  ];

  const quickActions = [
    {
      name: 'Create Barter',
      description: 'Post a new skill exchange request',
      href: '/barter/create',
      icon: ArrowsRightLeftIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Join Meetup',
      description: 'Find and join local meetups',
      href: '/meetups',
      icon: CalendarIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Browse Skills',
      description: 'Discover new skills to learn',
      href: '/skills',
      icon: AcademicCapIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Find Students',
      description: 'Connect with other students',
      href: '/search',
      icon: UserGroupIcon,
      color: 'bg-yellow-500'
    }
  ];

  const mockRecentBarters = [
    {
      id: 1,
      title: 'Web Development for Graphic Design',
      status: 'pending',
      otherUser: 'Sarah Wanjiku',
      university: 'University of Nairobi',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wanjiku',
      createdAt: '2024-01-15',
      skillOffered: 'Web Development',
      skillNeeded: 'Graphic Design'
    },
    {
      id: 2,
      title: 'Data Analysis for Writing',
      status: 'active',
      otherUser: 'James Mwangi',
      university: 'Kenyatta University',
      avatar: 'https://ui-avatars.com/api/?name=James+Mwangi',
      createdAt: '2024-01-12',
      skillOffered: 'Data Analysis',
      skillNeeded: 'Creative Writing'
    },
    {
      id: 3,
      title: 'Photography for Math Tutoring',
      status: 'completed',
      otherUser: 'Grace Akinyi',
      university: 'Strathmore University',
      avatar: 'https://ui-avatars.com/api/?name=Grace+Akinyi',
      createdAt: '2024-01-08',
      skillOffered: 'Photography',
      skillNeeded: 'Mathematics'
    }
  ];

  const mockUpcomingMeetups = [
    {
      id: 1,
      title: 'Tech Skills Exchange',
      date: '2024-01-20',
      time: '2:00 PM',
      location: 'University of Nairobi',
      participants: 8,
      maxParticipants: 12,
      organizer: 'Tech Club UoN'
    },
    {
      id: 2,
      title: 'Creative Arts Meetup',
      date: '2024-01-22',
      time: '10:00 AM',
      location: 'Kenyatta University',
      participants: 15,
      maxParticipants: 20,
      organizer: 'Art Society KU'
    }
  ];

  const mockSuggestedUsers = [
    {
      id: 1,
      name: 'Mary Njeri',
      university: 'University of Nairobi',
      course: 'Computer Science',
      skillsOffered: ['Python', 'Machine Learning'],
      avatar: 'https://ui-avatars.com/api/?name=Mary+Njeri',
      rating: 4.8,
      completedBarters: 15
    },
    {
      id: 2,
      name: 'David Kipchoge',
      university: 'Strathmore University',
      course: 'Business Administration',
      skillsOffered: ['Marketing', 'Finance'],
      avatar: 'https://ui-avatars.com/api/?name=David+Kipchoge',
      rating: 4.6,
      completedBarters: 8
    },
    {
      id: 3,
      name: 'Linda Wambui',
      university: 'Kenyatta University',
      course: 'Journalism',
      skillsOffered: ['Writing', 'Research'],
      avatar: 'https://ui-avatars.com/api/?name=Linda+Wambui',
      rating: 4.9,
      completedBarters: 22
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.university} • {user?.course}
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">+12 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className={`inline-flex p-3 rounded-full ${action.color} mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Barters */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Barters</h2>
            <Link
              to="/barter"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {mockRecentBarters.map((barter) => (
              <div key={barter.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img
                      src={barter.avatar}
                      alt={barter.otherUser}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{barter.title}</h3>
                      <p className="text-sm text-gray-600">{barter.otherUser}</p>
                      <p className="text-xs text-gray-500">{barter.university}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(barter.status)}`}>
                    {barter.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(barter.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    to={`/barter/${barter.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetups */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Meetups</h2>
            <Link
              to="/meetups"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {mockUpcomingMeetups.map((meetup) => (
              <div key={meetup.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{meetup.title}</h3>
                    <p className="text-sm text-gray-600">{meetup.organizer}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{meetup.date} at {meetup.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{meetup.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{meetup.participants}/{meetup.maxParticipants} participants</span>
                  </div>
                  <Link
                    to={`/meetups/${meetup.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Join meetup
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Users */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Suggested Connections</h2>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockSuggestedUsers.map((suggestedUser) => (
            <div key={suggestedUser.id} className="card">
              <div className="flex items-center space-x-3">
                <img
                  src={suggestedUser.avatar}
                  alt={suggestedUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{suggestedUser.name}</h3>
                  <p className="text-sm text-gray-600">{suggestedUser.course}</p>
                  <p className="text-xs text-gray-500">{suggestedUser.university}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {suggestedUser.skillsOffered.slice(0, 2).map((skill, index) => (
                    <span key={index} className="badge badge-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{suggestedUser.rating}</span>
                  </div>
                  <Link
                    to={`/profile/${suggestedUser.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;