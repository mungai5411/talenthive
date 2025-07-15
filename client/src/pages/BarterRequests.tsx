import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const BarterRequests: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = [
    { id: 'all', label: 'All', count: 24 },
    { id: 'pending', label: 'Pending', count: 8 },
    { id: 'active', label: 'Active', count: 5 },
    { id: 'completed', label: 'Completed', count: 11 }
  ];

  const mockBarters = [
    {
      id: 1,
      title: 'Web Development for Graphic Design',
      description: 'Looking for someone skilled in graphic design to help with my startup logo in exchange for React/Node.js tutoring.',
      skillOffered: 'Web Development',
      skillNeeded: 'Graphic Design',
      user: {
        name: 'Sarah Wanjiku',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wanjiku',
        university: 'University of Nairobi',
        rating: 4.8,
        completedBarters: 15
      },
      status: 'pending',
      createdAt: '2024-01-15',
      location: 'Nairobi, Kenya',
      urgent: true,
      estimatedHours: 20
    },
    {
      id: 2,
      title: 'Data Analysis for Creative Writing',
      description: 'Need help with Python data analysis for my research project. Can offer creative writing and content creation services.',
      skillOffered: 'Creative Writing',
      skillNeeded: 'Data Analysis',
      user: {
        name: 'James Mwangi',
        avatar: 'https://ui-avatars.com/api/?name=James+Mwangi',
        university: 'Kenyatta University',
        rating: 4.6,
        completedBarters: 8
      },
      status: 'active',
      createdAt: '2024-01-12',
      location: 'Nairobi, Kenya',
      urgent: false,
      estimatedHours: 15
    },
    {
      id: 3,
      title: 'Photography for Math Tutoring',
      description: 'Professional photography services for events in exchange for advanced mathematics tutoring.',
      skillOffered: 'Photography',
      skillNeeded: 'Mathematics',
      user: {
        name: 'Grace Akinyi',
        avatar: 'https://ui-avatars.com/api/?name=Grace+Akinyi',
        university: 'Strathmore University',
        rating: 4.9,
        completedBarters: 22
      },
      status: 'completed',
      createdAt: '2024-01-08',
      location: 'Nairobi, Kenya',
      urgent: false,
      estimatedHours: 25
    },
    {
      id: 4,
      title: 'Mobile App Development for Marketing',
      description: 'Looking for digital marketing expertise to promote my app in exchange for mobile development mentoring.',
      skillOffered: 'Mobile Development',
      skillNeeded: 'Digital Marketing',
      user: {
        name: 'David Kipchoge',
        avatar: 'https://ui-avatars.com/api/?name=David+Kipchoge',
        university: 'Technical University of Kenya',
        rating: 4.7,
        completedBarters: 12
      },
      status: 'pending',
      createdAt: '2024-01-10',
      location: 'Nairobi, Kenya',
      urgent: true,
      estimatedHours: 30
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'active':
        return <ArrowsRightLeftIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <XCircleIcon className="h-4 w-4" />;
    }
  };

  const filteredBarters = mockBarters.filter(barter => {
    const matchesFilter = filter === 'all' || barter.status === filter;
    const matchesSearch = barter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barter.skillOffered.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         barter.skillNeeded.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Barter Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Discover and exchange skills with fellow students
          </p>
        </div>
        <Link
          to="/barter/create"
          className="mt-4 lg:mt-0 btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Barter
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filterOption.label}
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search barters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button className="btn btn-outline">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Advanced Filters
        </button>
      </div>

      {/* Barter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBarters.map((barter) => (
          <div key={barter.id} className="card hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={barter.user.avatar}
                  alt={barter.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{barter.user.name}</h3>
                  <p className="text-sm text-gray-600">{barter.user.university}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {barter.urgent && (
                  <span className="badge badge-error">Urgent</span>
                )}
                <span className={`badge ${getStatusColor(barter.status)}`}>
                  {getStatusIcon(barter.status)}
                  <span className="ml-1">{barter.status}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{barter.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {barter.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="badge badge-primary">{barter.skillOffered}</span>
                  <ArrowsRightLeftIcon className="h-4 w-4 text-gray-400" />
                  <span className="badge badge-secondary">{barter.skillNeeded}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span>{barter.user.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{barter.estimatedHours}h</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{barter.location}</span>
                </div>
              </div>
              <Link
                to={`/barter/${barter.id}`}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBarters.length === 0 && (
        <div className="text-center py-12">
          <ArrowsRightLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No barters found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a barter request!'}
          </p>
          <Link
            to="/barter/create"
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Barter
          </Link>
        </div>
      )}

      {/* Load More */}
      {filteredBarters.length > 0 && (
        <div className="text-center mt-8">
          <button className="btn btn-outline">
            Load More Barters
          </button>
        </div>
      )}
    </div>
  );
};

export default BarterRequests;