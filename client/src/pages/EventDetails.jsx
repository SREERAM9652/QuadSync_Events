import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUsers, 
  FiAward, 
  FiUser,
  FiArrowLeft,
  FiShare2
} from 'react-icons/fi';
import { getEventById } from '../services/eventService';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEventById(id)
      .then((res) => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load event details.');
        setLoading(false);
      });
  }, [id]);

  const getBannerUrl = (path) => {
    if (!path) return '/default-banner.png';
    return path.startsWith('http')
      ? path
      : `https://res.cloudinary.com/dxvwbztti/image/upload/${path}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {error}
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="text-indigo-600 dark:text-yellow-400 hover:underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Event not found
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="text-indigo-600 dark:text-yellow-400 hover:underline"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const seatPercentage = ((event.leftSeats || event.totalSeats) / event.totalSeats) * 100;
  const isAlmostFull = seatPercentage < 30;
  const isHalfFull = seatPercentage < 60;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="main"
      aria-label="Event details page"
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20"
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 mb-8 transition-colors"
        >
          <FiArrowLeft className="text-lg" />
          Back to Events
        </motion.button>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Left Column - Banner & Details */}
          <motion.article variants={itemVariants} className="space-y-8">
            {/* Banner */}
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={getBannerUrl(event.bannerPath)}
                alt={`${event.title} banner`}
                className="w-full h-64 lg:h-80 object-cover"
              />
            </div>

            {/* Event Details */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <FiAward className="text-xl" />
                </div>
                Event Details
              </h2>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiCalendar className="text-lg text-indigo-600 dark:text-yellow-400" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiClock className="text-lg text-indigo-600 dark:text-yellow-400" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiMapPin className="text-lg text-indigo-600 dark:text-yellow-400" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <FiUser className="text-lg text-indigo-600 dark:text-yellow-400" />
                    <span className="font-medium">{event.organizer || 'QuadSync'}</span>
                  </div>
                </div>

                {/* Seats Progress */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Seats Available
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-yellow-400">
                      {event.leftSeats || event.totalSeats} / {event.totalSeats}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isAlmostFull ? 'bg-red-500' : isHalfFull ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${seatPercentage}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm mt-2 font-medium ${
                    isAlmostFull 
                      ? 'text-red-600 dark:text-red-400' 
                      : isHalfFull 
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                  }`}>
                    {isAlmostFull ? '🚨 Almost full! Book now!' : 
                     isHalfFull ? '⚡ Going fast! Secure your spot!' : 
                     '✅ Plenty of seats available!'}
                  </p>
                </div>

                {/* Tags */}
                {event.tags && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Event Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  About This Event
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            )}

            {/* Highlights */}
            {event.highlights && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiAward className="text-yellow-500" />
                  Event Highlights
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.highlights}
                </p>
              </motion.div>
            )}
          </motion.article>

          {/* Right Column - Actions & Info */}
          <motion.aside variants={itemVariants} className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
              {/* Event Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                {event.title}
              </h1>

              {/* Quick Info */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Available Seats
                  </span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {event.leftSeats || event.totalSeats}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Total Capacity
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {event.totalSeats}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/register/${id}`)}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <FiUsers className="text-xl" />
                  Register Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <FiShare2 className="text-xl" />
                  Share Event
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/events')}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-4 px-6 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <FiArrowLeft className="text-xl" />
                  Browse More Events
                </motion.button>
              </div>

              {/* Safety Note */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
                  🔒 Secure registration • 📧 Instant confirmation • ⚡ Quick process
                </p>
              </div>
            </div>
          </motion.aside>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default EventDetails;