import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AcademicCapIcon,
  FireIcon,
  TrendingUpIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserGroupIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CameraIcon,
  MusicalNoteIcon,
  BeakerIcon,
  BookOpenIcon,
  CogIcon,
  GlobeAltIcon,
  HeartIcon,
  BuildingOfficeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Skill {
  _id: string;
  name: string;
  category: string;
  description: string;
  usersOffering: number;
  usersNeeding: number;
  averageRating: number;
  trending: boolean;
  popular: boolean;
  icon?: string;
}

interface SkillCategory {
  _id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  skillCount: number;
  trending: boolean;
}

const Skills: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'skills'>('categories');

  const { data: skills, loading: skillsLoading } = useApi<Skill[]>(`/api/skills?category=${selectedCategory}&search=${searchTerm}`);
  const { data: categories, loading: categoriesLoading } = useApi<SkillCategory[]>('/api/skills/categories');
  const { data: trendingSkills } = useApi<Skill[]>('/api/skills/trending?limit=5');
  const { data: popularSkills } = useApi<Skill[]>('/api/skills/popular?limit=5');

  const skillCategories = [
    {
      id: 'technology',
      name: 'Technology',
      description: 'Programming, web development, software engineering',
      icon: CodeBracketIcon,
      color: 'bg-blue-500',
      skillCount: 45,
      trending: true
    },
    {
      id: 'design',
      name: 'Design',
      description: 'Graphic design, UI/UX, visual arts',
      icon: PaintBrushIcon,
      color: 'bg-purple-500',
      skillCount: 32,
      trending: false
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Marketing, finance, entrepreneurship',
      icon: ChartBarIcon,
      color: 'bg-green-500',
      skillCount: 28,
      trending: true
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Digital marketing, social media, content creation',
      icon: MegaphoneIcon,
      color: 'bg-orange-500',
      skillCount: 24,
      trending: false
    },
    {
      id: 'media',
      name: 'Media & Arts',
      description: 'Photography, videography, music production',
      icon: CameraIcon,
      color: 'bg-pink-500',
      skillCount: 19,
      trending: false
    },
    {
      id: 'music',
      name: 'Music',
      description: 'Instruments, production, composition',
      icon: MusicalNoteIcon,
      color: 'bg-indigo-500',
      skillCount: 15,
      trending: false
    },
    {
      id: 'science',
      name: 'Science',
      description: 'Research, data analysis, laboratory skills',
      icon: BeakerIcon,
      color: 'bg-teal-500',
      skillCount: 22,
      trending: true
    },
    {
      id: 'academic',
      name: 'Academic',
      description: 'Tutoring, writing, research assistance',
      icon: BookOpenIcon,
      color: 'bg-yellow-500',
      skillCount: 38,
      trending: false
    },
    {
      id: 'engineering',
      name: 'Engineering',
      description: 'Mechanical, electrical, civil engineering',
      icon: CogIcon,
      color: 'bg-gray-500',
      skillCount: 26,
      trending: false
    },
    {
      id: 'languages',
      name: 'Languages',
      description: 'Translation, language tutoring, communication',
      icon: GlobeAltIcon,
      color: 'bg-red-500',
      skillCount: 18,
      trending: false
    },
    {
      id: 'health',
      name: 'Health & Wellness',
      description: 'Fitness, nutrition, mental health support',
      icon: HeartIcon,
      color: 'bg-emerald-500',
      skillCount: 14,
      trending: true
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Career development, networking, leadership',
      icon: BuildingOfficeIcon,
      color: 'bg-slate-500',
      skillCount: 21,
      trending: false
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setViewMode('skills');
  };

  const getSkillIcon = (category: string) => {
    const categoryData = skillCategories.find(cat => cat.id === category.toLowerCase());
    return categoryData?.icon || AcademicCapIcon;
  };

  const getSkillColor = (category: string) => {
    const categoryData = skillCategories.find(cat => cat.id === category.toLowerCase());
    return categoryData?.color || 'bg-gray-500';
  };

  if (categoriesLoading && skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Skills Discovery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Explore skills, find learning opportunities, and connect with experts
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('categories')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'categories'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setViewMode('skills')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'skills'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                All Skills
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <AnimatedCard className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">250+</h3>
          <p className="text-gray-600 dark:text-gray-400">Total Skills</p>
        </AnimatedCard>

        <AnimatedCard className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-500 rounded-full">
              <UserGroupIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,200+</h3>
          <p className="text-gray-600 dark:text-gray-400">Active Learners</p>
        </AnimatedCard>

        <AnimatedCard className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-500 rounded-full">
              <StarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4.8</h3>
          <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
        </AnimatedCard>
      </div>

      {viewMode === 'categories' ? (
        <>
          {/* Trending & Popular Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Trending Skills */}
            <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center mb-4">
                <FireIcon className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trending Skills</h2>
              </div>
              <div className="space-y-3">
                {trendingSkills?.slice(0, 5).map((skill, index) => (
                  <AnimatedCard 
                    key={skill._id}
                    className="p-4 hover:shadow-lg cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getSkillColor(skill.category)}`}>
                          {React.createElement(getSkillIcon(skill.category), { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{skill.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {skill.usersOffering} offering
                        </span>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>

            {/* Popular Skills */}
            <div className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Skills</h2>
              </div>
              <div className="space-y-3">
                {popularSkills?.slice(0, 5).map((skill, index) => (
                  <AnimatedCard 
                    key={skill._id}
                    className="p-4 hover:shadow-lg cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getSkillColor(skill.category)}`}>
                          {React.createElement(getSkillIcon(skill.category), { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{skill.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{skill.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {skill.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          </div>

          {/* Skill Categories */}
          <div className="animate-slide-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skill Categories</h2>
              <Link
                to="/skills?view=all"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
              >
                View all skills
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {skillCategories.map((category, index) => (
                <AnimatedCard 
                  key={category.id}
                  className="text-center hover:shadow-xl cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setViewMode('skills');
                  }}
                >
                  <div className="relative">
                    {category.trending && (
                      <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        Trending
                      </div>
                    )}
                    <div className={`inline-flex p-4 rounded-full ${category.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>{category.skillCount} skills</span>
                      <span>•</span>
                      <span>Active</span>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Skills Grid */
        <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'All Skills' : `${selectedCategory} Skills`}
            </h2>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillsLoading ? (
              Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : skills && skills.length > 0 ? (
              skills.map((skill, index) => (
                <AnimatedCard 
                  key={skill._id}
                  className="hover:shadow-xl cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${getSkillColor(skill.category)}`}>
                      {React.createElement(getSkillIcon(skill.category), { className: "h-6 w-6 text-white" })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h3>
                        {skill.trending && (
                          <span className="badge badge-warning animate-pulse">Trending</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{skill.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {skill.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{skill.usersOffering} offering</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AcademicCapIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">{skill.usersNeeding} learning</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {skill.averageRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Link
                        to={`/search?skill=${skill.name}&type=offering`}
                        className="flex-1 btn btn-outline btn-sm"
                      >
                        Find Teachers
                      </Link>
                      <Link
                        to={`/search?skill=${skill.name}&type=learning`}
                        className="flex-1 btn btn-primary btn-sm"
                      >
                        Find Learners
                      </Link>
                    </div>
                  </div>
                </AnimatedCard>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'No skills in this category yet'}
                </p>
                <Link
                  to="/barter/create"
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add a Skill
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;