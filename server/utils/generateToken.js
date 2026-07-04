import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'careerconnectsecretkey123', {
    expiresIn: '30d',
  });
};

export default generateToken;
