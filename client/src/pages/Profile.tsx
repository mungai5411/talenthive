import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PencilIcon,
  MapPinIcon,
  AcademicCapIcon,
  StarIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const skillsOffered = [
    'JavaScript', 'React', 'Node.js', 'MongoDB', 'UI/UX Design'
  ];

  const skillsNeeded = [
    'Machine Learning', 'Data Science', 'Mobile Development', 'DevOps'
  ];

  const recentBarters = [
    {
      id: 1,
      title: 'Web Development for Graphic Design',
      partner: 'Sarah Wanjiku',
      status: 'completed',
      rating: 5,
      review: 'Great collaboration! Very skilled and professional.',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'React Tutorial for Photography',
      partner: 'James Mwangi',
      status: 'active',
      date: '2024-01-12'
    }
  ];

  const achievements = [
    {
      title: 'Top Barterer',
      description: 'Completed 25+ successful barters',
      icon: TrophyIcon,
      color: 'text-yellow-500'
    },
    {
      title: 'Quick Responder',
      description: 'Average response time under 2 hours',
      icon: CalendarIcon,
      color: 'text-green-500'
    },
    {
      title: 'Community Helper',
      description: 'Helped 50+ students learn new skills',
      icon: ArrowsRightLeftIcon,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="p-4 lg:p-8">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
              alt={user.firstName}
              className="w-24 h-24 rounded-full"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              {user.isVerified && (
                <span className="badge badge-success">Verified</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-gray-600 mt-2">
              <div className="flex items-center space-x-1">
                <AcademicCapIcon className="h-4 w-4" />
                <span>{user.course}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{user.university}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-500">({user.rating?.count || 0} reviews)</span>
              </div>
              <div className="text-sm text-gray-600">
                {user.completedBarters || 0} barters completed
              </div>
            </div>
          </div>
          
          <Link
            to="/profile/edit"
            className="btn btn-outline"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600">
              {user.bio || 'No bio available. Add a bio to help others learn more about you!'}
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Academic Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Course: {user.course}</div>
                  <div>Year: {user.yearOfStudy}</div>
                  <div>University: {user.university}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>County: {user.county}</div>
                  <div>Town: {user.town}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Skills I Offer</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsOffered.map((skill, index) => (
                    <span key={index} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Skills I Need</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsNeeded.map((skill, index) => (
                    <span key={index} className="badge badge-secondary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Barters</h2>
            <div className="space-y-4">
              {recentBarters.map((barter) => (
                <div key={barter.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{barter.title}</h3>
                    <p className="text-sm text-gray-600">with {barter.partner}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`badge ${barter.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {barter.status}
                      </span>
                      <span className="text-sm text-gray-500">{barter.date}</span>
                    </div>
                    {barter.review && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < (barter.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{barter.review}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Barters Completed</span>
                <span className="font-medium">{user.completedBarters || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Barters</span>
                <span className="font-medium">{user.activeBarters || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{user.rating?.average?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">Jan 2024</span>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/barter/create"
                className="w-full btn btn-primary"
              >
                Create New Barter
              </Link>
              <Link
                to="/meetups/create"
                className="w-full btn btn-outline"
              >
                Organize Meetup
              </Link>
              <Link
                to="/messages"
                className="w-full btn btn-outline"
              >
                View Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;