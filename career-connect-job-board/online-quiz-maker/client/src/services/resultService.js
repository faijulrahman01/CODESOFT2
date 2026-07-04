import API from './api';

const submitQuizResult = async (quizId, answers) => {
  const response = await API.post('/results', { quizId, answers });
  return response.data;
};

const getMyResults = async () => {
  const response = await API.get('/results/my');
  return response.data;
};

const getLeaderboard = async () => {
  const response = await API.get('/results/leaderboard');
  return response.data;
};

const getDashboardStats = async () => {
  const response = await API.get('/results/dashboard/stats');
  return response.data;
};

const resultService = {
  submitQuizResult,
  getMyResults,
  getLeaderboard,
  getDashboardStats,
};

export default resultService;
