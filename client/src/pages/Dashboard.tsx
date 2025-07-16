import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import AnimatedCard from '../components/AnimatedCard';
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

interface BarterRequest {
  _id: string;
  title: string;
  description: string;
  skillOffered: string;
  skillNeeded: string;
  status: string;
  createdAt: string;
  requester: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    university: string;
    rating: { average: number };
  };
  estimatedHours: number;
  location: string;
  urgent: boolean;
}

interface Meetup {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  participants: string[];
  maxParticipants: number;
  organizer: {
    firstName: string;
    lastName: string;
  };
}

interface SuggestedUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  university: string;
  course: string;
  skillsOffered: string[];
  rating: { average: number };
  completedBarters: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  
  const { data: recentBarters, loading: bartersLoading } = useApi<BarterRequest[]>('/api/barter?limit=3');
  const { data: upcomingMeetups, loading: meetupsLoading } = useApi<Meetup[]>('/api/meetups?upcoming=true&limit=2');
  const { data: suggestedUsers, loading: usersLoading } = useApi<SuggestedUser[]>('/api/users/suggestions?limit=3');
  const { data: dashboardStats, loading: statsLoading } = useApi<any>('/api/users/stats');

  const stats = [
    {
      name: 'Active Barters',
      value: dashboardStats?.activeBarters || user?.activeBarters || 0,
      icon: ArrowsRightLeftIcon,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Completed Barters',
      value: dashboardStats?.completedBarters || user?.completedBarters || 0,
      icon: TrophyIcon,
      color: 'bg-green-500',
      change: '+5',
      changeType: 'increase'
    },
    {
      name: 'Rating',
      value: dashboardStats?.rating?.average?.toFixed(1) || user?.rating?.average?.toFixed(1) || '0.0',
      icon: StarIcon,
      color: 'bg-yellow-500',
      change: '+0.2',
      changeType: 'increase'
    },
    {
      name: 'Total Meetups',
      value: dashboardStats?.totalMeetups || 12,
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

  // Animate stats counter
  useEffect(() => {
    const targetValues = stats.map(stat => 
      typeof stat.value === 'string' ? parseFloat(stat.value) : stat.value
    );
    
    const duration = 2000;
    const steps = 60;
    const increment = targetValues.map(target => target / steps);
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedStats(prev => 
        prev.map((current, index) => 
          Math.min(current + increment[index], targetValues[index])
        )
      );
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetValues);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [dashboardStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user?.university} • {user?.course}
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 border-2 border-white dark:border-gray-800 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">+12 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <AnimatedCard 
            key={index} 
            className="animate-bounce-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} transform hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.name === 'Rating' 
                    ? animatedStats[index].toFixed(1) 
                    : Math.floor(animatedStats[index])
                  }
                </p>
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <span>{stat.change}</span>
                  <span className="ml-1">this week</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group"
            >
              <AnimatedCard 
                className="text-center hover:shadow-xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-full ${action.color} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </AnimatedCard>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Barters */}
        <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Barters</h2>
            <Link
              to="/barter"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {bartersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : recentBarters && recentBarters.length > 0 ? (
              recentBarters.map((barter, index) => (
                <AnimatedCard 
                  key={barter._id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <img
                        src={barter.requester.avatar || `https://ui-avatars.com/api/?name=${barter.requester.firstName}+${barter.requester.lastName}`}
                        alt={barter.requester.firstName}
                        className="w-10 h-10 rounded-full ring-2 ring-primary-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{barter.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {barter.requester.firstName} {barter.requester.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{barter.requester.university}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {barter.urgent && (
                        <span className="badge badge-error animate-pulse">Urgent</span>
                      )}
                      <span className={`badge ${getStatusColor(barter.status)}`}>
                        {barter.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDate(barter.createdAt)}</span>
                    </div>
                    <Link
                      to={`/barter/${barter._id}`}
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
                    >
                      View details
                    </Link>
                  </div>
                </AnimatedCard>
              ))
            ) : (
              <div className="card text-center py-8">
                <ArrowsRightLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No recent barters</p>
                <Link
                  to="/barter/create"
                  className="btn btn-primary mt-4"
                >
                  Create Your First Barter
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetups */}
        <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Meetups</h2>
            <Link
              to="/meetups"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {meetupsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : upcomingMeetups && upcomingMeetups.length > 0 ? (
              upcomingMeetups.map((meetup, index) => (
                <AnimatedCard 
                  key={meetup._id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{meetup.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {meetup.organizer.firstName} {meetup.organizer.lastName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{formatDate(meetup.date)} at {meetup.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{meetup.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <UserGroupIcon className="h-4 w-4" />
                      <span>{meetup.participants.length}/{meetup.maxParticipants} participants</span>
                    </div>
                    <Link
                      to={`/meetups/${meetup._id}`}
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
                    >
                      Join meetup
                    </Link>
                  </div>
                </AnimatedCard>
              ))
            ) : (
              <div className="card text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No upcoming meetups</p>
                <Link
                  to="/meetups/create"
                  className="btn btn-primary mt-4"
                >
                  Create a Meetup
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Users */}
      <div className="mt-8 animate-slide-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suggested Connections</h2>
          <Link
            to="/search"
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usersLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : suggestedUsers && suggestedUsers.length > 0 ? (
            suggestedUsers.map((suggestedUser, index) => (
              <AnimatedCard 
                key={suggestedUser._id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={suggestedUser.avatar || `https://ui-avatars.com/api/?name=${suggestedUser.firstName}+${suggestedUser.lastName}`}
                    alt={suggestedUser.firstName}
                    className="w-12 h-12 rounded-full ring-2 ring-primary-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {suggestedUser.firstName} {suggestedUser.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{suggestedUser.course}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{suggestedUser.university}</p>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {suggestedUser.rating?.average?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <Link
                      to={`/profile/${suggestedUser._id}`}
                      className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
                    >
                      View profile
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            ))
          ) : (
            <div className="col-span-full card text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No suggested connections</p>
              <Link
                to="/search"
                className="btn btn-primary mt-4"
              >
                Find Students
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;