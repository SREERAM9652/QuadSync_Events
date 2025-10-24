import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiCalendar, 
  FiMail, 
  FiShield, 
  FiMenu, 
  FiX,
  FiUser,
  FiLogIn,
  FiStar
} from 'react-icons/fi';
import DarkModeToggle from './DarkModeToggle';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome className="text-lg" /> },
    { name: 'Events', path: '/events', icon: <FiCalendar className="text-lg" /> },
    { name: 'Contact', path: '/contact', icon: <FiMail className="text-lg" /> },
    { name: 'Admin', path: '/admin', icon: <FiShield className="text-lg" /> },
  ];

  const mobileLinkVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  const containerVariants = {
    closed: { 
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700' 
          : 'bg-transparent'
      }`}
    >
      <nav className="w-full" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <NavLink
                to="/"
                className="flex items-center gap-3 group"
                aria-label="QuadSync Event Home"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${
                    isScrolled ? '' : 'text-white'
                  }`}>
                    QuadSync
                  </span>
                  <span className={`text-sm -mt-1 ${
                    isScrolled ? 'text-gray-600 dark:text-gray-400' : 'text-gray-200'
                  }`}>
                    Events
                  </span>
                </div>
              </NavLink>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1" role="menubar">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 ${
                        isScrolled 
                          ? isActive
                            ? 'text-indigo-600 dark:text-yellow-400 bg-indigo-50 dark:bg-gray-800'
                            : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-yellow-400 hover:bg-white dark:hover:bg-gray-800'
                          : isActive
                            ? 'text-white bg-white/20 backdrop-blur-sm'
                            : 'text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                      }`
                    }
                    role="menuitem"
                    aria-label={`Go to ${link.name}`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                    
                    {/* Active indicator */}
                    {({ isActive }) => isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-yellow-400/10 dark:to-orange-400/10 rounded-2xl border border-indigo-200/50 dark:border-yellow-400/30"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </motion.div>
              ))}
              
              {/* Auth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700"
              >
               
                
               

                {/* Dark Mode Toggle */}
                <div className="ml-2">
                  <DarkModeToggle />
                </div>
              </motion.div>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden text-2xl p-2 rounded-2xl transition-all ${
                isScrolled
                  ? 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'text-white bg-white/20 backdrop-blur-sm hover:bg-white/30'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
              className={`md:hidden absolute top-full left-0 right-0 ${
                isScrolled
                  ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700'
                  : 'bg-gray-900/95 backdrop-blur-lg'
              }`}
              role="menu"
              aria-label="Mobile navigation"
            >
              <motion.ul 
                variants={containerVariants}
                className="px-4 py-6 space-y-2"
              >
                {navLinks.map((link) => (
                  <motion.li key={link.name} variants={mobileLinkVariants}>
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        `group flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-semibold transition-all ${
                          isScrolled
                            ? isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            : isActive
                              ? 'bg-white/20 text-white backdrop-blur-sm'
                              : 'text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                        }`
                      }
                      role="menuitem"
                      aria-label={`Go to ${link.name}`}
                    >
                      <div className={`p-2 rounded-xl ${
                        isScrolled 
                          ? 'bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-yellow-400'
                          : 'bg-white/20 text-white'
                      }`}>
                        {link.icon}
                      </div>
                      <span>{link.name}</span>
                    </NavLink>
                  </motion.li>
                ))}
                
                {/* Mobile Auth Buttons */}
                <motion.div variants={mobileLinkVariants} className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold ${
                      isScrolled
                        ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FiLogIn className="text-lg" />
                    Login to Account
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl text-base font-semibold shadow-lg"
                  >
                    <FiUser className="text-lg" />
                    Create Account
                  </motion.button>

                  {/* Dark Mode Toggle for Mobile */}
                  <div className="flex justify-center pt-2">
                    <DarkModeToggle />
                  </div>
                </motion.div>
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

export default Navbar;