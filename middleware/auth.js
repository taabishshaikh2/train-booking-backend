const jwt = require("jsonwebtoken");
const SECRET_KEY = "trainsecret"; // Use a secure env variable in production

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token: Missing userId" });
    }

    req.user = { id: decoded.userId }; // Attach user to request
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
