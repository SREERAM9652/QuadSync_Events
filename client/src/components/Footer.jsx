import { FiFacebook, FiInstagram, FiLinkedin, FiTwitter, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <footer
      className="w-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700"
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={footerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QuadSync
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Empowering student developers to create real-world applications through innovative event management solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4" aria-label="Social media links">
              {[
                { icon: <FiFacebook className="text-lg" />, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
                { icon: <FiTwitter className="text-lg" />, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
                { icon: <FiInstagram className="text-lg" />, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-500" },
                { icon: <FiLinkedin className="text-lg" />, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-700" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.label} page`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-300 shadow-sm hover:shadow-md`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Quick Links
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-4">
                {[
                  { to: "/", label: "Home" },
                  { to: "/events", label: "Events" },
                  { to: "/about", label: "About Us" },
                  { to: "/contact", label: "Contact" },
                  { to: "/admin", label: "Admin Portal" },
                ].map((link, index) => (
                  <li key={index}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-yellow-400 transition-all duration-300 ${
                          isActive ? 'text-indigo-600 dark:text-yellow-400 font-semibold' : ''
                        }`
                      }
                      aria-label={`Go to ${link.label} page`}
                    >
                      <div className="w-1.5 h-1.5 bg-indigo-600 dark:bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Get In Touch
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: <FiMail className="text-lg" />,
                  content: (
                    <a 
                      href="mailto:sreeramthuraka29@gmail.com" 
                      className="hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
                    >
                      sreeramthuraka29@gmail.com
                    </a>
                  ),
                  bg: "bg-blue-100 dark:bg-blue-900/30",
                  color: "text-blue-600 dark:text-blue-400"
                },
                {
                  icon: <FiPhone className="text-lg" />,
                  content: "+91 93819 35084",
                  bg: "bg-green-100 dark:bg-green-900/30",
                  color: "text-green-600 dark:text-green-400"
                },
                {
                  icon: <FiMapPin className="text-lg" />,
                  content: "Kadapa, Andhra Pradesh, India",
                  bg: "bg-orange-100 dark:bg-orange-900/30",
                  color: "text-orange-600 dark:text-orange-400"
                },
              ].map((contact, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${contact.bg} ${contact.color} group-hover:scale-110 transition-transform duration-300`}>
                    {contact.icon}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {contact.content}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to get notifications about new events and updates.
            </p>
            <form className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-yellow-400 transition-all"
                  aria-label="Email for newsletter subscription"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        {/* Internship Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl px-6 py-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">QS</span>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Part of <span className="text-indigo-600 dark:text-yellow-400">QuadSync Events</span>, enabling student developers to create real-world applications.
            </p>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="text-gray-600 dark:text-gray-400 text-center md:text-left">
            <p className="font-semibold">
              &copy; {currentYear} QuadSync India. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a 
              href="/privacy" 
              className="hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="/cookies" 
              className="hover:text-indigo-600 dark:hover:text-yellow-400 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;