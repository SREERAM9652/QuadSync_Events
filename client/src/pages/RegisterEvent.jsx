import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { registerForEvent, getEventById } from '../services/eventService';

// Memoized validation rules
const validationRules = {
  name: { required: true, message: 'Name is required' },
  email: { 
    required: true, 
    pattern: /\S+@\S+\.\S+/, 
    message: 'Invalid email format' 
  },
  mobile: { 
    required: true, 
    pattern: /^\d{10}$/, 
    message: 'Mobile number must be 10 digits' 
  }
};

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

  // Optimized event fetching with caching
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Check if we already have the event data
        const cachedEvent = sessionStorage.getItem(`event-${eventId}`);
        if (cachedEvent) {
          setEvent(JSON.parse(cachedEvent));
          setEventLoading(false);
          return;
        }

        const eventData = await getEventById(eventId);
        const eventInfo = eventData.data;
        setEvent(eventInfo);
        
        // Cache the event data
        sessionStorage.setItem(`event-${eventId}`, JSON.stringify(eventInfo));
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

  // Memoized validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rule = validationRules[field];
      const value = formData[field].trim();
      
      if (rule.required && !value) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message;
      }
    });
    
    return newErrors;
  }, [formData]);

  // Optimized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field only if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Debounced form validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(errors).length > 0) {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData, validateForm, errors]);

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
      // Prepare registration data efficiently
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        message: formData.message.trim(),
        eventId,
        eventTitle: event?.title,
        eventDate: event?.date,
        eventTime: event?.time,
        eventLocation: event?.location
      };

      await registerForEvent(registrationData);
      
      setStatus('✅ Registration successful!');
      
      // Navigate immediately without waiting for state updates
      navigate('/welcome', {
        state: {
          name: formData.name.trim(),
          email: formData.email.trim(),
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
      
      // Reset form after navigation is triggered
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (err) {
      setStatus('❌ Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized modal handler
  const handleOpenModal = useCallback(() => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setShowModal(true);
    }
  }, [validateForm]);

  // Memoized event info to prevent unnecessary re-renders
  const eventInfo = useMemo(() => {
    if (!event) return null;
    
    return (
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
    );
  }, [event]);

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
        {/* Event Info */}
        {eventInfo}

        <h2 className="text-3xl font-bold mb-6 text-indigo-700 dark:text-yellow-300 text-center">
          📝 Register for Event
        </h2>
        <hr className="mb-10" />

        <form aria-describedby="form-status" className="space-y-5">
          {/* Form Fields - Consider extracting to separate component for better performance */}
          <FormField
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
          />

          <FormField
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />

          <FormField
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            error={errors.mobile}
            disabled={loading}
          />

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

          <button
            type="button"
            disabled={loading}
            onClick={handleOpenModal}
            className={`w-full font-semibold py-3 rounded-lg transition ${
              loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              'Register Now'
            )}
          </button>
        </form>

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
        <ConfirmationModal
          event={event}
          formData={formData}
          onClose={() => setShowModal(false)}
          onConfirm={handleSubmit}
        />
      )}
    </main>
  );
}

// Extracted Form Field Component for better performance
const FormField = React.memo(({ type, name, placeholder, value, onChange, error, disabled }) => (
  <div>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={placeholder}
      aria-invalid={!!error}
      aria-describedby={`${name}-error`}
      className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
        error ? 'border-red-500' : ''
      }`}
    />
    {error && (
      <p id={`${name}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
));

// Extracted Modal Component
const ConfirmationModal = React.memo(({ event, formData, onClose, onConfirm }) => (
  <div
    role="dialog"
    aria-modal="true"
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md text-gray-800 dark:text-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-700 dark:text-yellow-300">Confirm Registration</h3>
      
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
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
        >
          Confirm & Register
        </button>
      </div>
    </div>
  </div>
));

export default RegisterEvent;
