import axiosInstance from '../utils/axiosInstance';

const API = '/api/events';

export const registerForEvent = (formData) => {
  console.log('📤 Registering for event with data:', formData);
  return axiosInstance.post('/api/register', formData);
};

export const getEvents = () => {
  console.log('🔄 Fetching all events');
  return axiosInstance.get(API);
};

export const getEventById = (id) => {
  console.log('🔄 Fetching event by ID:', id);
  return axiosInstance.get(`${API}/${id}`);
};

export const createEvent = (formData, token) =>
  axiosInstance.post(API, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const updateEvent = (id, formData, token) =>
  axiosInstance.put(`${API}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

export const deleteEvent = (id, token) =>
  axiosInstance.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getRegistrations = (eventId, token) =>
  axiosInstance.get(`${API}/${eventId}/registrations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
