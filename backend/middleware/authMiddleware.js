const jwt = require('jsonwebtoken');//Needed to verify tokens created during login

const protect = (req, res, next) => {//Middleware → runs before protected routes,Purpose: check if user is logged in
  const token = req.headers.authorization?.split(' ')[1];//split(' ') → ["Bearer", "token"]//[1] → actual token//?. → avoids crash if header missing
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });//401 = Unauthorized,Stops request immediately
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);//Check : token is real,Not expire, Signed with correct secret,if valid: returns decoded payload.(Id, role)
    req.user = decoded;//Attach user to request,Now every next middleware/route can access:
    next();//Moves to next middleware / controller
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });//Covered: expired token, fake token, wrong secret
  }
};

const adminOnly = (req, res, next) => {//Used after protect,Restricts access to admins
  if (req.user.role !== 'admin') {//Uses data set in protect
    return res.status(403).json({ message: 'Admin access only' });//Uses data set in protect, 403 = forbidden
  }
  next();//Allow admin
};

module.exports = { protect, adminOnly };//Makes both middlewares usable in other file too