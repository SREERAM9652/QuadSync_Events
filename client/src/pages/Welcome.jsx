import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { 
  FiShare2, 
  FiCalendar, 
  FiArrowRight, 
  FiCheckCircle,
  FiDownload
} from 'react-icons/fi';

// Lazy load heavy components
const Confetti = lazy(() => import('react-confetti'));
const ToastContainer = lazy(() => import('react-toastify').then(mod => ({ default: mod.ToastContainer })));
const { toast } = await import('react-toastify');

function Welcome() {
    const location = useLocation();
    const navigate = useNavigate();
    const { name, email, event } = location.state || {};

    const [showConfetti, setShowConfetti] = useState(false);
    const [copied, setCopied] = useState(false);
    const [daysLeft, setDaysLeft] = useState(null);
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

    // Optimized window size with debounce
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        // Set initial size
        handleResize();

        const debouncedResize = debounce(handleResize, 250);
        window.addEventListener('resize', debouncedResize);

        return () => window.removeEventListener('resize', debouncedResize);
    }, []);

    // Optimized effects
    useEffect(() => {
        let mounted = true;

        const initializeWelcome = async () => {
            // Show confetti after a small delay to allow initial render
            setTimeout(() => {
                if (mounted) setShowConfetti(true);
            }, 100);

            // Show toast after confetti
            setTimeout(() => {
                if (mounted) {
                    toast.success('🎉 You\'re officially registered! See you at the event.');
                }
            }, 500);

            // Hide confetti after 3 seconds
            setTimeout(() => {
                if (mounted) setShowConfetti(false);
            }, 3000);
        };

        if (name && email && event) {
            initializeWelcome();
            
            // Calculate days left
            const eventDate = new Date(event.date);
            const today = new Date();
            const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
            setDaysLeft(diff);
        } else {
            navigate('/events');
        }

        return () => {
            mounted = false;
        };
    }, [name, email, event, navigate]);

    // Memoized share text
    const shareText = useMemo(() => 
        `🎉 I just registered for "${event?.title}" on ${event?.date} at ${event?.location}! Join me for an amazing experience!`,
        [event]
    );

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: shareText,
                    url: window.location.origin + '/events',
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                setCopied(true);
                toast.success('📋 Share message copied to clipboard!');
                setTimeout(() => setCopied(false), 3000);
            });
        }
    };

    const handleDownloadICS = () => {
        const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, '');
        const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${startDate}
DTEND:${startDate}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
        `.trim();

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('📅 Event added to your calendar!');
    };

    // Memoized container variants
    const containerVariants = useMemo(() => ({
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1 // Reduced from 0.2
            }
        }
    }), []);

    const itemVariants = useMemo(() => ({
        hidden: { y: 20, opacity: 0 }, // Reduced from y:30
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, type: "spring", stiffness: 100 } // Reduced duration
        }
    }), []);

    if (!name || !email || !event) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Registration data not found
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

    return (
        <LazyMotion features={domAnimation}>
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }} // Reduced from 0.8
                role="main"
                aria-label="Event registration confirmation"
                className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20"
            >
                {/* Lazy loaded components */}
                <Suspense fallback={null}>
                    {showConfetti && (
                        <Confetti 
                            width={windowSize.width} 
                            height={windowSize.height} 
                            numberOfPieces={80} // Reduced from default 200
                            recycle={false}
                        />
                    )}
                    <ToastContainer 
                        position="top-right"
                        autoClose={3000} // Reduced from 5000
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss={false} // Changed from true
                        draggable
                        pauseOnHover={false} // Changed from true
                        theme="colored"
                    />
                </Suspense>

                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex justify-center"
                    >
                        <div className="w-full max-w-2xl">
                            <motion.div
                                variants={itemVariants}
                                className="relative bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-1 rounded-3xl shadow-lg" // Reduced shadow
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"> {/* Reduced padding on mobile */}
                                    {/* Simplified background pattern */}
                                    <div className="absolute inset-0 opacity-3">
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
                                    </div>

                                    {/* Success Icon */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }} // Reduced delay
                                        className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" // Reduced size and shadow
                                    >
                                        <FiCheckCircle className="text-3xl text-white" /> {/* Reduced icon size */}
                                    </motion.div>

                                    {/* Main Title */}
                                    <motion.h1
                                        variants={itemVariants}
                                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4"
                                    >
                                        You're Registered! 🎉
                                    </motion.h1>

                                    {/* Event Summary */}
                                    <motion.article
                                        variants={itemVariants}
                                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700 mb-4 text-left" // Reduced padding and shadow
                                    >
                                        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
                                            Thank you, <strong className="text-green-600 dark:text-green-400">{name}</strong>! 
                                            You've successfully registered for <strong className="text-blue-600 dark:text-blue-400">{event.title}</strong>.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <FiCalendar className="text-green-500 flex-shrink-0" />
                                                <span><strong>Date:</strong> {event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                <FiCheckCircle className="text-blue-500 flex-shrink-0" />
                                                <span><strong>Location:</strong> {event.location}</span>
                                            </div>
                                        </div>

                                        {daysLeft !== null && (
                                            <motion.p
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className={`mt-3 text-center font-semibold text-base ${
                                                    daysLeft <= 7 
                                                        ? 'text-red-600 dark:text-red-400' 
                                                        : daysLeft <= 30
                                                            ? 'text-yellow-600 dark:text-yellow-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                }`}
                                            >
                                                ⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} until the event
                                            </motion.p>
                                        )}
                                    </motion.article>

                                    <motion.p
                                        variants={itemVariants}
                                        className="text-base text-gray-600 dark:text-gray-400 mb-6"
                                    >
                                        A confirmation email has been sent to <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong>.
                                    </motion.p>

                                    {/* Action Buttons */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="flex flex-col sm:flex-row gap-3 justify-center mb-6"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleShare}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow hover:shadow-lg text-sm" // Reduced padding and size
                                        >
                                            <FiShare2 className="text-lg" />
                                            Share with Friends
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownloadICS}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow hover:shadow-lg text-sm"
                                        >
                                            <FiDownload className="text-lg" />
                                            Add to Calendar
                                        </motion.button>
                                    </motion.div>

                                    {/* Next Steps */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
                                    >
                                        <h3 className="text-base font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                            What's Next?
                                        </h3>
                                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 text-left">
                                            <li>✅ Check your email for confirmation</li>
                                            <li>✅ Save the date in your calendar</li>
                                            <li>✅ Arrive 15 minutes early</li>
                                        </ul>
                                    </motion.div>

                                    {/* Browse More Events */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="text-center"
                                    >
                                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            Discover More Events
                                        </h2>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate('/events')}
                                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow hover:shadow-lg mx-auto text-sm"
                                        >
                                            <FiArrowRight className="text-lg" />
                                            Browse All Events
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </LazyMotion>
    );
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export default Welcome;
