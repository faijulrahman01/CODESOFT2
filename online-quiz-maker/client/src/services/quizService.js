import API from './api';

const getQuizzes = async (search = '', page = 1, limit = 10) => {
  const response = await API.get(`/quizzes?search=${search}&page=${page}&limit=${limit}`);
  return response.data;
};

const getMyQuizzes = async () => {
  const response = await API.get('/quizzes/my');
  return response.data;
};

const getQuizById = async (id) => {
  const response = await API.get(`/quizzes/${id}`);
  return response.data;
};

const createQuiz = async (quizData) => {
  const response = await API.post('/quizzes', quizData);
  return response.data;
};

const updateQuiz = async (id, quizData) => {
  const response = await API.put(`/quizzes/${id}`, quizData);
  return response.data;
};

const deleteQuiz = async (id) => {
  const response = await API.delete(`/quizzes/${id}`);
  return response.data;
};

const quizService = {
  getQuizzes,
  getMyQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};

export default quizService;
