import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiCalendar, 
  FiMail, 
  FiPlus, 
  FiShield, 
  FiLogOut,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiMessageCircle,
  FiBarChart2,
  FiEye,
  FiUserPlus,
  FiHome
} from 'react-icons/fi';
import { getEvents, deleteEvent } from '../services/eventService';
import { exportToCSV } from '../services/csvService';
import { getRegistrations } from '../services/registrationService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [totalLeftSeats, setTotalLeftSeats] = useState(0);
  const [loadingIds, setLoadingIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const hasVisitedAdmin = localStorage.getItem('visitedAdminDashboard');
    if (!hasVisitedAdmin) {
      toast.success('👋 Welcome, Admin! Ready to manage some magic?');
      localStorage.setItem('visitedAdminDashboard', 'true');
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
      const total = res.data.reduce((sum, ev) => sum + (ev.totalSeats || 0), 0);
      const totalLeft = res.data.reduce((sum, ev) => sum + (ev.leftSeats || 0), 0);
      setTotalSeats(total);
      setTotalLeftSeats(totalLeft);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    setLoadingIds((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteEvent(id, token);
      setEvents((prev) => prev.filter((event) => event._id !== id));
      toast.success('Event deleted successfully 🗑️');
    } catch (err) {
      toast.error('Failed to delete event');
    } finally {
      setLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleExportCSV = async (eventId, eventTitle) => {
    try {
      const res = await getRegistrations(eventId, token);
      const headers = ['Name', 'Email', 'Mobile', 'Message', 'Registered At'];
      const rows = res.data.map(reg => [
        reg.name, 
        reg.email, 
        reg.mobile, 
        reg.message,
        new Date(reg.createdAt).toLocaleDateString()
      ]);
      exportToCSV(`registrations_${eventTitle.replace(/\s+/g, '_')}.csv`, headers, rows);
      toast.success('Registrants exported successfully 📊');
    } catch (err) {
      toast.error('Failed to export registrations');
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
      transition: {
        duration: 0.5
      }
    }
  };

  const stats = [
    {
      icon: <FiCalendar className="text-3xl" />,
      label: 'Total Events',
      value: events.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: <FiUsers className="text-3xl" />,
      label: 'Total Seats',
      value: totalSeats,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: <FiBarChart2 className="text-3xl" />,
      label: 'Seats Left',
      value: totalLeftSeats,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const quickActions = [
    {
      icon: <FiMessageCircle className="text-xl" />,
      label: 'Contact Messages',
      path: '/admin/messages',
      color: 'from-purple-500 to-pink-500',
      description: 'View user inquiries'
    },
    {
      icon: <FiUsers className="text-xl" />,
      label: 'All Registrants',
      path: '/admin/registrants',
      color: 'from-indigo-500 to-blue-500',
      description: 'Manage all registrations'
    },
    {
      icon: <FiPlus className="text-xl" />,
      label: 'Add Event',
      path: '/admin/add-event',
      color: 'from-green-500 to-teal-500',
      description: 'Create new event'
    },
    {
      icon: <FiUserPlus className="text-xl" />,
      label: 'Register Admin',
      path: '/admin/register',
      color: 'from-gray-500 to-gray-700',
      description: 'Add new admin'
    },
    {
      icon: <FiMail className="text-xl" />,
      label: 'Feedback',
      path: '/admin/feedback',
      color: 'from-pink-500 to-rose-500',
      description: 'Manage user feedback'
    }
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      id="main-content"
      role="main"
      aria-label="Admin Dashboard"
      // Adjusted padding-top to work with the navbar height (h-20 = 5rem = 80px)
      className="min-h-screen pt-20 w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200"
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
        {/* Navigation Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
          >
            <FiHome className="text-lg" />
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-indigo-600 dark:text-yellow-400 font-semibold">Admin Dashboard</span>
        </motion.nav>

        {/* Welcome Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Welcome back, <span className="font-semibold text-indigo-600 dark:text-yellow-400">{adminName || 'Admin'}</span> 👋
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminName');
                navigate('/admin/login');
              }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FiLogOut className="text-lg" />
              Logout
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label="Event Statistics"
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
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          aria-label="Quick Actions"
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-200 dark:border-gray-700 transition-all text-left"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${action.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {action.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Events Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          aria-label="All Events"
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Events ({events.length})
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/add-event')}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg"
              >
                <FiPlus className="text-lg" />
                Add New Event
              </motion.button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  Get started by creating your first event!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin/add-event')}
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all"
                >
                  Create Event
                </motion.button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Event</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Tags</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Seats</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <button
                              onClick={() => navigate(`/admin/registrants/event/${event._id}`)}
                              className="text-left group"
                            >
                              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-yellow-400 transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ID: {event._id.slice(-8)}
                              </p>
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {event.tags?.split(',').map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {event.leftSeats || event.totalSeats}/{event.totalSeats}
                            </span>
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${((event.leftSeats || event.totalSeats) / event.totalSeats) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/events/${event._id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-colors"
                              title="View Event"
                            >
                              <FiEye className="text-lg" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-2xl transition-colors"
                              title="Edit Event"
                            >
                              <FiEdit className="text-lg" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleExportCSV(event._id, event.title)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-2xl transition-colors"
                              title="Export Registrants"
                            >
                              <FiDownload className="text-lg" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteEvent(event._id)}
                              disabled={loadingIds[event._id]}
                              className={`p-2 rounded-2xl transition-colors ${
                                loadingIds[event._id]
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                              }`}
                              title="Delete Event"
                            >
                              <FiTrash2 className="text-lg" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default AdminDashboard;