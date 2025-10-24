import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiMapPin, 
  FiTag, 
  FiAward, 
  FiUser, 
  FiImage,
  FiArrowLeft,
  FiPlus
} from 'react-icons/fi';
import { createEvent } from '../services/eventService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddEvent() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    totalSeats: '',
    leftSeats: '',
    tags: '',
    location: '',
    description: '',
    highlights: '',
    organizer: '',
    bannerPath: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [bannerFile, setBannerFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.time.trim()) newErrors.time = 'Time is required';
    if (!formData.totalSeats || isNaN(formData.totalSeats)) newErrors.totalSeats = 'Total seats must be a number';
    if (!formData.leftSeats || isNaN(formData.leftSeats)) newErrors.leftSeats = 'Left seats must be a number';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!bannerFile) newErrors.banner = 'Banner image is required';

    if (bannerFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(bannerFile.type)) {
        newErrors.banner = 'Only JPG, PNG, or WEBP images are allowed';
      }
      if (bannerFile.size > 2 * 1024 * 1024) {
        newErrors.banner = 'Image must be smaller than 2MB';
      }
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

  const handleBannerUpload = (file) => {
    setBannerFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
      // Clear banner error
      if (errors.banner) {
        setErrors(prev => ({ ...prev, banner: '' }));
      }
    } else {
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach(error => toast.error(error));
      setIsSubmitting(false);
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));
    form.append('banner', bannerFile);

    try {
      await createEvent(form, localStorage.getItem('adminToken'));
      toast.success('🎉 Event created successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      toast.error('❌ Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  const formSections = [
    {
      title: "Event Basics",
      icon: <FiCalendar className="text-xl" />,
      fields: [
        { name: 'title', label: 'Event Title', type: 'text', icon: <FiCalendar />, required: true },
        { name: 'date', label: 'Event Date', type: 'date', icon: <FiCalendar />, required: true },
        { name: 'time', label: 'Event Time', type: 'time', icon: <FiClock />, required: true },
      ]
    },
    {
      title: "Event Details",
      icon: <FiUsers className="text-xl" />,
      fields: [
        { name: 'totalSeats', label: 'Total Seats', type: 'number', icon: <FiUsers />, required: true },
        { name: 'leftSeats', label: 'Available Seats', type: 'number', icon: <FiUsers />, required: true },
        { name: 'location', label: 'Location', type: 'text', icon: <FiMapPin />, required: true },
      ]
    },
    {
      title: "Additional Information",
      icon: <FiTag className="text-xl" />,
      fields: [
        { name: 'tags', label: 'Tags (comma separated)', type: 'text', icon: <FiTag /> },
        { name: 'highlights', label: 'Event Highlights', type: 'text', icon: <FiAward /> },
        { name: 'organizer', label: 'Organizer', type: 'text', icon: <FiUser /> },
      ]
    }
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="main"
      aria-label="Create new event form"
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

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
            >
              <FiArrowLeft className="text-lg" />
              Back to Dashboard
            </motion.button>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiPlus className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Create New Event
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Fill in the details to create an amazing event
            </p>
          </div>
        </motion.header>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
        >
          {formSections.map((section, sectionIndex) => (
            <motion.section
              key={section.title}
              variants={itemVariants}
              className={`${sectionIndex > 0 ? 'mt-8 pt-8 border-t border-gray-200 dark:border-gray-700' : ''}`}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  {section.icon}
                </div>
                {section.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.icon}
                      </div>
                      {field.name === 'description' ? (
                        <textarea
                          name={field.name}
                          id={field.name}
                          rows="4"
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all resize-none"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          id={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
                        />
                      )}
                    </div>
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Description Section */}
          <motion.section variants={itemVariants} className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                <FiAward className="text-xl" />
              </div>
              Event Description
            </h2>
            <div className="space-y-2">
              <textarea
                name="description"
                id="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event in detail..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all resize-none"
              />
            </div>
          </motion.section>

          {/* Banner Upload Section */}
          <motion.section variants={itemVariants} className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                <FiImage className="text-xl" />
              </div>
              Event Banner
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  id="banner"
                  onChange={(e) => handleBannerUpload(e.target.files[0])}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: JPG, PNG, WEBP • Max size: 2MB
                </p>
                {errors.banner && (
                  <p className="text-red-500 text-sm">{errors.banner}</p>
                )}
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4"
                >
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview:</p>
                  <img 
                    src={previewUrl} 
                    alt="Preview of uploaded banner" 
                    className="w-full max-w-md h-48 object-cover rounded-2xl shadow-lg border border-gray-200 dark:border-gray-600"
                  />
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-lg ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Event...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FiPlus className="text-lg" />
                  Create Event
                </div>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.main>
  );
}

export default AddEvent;