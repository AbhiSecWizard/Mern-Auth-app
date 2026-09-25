const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = userAuth;