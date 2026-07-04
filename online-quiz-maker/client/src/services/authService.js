import API from './api';

const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

const register = async (name, email, password) => {
  const response = await API.post('/auth/register', { name, email, password });
  return response.data;
};

const getProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

const updateProfile = async (formData) => {
  // If formData is a standard object, convert to FormData for multer if we upload files,
  // or handle standard JSON. Let's make sure it handles both.
  const config = formData instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined;
    
  const response = await API.put('/auth/profile', formData, config);
  return response.data;
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
};

export default authService;
