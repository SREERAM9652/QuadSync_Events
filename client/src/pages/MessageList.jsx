import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiTrash2, 
  FiCheckCircle, 
  FiUser, 
  FiMessageCircle,
  FiCalendar,
  FiSearch
} from 'react-icons/fi';
import {
  getMessages,
  markMessageAsRead,
  deleteMessage
} from '../services/contactService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await getMessages();
      setMessages(res.data);
    } catch (err) {
      console.error('Message fetch error:', err);
      setError('Failed to load messages');
      toast.error('❌ Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id, name) => {
    try {
      await markMessageAsRead(id);
      fetchMessages();
      toast.success(`📬 Message from ${name} marked as read`);
    } catch (err) {
      toast.error('❌ Failed to mark as read');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the message from ${name}?`)) return;
    
    try {
      await deleteMessage(id);
      fetchMessages();
      toast.success(`🗑️ Message from ${name} deleted`);
    } catch (err) {
      toast.error('❌ Failed to delete message');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL messages? This action cannot be undone.')) return;
    
    const toastId = toast.loading('🗑️ Deleting all messages...');
    try {
      await Promise.all(messages.map((msg) => deleteMessage(msg._id)));
      fetchMessages();
      toast.success('✅ All messages deleted successfully!', { id: toastId });
    } catch (err) {
      toast.error('❌ Failed to delete all messages', { id: toastId });
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ? true :
                         filter === 'read' ? msg.read :
                         filter === 'unread' ? !msg.read : true;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Total Messages',
      value: messages.length,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Unread',
      value: messages.filter(msg => !msg.read).length,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      label: 'Read',
      value: messages.filter(msg => msg.read).length,
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
      aria-label="Admin message inbox"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Contact Messages
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                Manage and respond to user inquiries
              </p>
            </div>
            
            {messages.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteAll}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <FiTrash2 className="text-lg" />
                Delete All
              </motion.button>
            )}
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
                    <FiMail className="text-3xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.header>

        {/* Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Messages' },
                { key: 'unread', label: 'Unread' },
                { key: 'read', label: 'Read' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
                    filter === tab.key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-64">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* Messages List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm || filter !== 'all' ? 'No matching messages found' : 'No messages yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                {searchTerm || filter !== 'all' ? 'Try adjusting your search or filters' : 'Messages will appear here when users contact you'}
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
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all ${
                      !message.read ? 'ring-2 ring-yellow-400' : ''
                    }`}
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
                                {message.name}
                              </h3>
                              {!message.read && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                  <FiMail className="text-xs" />
                                  New
                                </span>
                              )}
                              {message.read && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                  <FiCheckCircle className="text-xs" />
                                  Read
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FiMail className="text-lg" />
                                <span className="text-sm">{message.email}</span>
                              </div>
                              
                              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mt-3">
                                <FiMessageCircle className="text-lg mt-1 flex-shrink-0" />
                                <p className="text-sm leading-relaxed">
                                  {message.message}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                              <FiCalendar className="inline mr-1" />
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 self-start lg:self-center">
                        {!message.read && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMarkAsRead(message._id, message.name)}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-2xl font-semibold transition-all shadow-lg"
                          >
                            <FiCheckCircle className="text-lg" />
                            Mark Read
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(message._id, message.name)}
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

export default MessageList;