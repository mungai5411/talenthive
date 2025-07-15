import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowsRightLeftIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      name: 'Skill Barter System',
      description: 'Exchange your skills with other students without any money involved.',
      icon: ArrowsRightLeftIcon,
    },
    {
      name: 'Physical Meetups',
      description: 'Organize and join in-person meetups for skill exchange and collaboration.',
      icon: CalendarIcon,
    },
    {
      name: 'Real-time Messaging',
      description: 'Chat with other students and coordinate your skill exchanges.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Rating & Reviews',
      description: 'Build your reputation through peer reviews and ratings.',
      icon: StarIcon,
    },
    {
      name: 'University Community',
      description: 'Connect with students from your university and nearby institutions.',
      icon: UserGroupIcon,
    },
    {
      name: 'Local Focus',
      description: 'Tailored for Kenyan universities with local language support.',
      icon: GlobeAltIcon,
    },
  ];

  const stats = [
    { name: 'Active Students', value: '1,200+' },
    { name: 'Skills Exchanged', value: '3,500+' },
    { name: 'Meetups Organized', value: '450+' },
    { name: 'Universities', value: '25+' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary-600">🐝</div>
              <span className="ml-2 text-xl font-semibold">TalentHive</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn btn-primary"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-ghost"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Share Skills, Build Connections
            </h1>
            <p className="text-xl text-white opacity-90 mb-12 max-w-3xl mx-auto">
              Join TalentHive - the platform where Kenyan university students exchange skills, 
              organize meetups, and build lasting connections through talent barter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-secondary btn-lg"
              >
                Start Exchanging Skills
              </Link>
              <Link
                to="/about"
                className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary-600"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TalentHive?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for university students in Kenya to foster skill sharing and collaboration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already sharing skills and building connections.
          </p>
          <Link
            to="/register"
            className="btn btn-primary btn-lg"
          >
            Join TalentHive Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="text-2xl font-bold text-primary-600">🐝</div>
                <span className="ml-2 text-lg font-semibold">TalentHive</span>
              </div>
              <p className="text-gray-600">
                Empowering Kenyan university students to share skills and build connections.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link to="/about" className="hover:text-primary-600">About</Link></li>
                <li><Link to="/help" className="hover:text-primary-600">Help</Link></li>
                <li><a href="#" className="hover:text-primary-600">Privacy</a></li>
                <li><a href="#" className="hover:text-primary-600">Terms</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Community</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary-600">Discord</a></li>
                <li><a href="#" className="hover:text-primary-600">Twitter</a></li>
                <li><a href="#" className="hover:text-primary-600">Facebook</a></li>
                <li><a href="#" className="hover:text-primary-600">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="mailto:support@talenthive.co.ke" className="hover:text-primary-600">Contact</a></li>
                <li><a href="tel:+254700000000" className="hover:text-primary-600">+254 700 000 000</a></li>
                <li><span className="text-gray-500">Nairobi, Kenya</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 TalentHive. Built with ❤️ for Kenyan students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;