import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
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

const BarterRequests: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: barters, loading, error, refetch } = useApi<BarterRequest[]>(`/api/barter?status=${filter}&search=${searchTerm}`);
  const { data: barterStats } = useApi<any>('/api/barter/stats');

  const filters = [
    { id: 'all', label: 'All', count: barterStats?.total || 0 },
    { id: 'pending', label: 'Pending', count: barterStats?.pending || 0 },
    { id: 'active', label: 'Active', count: barterStats?.active || 0 },
    { id: 'completed', label: 'Completed', count: barterStats?.completed || 0 }
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  if (loading && !barters) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 animate-slide-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Barter Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and exchange skills with fellow students
          </p>
        </div>
        <Link
          to="/barter/create"
          className="mt-4 lg:mt-0 btn btn-primary hover:scale-105 transition-transform duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Barter
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => handleFilterChange(filterOption.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === filterOption.id
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {filterOption.label}
              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search barters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-200"
          />
        </form>

        <button className="btn btn-outline hover:scale-105 transition-transform duration-200">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Advanced Filters
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 btn btn-sm btn-outline text-red-600 dark:text-red-400"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Barter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : barters && barters.length > 0 ? (
          barters.map((barter, index) => (
            <AnimatedCard 
              key={barter._id}
              className="hover:shadow-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={barter.requester.avatar || `https://ui-avatars.com/api/?name=${barter.requester.firstName}+${barter.requester.lastName}`}
                    alt={barter.requester.firstName}
                    className="w-10 h-10 rounded-full ring-2 ring-primary-500"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {barter.requester.firstName} {barter.requester.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{barter.requester.university}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {barter.urgent && (
                    <span className="badge badge-error animate-pulse">Urgent</span>
                  )}
                  <span className={`badge ${getStatusColor(barter.status)}`}>
                    {getStatusIcon(barter.status)}
                    <span className="ml-1">{barter.status}</span>
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{barter.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
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
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span>{barter.requester.rating?.average?.toFixed(1) || '0.0'}</span>
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
                  to={`/barter/${barter._id}`}
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
                >
                  View Details
                </Link>
              </div>
            </AnimatedCard>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <ArrowsRightLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No barters found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
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
          </div>
        )}
      </div>

      {/* Load More */}
      {barters && barters.length > 0 && (
        <div className="text-center mt-8 animate-fade-in">
          <button 
            className="btn btn-outline hover:scale-105 transition-transform duration-200"
            onClick={refetch}
          >
            Load More Barters
          </button>
        </div>
      )}
    </div>
  );
};

export default BarterRequests;