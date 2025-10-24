import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiCalendar } from 'react-icons/fi';
import { getEvents } from '../services/eventService';
import Card from '../components/Card';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const visitedEventList = localStorage.getItem('visitedEventList');
    if (!visitedEventList) {
      toast('🎉 Here are upcoming events! Find your vibe.');
      localStorage.setItem('visitedEventList', 'true');
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const allTags = [...new Set(events.flatMap(ev => ev.tags?.split(',').map(tag => tag.trim()) || []))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = `${event.title} ${event.location}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? event.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
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

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      role="main"
      aria-label="Browse events"
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
        {/* Header Section */}
        <motion.section
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FiCalendar className="text-4xl text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Discover Events
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Browse a wide range of exciting events including hands-on workshops, cutting-edge tech talks,
              vibrant cultural festivals, and more — all curated to match your interests.
            </p>
          </div>

          {/* Filters */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8"
          >
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="search"
                    placeholder="Search events by title or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all text-lg"
                  />
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="relative">
                  <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all text-lg appearance-none"
                  >
                    <option value="">All Categories</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(searchTerm || selectedTag) && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-2xl font-semibold transition-all shadow-lg"
                >
                  <FiX className="text-lg" />
                  Clear Filters
                </motion.button>
              )}
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedTag) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedTag && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    Category: {selectedTag}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.section>

        {/* Events Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          aria-label="Event results"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available Events ({filteredEvents.length})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Showing {filteredEvents.length} of {events.length} events
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence>
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event._id}
                      variants={itemVariants}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card
                        bannerPath={event.bannerPath}
                        id={event._id}
                        title={event.title}
                        date={event.date}
                        location={event.location}
                        description={event.description}
                        leftSeate={event.leftSeats}
                        image={event.image}
                        time={event.time}
                        tags={event.tags?.split(',').map(tag => tag.trim()) || []}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm || selectedTag ? 'Try adjusting your search criteria' : 'No events available at the moment'}
              </p>
              {(searchTerm || selectedTag) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFilters}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all"
                >
                  Clear Filters
                </motion.button>
              )}
            </div>
          )}
        </motion.section>
      </div>
    </motion.main>
  );
}

export default Events;