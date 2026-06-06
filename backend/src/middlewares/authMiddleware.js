const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'stockos_super_secret_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const requireDev = (req, res, next) => {
  if (req.user.role !== 'DEV') {
    return res.status(403).json({ error: 'Acesso negado: Requer privilégios de DEV' });
  }
  next();
};

module.exports = { verifyToken, requireDev };
