import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus, FiUser, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { registerAdmin } from '../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
      newErrors.password = 'Password must include at least one uppercase letter and one number';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show first error in toast
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerAdmin(formData);
      toast.success('🎉 Admin registered successfully! Redirecting to login...');
      setFormData({ name: '', username: '', email: '', password: '' });
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      icon: <FiUser className="text-lg" />,
      placeholder: 'Enter your full name'
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      icon: <FiUser className="text-lg" />,
      placeholder: 'Choose a username'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      icon: <FiMail className="text-lg" />,
      placeholder: 'Enter your email'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      icon: <FiLock className="text-lg" />,
      placeholder: 'Create a strong password'
    }
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="main"
      aria-label="Admin registration form"
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20"
    >
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back to Home */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Home
        </motion.button>

        <div className="flex justify-center items-center min-h-[80vh]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiUserPlus className="text-3xl text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  Admin Register
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Create your admin account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {formFields.map((field) => (
                  <motion.div
                    key={field.name}
                    variants={itemVariants}
                    className="space-y-2"
                  >
                    <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.icon}
                      </div>
                      <input
                        type={field.type}
                        name={field.name}
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                          errors[field.name] 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 dark:border-gray-600 focus:ring-green-500 dark:focus:ring-green-400'
                        }`}
                      />
                    </div>
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field.name]}
                      </p>
                    )}
                  </motion.div>
                ))}

                {/* Password Requirements */}
                <motion.div
                  variants={itemVariants}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl"
                >
                  <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    🔒 Password Requirements:
                  </h3>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <li className={formData.password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                      • At least 6 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
                      • One uppercase letter
                    </li>
                    <li className={/\d/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
                      • One number
                    </li>
                  </ul>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-lg ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FiUserPlus className="text-lg" />
                      Create Admin Account
                    </div>
                  )}
                </motion.button>
              </form>

              {/* Login Redirect */}
              <motion.div
                variants={itemVariants}
                className="mt-6 text-center"
              >
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="text-green-600 dark:text-green-400 hover:underline font-semibold transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </motion.div>

              {/* Security Note */}
              <motion.div
                variants={itemVariants}
                className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-center"
              >
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Admin accounts have full access to the system
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}

export default AdminRegister;