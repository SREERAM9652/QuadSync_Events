import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiDownload, 
  FiCheckCircle, 
  FiTrash2, 
  FiFilter,
  FiMessageCircle,
  FiStar,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { exportToCSV } from '../services/csvService';
import axiosInstance from '../utils/axiosInstance';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideVerified, setHideVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchFeedbacks = () => {
    axiosInstance.get('/api/feedback/admin')
      .then(res => setFeedbacks(res.data))
      .catch(() => toast.error('Failed to fetch feedback'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchFeedbacks, []);

  const handleVerify = async (id) => {
    try {
      await axiosInstance.patch(`/api/feedback/verify/${id}`);
      toast.success('Feedback verified ✅');
      fetchFeedbacks();
    } catch {
      toast.error('Failed to verify feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/api/feedback/${id}`);
      toast.success('Feedback deleted 🗑️');
      fetchFeedbacks();
    } catch {
      toast.error('Failed to delete feedback');
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Rating', 'Comment', 'Verified', 'Date'];
    const rows = feedbacks.map(f => [
      f.name,
      f.rating,
      f.comment,
      f.verified ? 'Yes' : 'No',
      new Date(f.createdAt).toLocaleString()
    ]);
    exportToCSV('feedback_export.csv', headers, rows);
    toast.success('Feedback exported successfully 📊');
  };

  const filters = [
    { key: 'all', label: 'All Feedback', count: feedbacks.length },
    { key: 'verified', label: 'Verified', count: feedbacks.filter(f => f.verified).length },
    { key: 'unverified', label: 'Unverified', count: feedbacks.filter(f => !f.verified).length },
  ];

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' ? true :
                         activeFilter === 'verified' ? f.verified :
                         activeFilter === 'unverified' ? !f.verified : true;
    return matchesSearch && matchesFilter;
  });

  const total = feedbacks.length;
  const verified = feedbacks.filter(f => f.verified).length;
  const unverified = total - verified;

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
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20"
      aria-label="Admin Feedback Panel"
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Feedback Management
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Manage and moderate user feedback
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FiDownload className="text-lg" />
              Export CSV
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              { icon: <FiMessageCircle className="text-3xl" />, label: 'Total Feedback', value: total, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
              { icon: <FiCheckCircle className="text-3xl" />, label: 'Verified', value: verified, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50 dark:bg-green-900/20' },
              { icon: <FiFilter className="text-3xl" />, label: 'Unverified', value: unverified, color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
            ].map((stat, index) => (
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
          </motion.div>
        </motion.header>

        {/* Filters and Search */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
                    activeFilter === filter.key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </motion.button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* Feedback List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No feedback found
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {searchTerm || activeFilter !== 'all' ? 'Try adjusting your search or filters' : 'No feedback has been submitted yet'}
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
                {filteredFeedbacks.map((feedback, index) => (
                  <motion.div
                    key={feedback._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                            <FiUser />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {feedback.name}
                              </h3>
                              {feedback.verified && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                  <FiCheckCircle className="text-xs" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-yellow-500 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={i < feedback.rating ? "fill-current" : ""}
                                />
                              ))}
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                ({feedback.rating}/5)
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {feedback.comment}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        {!feedback.verified && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVerify(feedback._id)}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-2xl font-semibold transition-all shadow-lg"
                          >
                            <FiCheckCircle className="text-lg" />
                            Verify
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(feedback._id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl font-semibold transition-all shadow-lg"
                        >
                          <FiTrash2 className="text-lg" />
                          Delete
                        </motion.button>
                      </div>
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