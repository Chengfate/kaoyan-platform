import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const SECRET = 'kaoyan-platform-secret-change-in-production';
const TOKEN_EXPIRE = '24h';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: TOKEN_EXPIRE });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: '无效的认证令牌' });
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: '需要管理员权限' });
  }
  next();
}
