import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  try{
    // 1. Get token from cookie
  const token = req.cookies.jwt;

  if(!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" }); 
  }

  //2. verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //3. Get user from decoded token
  const user = await User.findById(decoded.userId).select("_id name email role isApprovedVendor");

  if(!user){
    return res.status(401).json({ message: "User not found"});
  }
  //4. Attach user to request
  req.user = user;
  next();

} catch(err){
  if(err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Session expired. Login again."});
  }
  if(err.name === "JsonWebTokenError"){
    return res.status(401).json({ message: "Invalid token"})
  }
  
  res.status(500).json({ message: "Server Error" });
  }
}

// if role is vendor and approved by superAdmin or if role is superAdmin then only access the route

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user){
      return res.status(401).json({ message: "Unauthorized user Try to access. !"})
    }

    if(!roles.includes(req.user.role)){
      return res.status(403).json({ message: "Access denied. You don't have permission to access this resource."})
    }
  }
}