import jwt from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (userId, res) => {
  const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || '7d'});

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    httpOnly: true, // protect from Cross-Site Scripting (XSS)
    sameSite: 'strict', // Cookie only works on same site like protectiion againsT Cross-Site Request Forgery(CSRF)
  })
  return token;
}

