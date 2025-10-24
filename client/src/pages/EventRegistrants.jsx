import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiSearch, 
  FiDownload, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiArrowLeft
} from 'react-icons/fi';
import {
  getRegistrations,
  deleteSingleRegistrant,
  deleteAllRegistrants,
} from '../services/registrationService';
import { getEventById } from '../services/eventService';
import { exportToCSV } from '../services/csvService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EventRegistrants() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [registrants, setRegistrants] = useState([]);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventRes, registrantsRes] = await Promise.all([
        getEventById(eventId),
        getRegistrations(eventId, token)
      ]);
      setEvent(eventRes.data);
      setRegistrants(registrantsRes.data);
    } catch (err) {
      setError('Failed to load data');
      toast.error('❌ Failed to load event details or registrants');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRegistrants = registrants.filter((reg) =>
    `${reg.name} ${reg.email} ${reg.mobile}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSingleRegistrant = async (regId, regName) => {
    if (!window.confirm(`Are you sure you want to remove ${regName}? This action cannot be undone.`)) return;
    
    setDeleteLoading(prev => ({ ...prev, [regId]: true }));
    try {
      await deleteSingleRegistrant(regId, token);
      setRegistrants((prev) => prev.filter((r) => r._id !== regId));
      toast.success(`👤 ${regName} removed successfully!`);
    } catch {
      toast.error('❌ Failed to remove registrant');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [regId]: false }));
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to remove ALL registrants for this event? This action cannot be undone.')) return;
    
    const toastId = toast.loading('🗑️ Removing all registrants...');
    try {
      await deleteAllRegistrants(eventId, token);
      setRegistrants([]);
      toast.success('✅ All registrants removed successfully!', { id: toastId });
    } catch {
      toast.error('❌ Failed to remove all registrants', { id: toastId });
    }
  };

  const handleExportCSV = () => {
    const toastId = toast.loading('📤 Exporting CSV...');
    try {
      const headers = ['Name', 'Email', 'Mobile', 'Message', 'Registration Date'];
      const rows = filteredRegistrants.map((reg) => [
        reg.name,
        reg.email,
        reg.mobile,
        reg.message || 'N/A',
        new Date(reg.createdAt).toLocaleDateString()
      ]);
      exportToCSV(`registrants_${event?.title?.replace(/\s+/g, '_') || 'event'}.csv`, headers, rows);
      toast.success('✅ CSV exported successfully!', { id: toastId });
    } catch {
      toast.error('❌ Failed to export CSV', { id: toastId });
    }
  };

  const stats = [
    {
      label: 'Total Registrants',
      value: registrants.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Filtered Results',
      value: filteredRegistrants.length,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'With Messages',
      value: registrants.filter(reg => reg.message && reg.message.trim()).length,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ];

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
      aria-label="Event registrants dashboard"
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Event Registrants
              </h1>
              {event && (
                <div className="mt-2">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    📅 {event.date} • 📍 {event.location || 'Location not specified'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <FiDownload className="text-lg" />
                Export CSV
              </motion.button>
              
              {registrants.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <FiTrash2 className="text-lg" />
                  Clear All
                </motion.button>
              )}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`${stat.bgColor} rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} text-white`}>
                    <FiUsers className="text-3xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.header>

        {/* Search */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all shadow-lg"
            />
          </div>
        </motion.section>

        {/* Registrant List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredRegistrants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm ? 'No matching registrants found' : 'No registrants yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Registrants will appear here once people start signing up'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6"
            >
              <AnimatePresence>
                {filteredRegistrants.map((registrant, index) => (
                  <motion.div
                    key={registrant._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            <FiUser />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {registrant.name}
                              </h3>
                              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                                #{index + 1}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FiMail className="text-lg" />
                                <span className="text-sm">{registrant.email}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FiPhone className="text-lg" />
                                <span className="text-sm">{registrant.mobile}</span>
                              </div>
                              
                              {registrant.message && (
                                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mt-3">
                                  <FiMessageSquare className="text-lg mt-1 flex-shrink-0" />
                                  <p className="text-sm italic">
                                    "{registrant.message}"
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                              Registered on {new Date(registrant.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteSingleRegistrant(registrant._id, registrant.name)}
                        disabled={deleteLoading[registrant._id]}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl font-semibold transition-all shadow-lg self-start lg:self-center"
                      >
                        {deleteLoading[registrant._id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiTrash2 className="text-lg" />
                        )}
                        Remove
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.main>
  );
}

export default EventRegistrants;