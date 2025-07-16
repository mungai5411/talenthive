import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Register: React.FC = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    course: '',
    yearOfStudy: '',
    graduationYear: '',
    county: '',
    town: '',
    phone: '',
    whatsapp: '',
    bio: '',
  });

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri',
    'Meru', 'Embu', 'Machakos', 'Garissa', 'Kitale', 'Malindi', 'Lamu',
    'Wajir', 'Marsabit', 'Isiolo', 'Nanyuki', 'Voi', 'Kilifi', 'Kakamega',
    'Bungoma', 'Kericho', 'Bomet', 'Narok', 'Kajiado', 'Kiambu', 'Murang\'a',
    'Kirinyaga', 'Nyandua', 'Laikipia', 'Samburu', 'Trans Nzoia', 'Uasin Gishu',
    'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Pokot', 'Turkana', 'Mandera',
    'Wajir', 'Garissa', 'Tana River', 'Lamu', 'Taita Taveta', 'Kwale',
    'Kilifi', 'Mombasa'
  ];

  const kenyanUniversities = [
    'University of Nairobi', 'Kenyatta University', 'Moi University',
    'Egerton University', 'Jomo Kenyatta University of Agriculture and Technology',
    'Maseno University', 'Masinde Muliro University of Science and Technology',
    'Dedan Kimathi University of Technology', 'Technical University of Kenya',
    'University of Eldoret', 'Pwani University', 'Laikipia University',
    'Chuka University', 'Kisii University', 'Jaramogi Oginga Odinga University of Science and Technology',
    'Karatina University', 'Kirinyaga University', 'Maasai Mara University',
    'Machakos University', 'Murang\'a University of Technology', 'South Eastern Kenya University',
    'Taita Taveta University', 'Tharaka University', 'University of Embu',
    'Rongo University', 'Garissa University', 'Multimedia University of Kenya',
    'Strathmore University', 'United States International University', 'Daystar University',
    'Catholic University of Eastern Africa', 'Kenya Methodist University', 'Mount Kenya University',
    'Kabarak University', 'Africa Nazarene University', 'Pan Africa Christian University'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
        alert('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      setStep(2);
      return;
    }

    try {
      const userData = {
        ...formData,
        yearOfStudy: parseInt(formData.yearOfStudy),
        graduationYear: parseInt(formData.graduationYear),
      };
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the AuthContext
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="form-label">
            First Name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="form-label">
            Last Name *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your last name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter your email address"
        />
      </div>

      <div>
        <label htmlFor="password" className="form-label">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="form-input pr-10"
            placeholder="Create a password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password *
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-input"
          placeholder="Confirm your password"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="university" className="form-label">
          University *
        </label>
        <select
          id="university"
          name="university"
          required
          value={formData.university}
          onChange={handleChange}
          className="form-input"
        >
          <option value="">Select your university</option>
          {kenyanUniversities.map((university) => (
            <option key={university} value={university}>
              {university}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="course" className="form-label">
            Course/Major *
          </label>
          <input
            id="course"
            name="course"
            type="text"
            required
            value={formData.course}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Computer Science"
          />
        </div>

        <div>
          <label htmlFor="yearOfStudy" className="form-label">
            Year of Study *
          </label>
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            required
            value={formData.yearOfStudy}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year</option>
            <option value="6">6th Year</option>
            <option value="7">7th Year</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="graduationYear" className="form-label">
          Expected Graduation Year *
        </label>
        <select
          id="graduationYear"
          name="graduationYear"
          required
          value={formData.graduationYear}
          onChange={handleChange}
          className="form-input"
        >
          <option value="">Select graduation year</option>
          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="county" className="form-label">
            County *
          </label>
          <select
            id="county"
            name="county"
            required
            value={formData.county}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select your county</option>
            {kenyanCounties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="town" className="form-label">
            Town/City *
          </label>
          <input
            id="town"
            name="town"
            type="text"
            required
            value={formData.town}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your town/city"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            placeholder="+254 7XX XXX XXX"
          />
        </div>

        <div>
          <label htmlFor="whatsapp" className="form-label">
            WhatsApp Number
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            value={formData.whatsapp}
            onChange={handleChange}
            className="form-input"
            placeholder="+254 7XX XXX XXX"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="form-label">
          Bio (Optional)
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          value={formData.bio}
          onChange={handleChange}
          className="form-input"
          placeholder="Tell us a bit about yourself and your interests..."
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-4xl font-bold text-primary-600">🐝</div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Join TalentHive
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <div className="flex-1 h-2 rounded-full bg-gray-200" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Personal Info</span>
              <span>Academic Info</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">
                  {error}
                </div>
              </div>
            )}

            {step === 1 ? renderStep1() : renderStep2()}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-outline"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary ml-auto"
              >
                {loading ? (
                  <LoadingSpinner size="small" className="mr-2" />
                ) : null}
                {step === 1 ? 'Next' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;