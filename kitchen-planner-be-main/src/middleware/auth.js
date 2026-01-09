const jwt = require("jsonwebtoken");
const User = require("../models/User/user");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in, token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Invalid token, user not found" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to access this route" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
module.exports = {isAuthenticated, isAdmin};
