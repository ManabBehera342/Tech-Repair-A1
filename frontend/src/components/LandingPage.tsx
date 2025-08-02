import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Wrench, 
  Users, 
  Building, 
  Shield, 
  UserCheck, 
  Moon, 
  Sun, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Zap,
  Settings,
  Power
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { addNotification } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'customer', label: 'Customer', icon: User, description: 'Get your electronics repaired' },
    { value: 'channel_partner', label: 'Channel Partner', icon: Users, description: 'Manage partner services' },
    { value: 'system_integrator', label: 'System Integrator', icon: Building, description: 'Integration services' },
    { value: 'service_team', label: 'Service Team', icon: Wrench, description: 'Handle service requests' },
    { value: 'epr_team', label: 'EPR Team', icon: Shield, description: 'Extended Producer Responsibility' }
  ];

  const serviceCategories = [
    { name: 'Energizer', icon: Zap, color: 'text-yellow-500' },
    { name: 'Gate Motor Controller', icon: Settings, color: 'text-blue-500' },
    { name: 'Power Adapter', icon: Power, color: 'text-emerald-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password, formData.role);
        addNotification({
          type: 'success',
          title: 'Welcome back!',
          message: 'You have successfully logged in.'
        });
      } else {
        await signup(formData.name, formData.email, formData.password, formData.role);
        addNotification({
          type: 'success',
          title: 'Account created!',
          message: 'Your account has been created successfully.'
        });
      }
      
      if (formData.role === 'service_team' || formData.role === 'epr_team') {
        navigate('/dashboard');
      } else {
        navigate('/service-request');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Authentication failed',
        message: 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getCurrentGreeting()}, {user.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You're logged in as {roleOptions.find(r => r.value === user.role)?.label}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(user.role === 'service_team' || user.role === 'epr_team' ? '/dashboard' : '/service-request')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Continue to {user.role === 'service_team' || user.role === 'epr_team' ? 'Dashboard' : 'Service Request'}
            </button>
            <button
              onClick={() => navigate('/faq')}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse FAQ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="relative p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TechRepair Pro</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
          >
            {isDark ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Get Your Electronics 
                <span className="text-blue-600 dark:text-blue-400"> Fixed, Fast!</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Professional repair services for all your electronic devices. Quick turnaround, expert technicians, and transparent pricing.
              </p>
            </div>

            {/* Service Categories */}
            <div className="grid grid-cols-3 gap-4">
              {serviceCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 text-center hover:scale-105 transition-transform duration-200"
                >
                  <category.icon className={`w-8 h-8 ${category.color} mx-auto mb-2`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Expert Technicians</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Quality Guarantee</span>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin ? 'Sign in to your account' : 'Join our repair service network'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.role === role.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <role.icon className={`w-5 h-5 mb-1 ${
                        formData.role === role.value ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className={`text-xs font-medium text-center ${
                        formData.role === role.value ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;