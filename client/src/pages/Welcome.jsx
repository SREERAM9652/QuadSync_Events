import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiShare2, 
  FiCalendar, 
  FiArrowRight, 
  FiCheckCircle,
  FiDownload
} from 'react-icons/fi';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { format, differenceInDays } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Welcome() {
    const location = useLocation();
    const navigate = useNavigate();
    const { name, email, event } = location.state || {};
    const { height, width } = useWindowSize();

    const [showConfetti, setShowConfetti] = useState(true);
    const [copied, setCopied] = useState(false);
    const [daysLeft, setDaysLeft] = useState(null);

    useEffect(() => {
        toast.success('🎉 You\'re officially registered! See you at the event.');
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!name || !email || !event) {
            navigate('/events');
        } else {
            const eventDate = new Date(event.date);
            const today = new Date();
            const diff = differenceInDays(eventDate, today);
            setDaysLeft(diff);
        }
    }, [name, email, event, navigate]);

    const handleShare = async () => {
        const shareText = `🎉 I just registered for "${event?.title}" on ${event?.date} at ${event?.location}! Join me for an amazing experience!`;
        
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
        const startDate = format(new Date(event.date), "yyyyMMdd");
        const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${startDate}T100000Z
DTEND:${startDate}T120000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR
        `.trim();

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('📅 Event added to your calendar!');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, type: "spring", stiffness: 100 }
        }
    };

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
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            role="main"
            aria-label="Event registration confirmation"
            className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20"
        >
            {showConfetti && <Confetti width={width} height={height} />}
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
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-center"
                >
                    <div className="w-full max-w-2xl">
                        <motion.div
                            variants={itemVariants}
                            className="relative bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-1 rounded-3xl shadow-2xl"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center relative overflow-hidden">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500 rounded-full translate-x-1/2 translate-y-1/2"></div>
                                </div>

                                {/* Success Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                                >
                                    <FiCheckCircle className="text-4xl text-white" />
                                </motion.div>

                                {/* Main Title */}
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4"
                                >
                                    You're Registered! 🎉
                                </motion.h1>

                                {/* Event Summary */}
                                <motion.article
                                    variants={itemVariants}
                                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6 text-left"
                                >
                                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                                        Thank you, <strong className="text-green-600 dark:text-green-400">{name}</strong>! 
                                        You've successfully registered for <strong className="text-blue-600 dark:text-blue-400">{event.title}</strong>.
                                    </p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <FiCalendar className="text-green-500" />
                                            <span><strong>Date:</strong> {event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                            <FiCheckCircle className="text-blue-500" />
                                            <span><strong>Location:</strong> {event.location}</span>
                                        </div>
                                    </div>

                                    {daysLeft !== null && (
                                        <motion.p
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1 }}
                                            className={`mt-4 text-center font-semibold text-lg ${
                                                daysLeft <= 7 
                                                    ? 'text-red-600 dark:text-red-400' 
                                                    : daysLeft <= 30
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-green-600 dark:text-green-400'
                                            }`}
                                        >
                                            ⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} until the event — get excited!
                                        </motion.p>
                                    )}
                                </motion.article>

                                <motion.p
                                    variants={itemVariants}
                                    className="text-lg text-gray-600 dark:text-gray-400 mb-8"
                                >
                                    A confirmation email has been sent to <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong>.
                                </motion.p>

                                {/* Action Buttons */}
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleShare}
                                        className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <FiShare2 className="text-xl" />
                                        Share with Friends
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleDownloadICS}
                                        className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <FiDownload className="text-xl" />
                                        Add to Calendar
                                    </motion.button>
                                </motion.div>

                                {/* Next Steps */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8"
                                >
                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                                        What's Next?
                                    </h3>
                                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 text-left">
                                        <li>✅ Check your email for confirmation details</li>
                                        <li>✅ Save the date in your calendar</li>
                                        <li>✅ Follow us on social media for updates</li>
                                        <li>✅ Arrive 15 minutes early on event day</li>
                                    </ul>
                                </motion.div>

                                {/* Browse More Events */}
                                <motion.div
                                    variants={itemVariants}
                                    className="text-center"
                                >
                                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                        Discover More Amazing Events
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/events')}
                                        className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl mx-auto"
                                    >
                                        <FiArrowRight className="text-xl" />
                                        Browse All Events
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.main>
    );
}

export default Welcome;