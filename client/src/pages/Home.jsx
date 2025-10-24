
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit,
  FiMail,
  FiLock,
  FiSearch,
  FiShield,
  FiStar,
  FiGrid,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiHeart
} from 'react-icons/fi';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';

const MAX_WORDS = 30;

function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedHome');
    if (!hasVisited) {
      toast.success('👋 Welcome to the Event Platform!');
      localStorage.setItem('hasVisitedHome', 'true');
    }
  }, []);

  useEffect(() => {
    axiosInstance.get('/api/feedback/verified')
      .then(res => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error('Error fetching feedback:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getEvents()
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setFeaturedEvents(sorted.slice(0, 3));
      })
      .catch((err) => console.error('Error fetching events:', err));
  }, []);

  const getWordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const wordCount = getWordCount(form.comment);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/feedback', form);
      toast.success('✅ Thanks for your Feedback! Awaiting admin approval.');
      setForm({ name: '', rating: 5, comment: '' });
    } catch (err) {
      toast.error('❌ Failed to submit feedback.');
    }
  };

  const allTags = [...new Set(featuredEvents.flatMap(ev => ev.tags?.split(',').map(tag => tag.trim()) || []))];

  const filteredEvents = featuredEvents.filter(event => {
    const matchesSearch = `${event.title} ${event.location}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag ? event.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 dark:from-gray-900/50 dark:to-gray-800/50 z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/videos/videoplayback.mp4" type="video/mp4" />
        </video>
        
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 px-6 py-24 text-center flex flex-col items-center justify-center h-full"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20"
            >
              <FiStar className="text-yellow-400" />
              <span className="text-white font-semibold">Trusted by 10,000+ Students</span>
            </motion.div>

            <h1 className="text-6xl max-md:text-4xl font-bold text-white mb-6 leading-tight">
              Discover Amazing{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Events
              </span>{' '}
              Near You
            </h1>
            
            <p className="text-xl max-md:text-lg text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
              From tech conferences to cultural festivals - find, register, and experience events that matter to you.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/events')}
                className="group bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3"
              >
                <FiCalendar className="text-lg" />
                Explore Events
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/login')}
                className="group bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all hover:bg-white/10 flex items-center gap-3"
              >
                <FiLock className="text-lg" />
                Admin Portal
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { number: '500+', label: 'Events' },
                { number: '50K+', label: 'Attendees' },
                { number: '99%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </div>
        </motion.div>
      </div>

       {/* Featured Events */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 dark:text-yellow-300 text-center mb-6">
          🌟 Seats Are Filling Fast — Grab Yours Now
        </h2>
        <hr className="mb-12 border-gray-300 dark:border-gray-600" />
        {filteredEvents.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">No events match your search or selected tag.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <Card
                key={event._id}
                id={event._id}
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
                description={event.description}
                bannerPath={event.bannerPath}
                leftSeate={event.leftSeats}
              />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/events')}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-white dark:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition shadow-md"
          >
            See All Events
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to discover and manage events in one place
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <FiEdit className="text-3xl" />,
                title: "Easy Registration",
                desc: "Quick and simple form to reserve your spot in seconds",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <FiMail className="text-3xl" />,
                title: "Instant Confirmation",
                desc: "Get immediate email confirmation with all event details",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <FiUsers className="text-3xl" />,
                title: "Live Seat Tracking",
                desc: "Real-time updates on available seats and event capacity",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: <FiShield className="text-3xl" />,
                title: "Secure & Reliable",
                desc: "Enterprise-grade security for your data and payments",
                color: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <FiSearch className="text-2xl" />,
                title: "Discover Events",
                desc: "Browse through curated events matching your interests"
              },
              {
                step: "02",
                icon: <FiEdit className="text-2xl" />,
                title: "Register Instantly",
                desc: "Fill out the simple form and secure your spot"
              },
              {
                step: "03",
                icon: <FiCheckCircle className="text-2xl" />,
                title: "Get Confirmed",
                desc: "Receive confirmation and prepare for the experience"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl font-bold text-indigo-600 dark:text-yellow-400">
                      {step.step}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of satisfied event attendees
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FiHeart className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No feedback yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Be the first to share your experience!
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {feedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                      {feedback.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {feedback.name}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={i < feedback.rating ? "fill-current" : ""}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    "{feedback.comment}"
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Share Your Experience
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your feedback helps us improve
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Your Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setForm(prev => ({ ...prev, rating: star }))}
                      className={`p-3 rounded-2xl transition-all ${
                        form.rating >= star
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                      }`}
                    >
                      <FiStar className={form.rating >= star ? "fill-current" : ""} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Your Feedback *
              </label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all resize-none"
                placeholder="Share your thoughts..."
              />
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  {['😊', '🔥', '💯', '👍', '🎉'].map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setForm(prev => ({ ...prev, comment: prev.comment + emoji }))}
                      className="text-xl hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
                <div className={`text-sm ${wordCount > MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                  {wordCount}/{MAX_WORDS} words
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={wordCount > MAX_WORDS}
              className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all ${
                wordCount > MAX_WORDS
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl'
              }`}
            >
              Submit Feedback 🚀
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Find Your Next Adventure?
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
              Join thousands of students discovering amazing events and creating unforgettable memories.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/events')}
              className="group bg-white text-indigo-600 font-bold px-12 py-4 rounded-2xl text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center gap-3 mx-auto"
            >
              <FiCalendar className="text-lg" />
              Browse All Events
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;