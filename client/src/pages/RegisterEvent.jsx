import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { registerForEvent, getEventById } from '../services/eventService';

function RegisterEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);

  // Fetch event details when component mounts
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(eventId);
        setEvent(eventData.data); // Access the data property from axios response
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setStatus('❌ Failed to load event details. Please try again.');
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async () => {
    setShowModal(false);
    setStatus('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await registerForEvent({ 
        ...formData, 
        eventId,
        eventTitle: event?.title,
        eventDate: event?.date,
        eventTime: event?.time,
        eventLocation: event?.location
      });
      
      setStatus('✅ Registration successful! Please check your email.');
      
      // Use actual event data from the fetched event
      navigate('/welcome', {
        state: {
          name: formData.name,
          email: formData.email,
          event: {
            id: eventId,
            title: event?.title || 'Event',
            date: event?.date || 'Date not specified',
            time: event?.time || 'Time not specified',
            location: event?.location || 'Location not specified',
            description: event?.description || 'Join us for an amazing event!',
          },
        },
      });
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (err) {
      setStatus('❌ Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching event data
  if (eventLoading) {
    return (
      <main className="min-h-screen w-full pt-24 px-6 py-16 bg-gradient-to-br from-[#F0F4FF] to-white dark:from-[#0F172A] dark:to-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </main>
    );
  }

  // Show error if event not found
  if (!event) {
    return (
      <main className="min-h-screen w-full pt-24 px-6 py-16 bg-gradient-to-br from-[#F0F4FF] to-white dark:from-[#0F172A] dark:to-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Event not found
          </h3>
          <button
            onClick={() => navigate('/events')}
            className="text-indigo-600 dark:text-yellow-400 hover:underline"
          >
            Browse Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      role="main"
      aria-label="Event registration form"
      className="min-h-screen w-full pt-24 px-6 py-16 bg-gradient-to-br from-[#F0F4FF] to-white dark:from-[#0F172A] dark:to-[#1E293B] text-gray-800 dark:text-gray-200"
    >
      <div className="max-w-xl mx-auto border rounded-xl shadow-lg p-8 bg-white dark:bg-[#1E293B]">
        {/* Display Event Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
            {event.title}
          </h1>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center gap-2">
              <span>📅</span>
              <span>{event.date} • {event.time}</span>
            </p>
            <p className="flex items-center gap-2">
              <span>📍</span>
              <span>{event.location}</span>
            </p>
            {event.description && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">{event.description}</p>
            )}
            {event.leftSeats !== undefined && (
              <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                🪑 {event.leftSeats} seats available
              </p>
            )}
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-yellow-300 text-center">
          📝 Register for Event
        </h2>
        <hr className="mb-10" />

        <form aria-describedby="form-status" className="space-y-5">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              aria-label="Your name"
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              aria-label="Your email"
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.email ? 'border-red-500' : ''
              }`}
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              disabled={loading}
              aria-label="Mobile number"
              aria-invalid={!!errors.mobile}
              aria-describedby="mobile-error"
              className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.mobile ? 'border-red-500' : ''
              }`}
            />
            {errors.mobile && (
              <p id="mobile-error" className="text-red-500 text-sm mt-1">
                {errors.mobile}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <textarea
              name="message"
              placeholder="Message (optional)"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              disabled={loading}
              aria-label="Optional message"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Submit triggers modal */}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              const validationErrors = validateForm();
              if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
              } else {
                setShowModal(true);
              }
            }}
            className={`w-full font-semibold py-3 rounded-lg transition ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? 'Submitting...' : 'Register Now'}
          </button>
        </form>

        {/* Status Message */}
        {status && (
          <p
            id="form-status"
            role="status"
            aria-live="polite"
            className={`mt-6 text-center font-medium ${
              status.includes('successful')
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {status}
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md text-gray-800 dark:text-gray-200">
            <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-yellow-300">Confirm Registration</h3>
            
            {/* Event Details in Modal */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{event.title}</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="flex items-center gap-2">
                  <span>📅</span>
                  <span>{event.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>⏰</span>
                  <span>{event.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{event.location}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Mobile:</strong> {formData.mobile}</p>
              {formData.message && <p><strong>Message:</strong> {formData.message}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
              >
                Confirm & Register
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default RegisterEvent;