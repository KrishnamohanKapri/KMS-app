const User = require("../models/User/user");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const path = require("path");
const sendNotification = require("../utils/sendNotification");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/sendMail"); // Added specialized password reset email utility

//register
const register = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return ErrorHandler("User already exists", 400, req, res);
    }
    if (role === "admin" || role === "employee" || role === "rider") {
      return ErrorHandler(
        "You are not authorized to create this role. Only 'user' and 'chef' roles can be created publicly.",
        400, req, res
      );
    }
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    newUser.save();
    SuccessHandler(res, "User created successfully", newUser, 201);
    if (role === "chef") {
      const admins = await User.find({ role: "admin" });
      Promise.all(
        admins.map(async (admin) => {
          await sendNotification(
            admin._id,
            "New chef",
            `${newUser.firstName} ${newUser.lastName} has been registered as a chef`,
            "newChef",
            {
              chefId: newUser._id,
            }
          );
        })
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//login
const login = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    console.log('🔍 Login function called');
    console.log('📧 Request body:', req.body);
    console.log('🔧 Response object type:', typeof res);
    console.log('🔧 Response object keys:', Object.keys(res));
    console.log('🔧 Response object methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(res)));
    
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log('❌ User not found');
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Invalid credentials');
      return ErrorHandler("Invalid credentials", 400, req, res);
    }

    const jwtToken = user.getJWTToken();
    console.log('✅ Login successful');
    return SuccessHandler(
      res,
      "Login successful",
      {
        token: jwtToken,
        user,
      },
      200
    );
  } catch (error) {
    console.log('❌ Error in login:', error);
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getProfile = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const user = await User.findById(req.user._id);
    console.log("user"+user)
    return SuccessHandler(res, "Profile retrieved successfully", user, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateProfile = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return ErrorHandler("User not found", 404, req, res);
    }

    // Update fields
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.email) user.email = req.body.email;
    if (req.body.profileImage) user.profileImage = req.body.profileImage;

    await user.save();
    return SuccessHandler(res, "Profile updated successfully", user, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Create staff account (admin only)
const createStaffAccount = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return ErrorHandler("Only admins can create staff accounts", 403, req, res);
    }

    const { firstName, lastName, email, password, role, kitchenNo } = req.body;
    
    // Validate role
    if (!["employee", "rider", "chef"].includes(role)) {
      return ErrorHandler("Invalid role. Only 'employee' and 'rider' roles can be created.", 400, req, res);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ErrorHandler("User already exists", 400, req, res);
    }

    // Create staff account
    const newStaff = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      kitchenNo: kitchenNo || "001",
    });

    await newStaff.save();

    // Send notification to other admins
    const otherAdmins = await User.find({ role: "admin", _id: { $ne: req.user._id } });
    Promise.all(
      otherAdmins.map(async (admin) => {
        await sendNotification(
          admin._id,
          `New ${role} registered`,
          `${newStaff.firstName} ${newStaff.lastName} has been registered as a ${role}`,
          "newStaff",
          {
            staffId: newStaff._id,
            role: newStaff.role,
          }
        );
      })
    );

    SuccessHandler(res, `Staff account created successfully`, null, 201);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Get all staff members (admin only)
const getAllStaff = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return ErrorHandler("Only admins can view staff accounts", 403, req, res);
    }

    const { page = 1, limit = 10, role, status, search } = req.query;
    
    const query = { role: { $in: ["employee", "rider", "chef"] } };
    
    if (role && ["employee", "rider"].includes(role)) {
      query.role = role;
    }
    
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    SuccessHandler(res, "Staff retrieved successfully", {
      staff,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    }, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Update staff account (admin only)
const updateStaffAccount = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return ErrorHandler("Only admins can update staff accounts", 403, req, res);
    }

    const { id } = req.params;
    const { firstName, lastName, email, role, status, kitchenNo } = req.body;

    // Validate role if provided
    if (role && !["employee", "rider"].includes(role)) {
      return ErrorHandler("Invalid role. Only 'employee' and 'rider' roles are allowed.", 400, req, res);
    }

    const staff = await User.findById(id);
    if (!staff) {
      return ErrorHandler("Staff member not found", 404, req, res);
    }

    // Check if staff member has admin role
    if (staff.role === "admin") {
      return ErrorHandler("Cannot modify admin accounts", 403, req, res);
    }

    // Update fields
    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    if (email) staff.email = email;
    if (role) staff.role = role;
    if (status) staff.status = status;
    if (kitchenNo) staff.kitchenNo = kitchenNo;

    await staff.save();

    SuccessHandler(res, "Staff account updated successfully", staff, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Delete staff account (admin only)
const deleteStaffAccount = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return ErrorHandler("Only admins can delete staff accounts", 403, req, res);
    }

    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) {
      return ErrorHandler("Staff member not found", 404, req, res);
    }

    // Check if staff member has admin role
    if (staff.role === "admin") {
      return ErrorHandler("Cannot delete admin accounts", 403, req, res);
    }

    await User.findByIdAndDelete(id);

    SuccessHandler(res, "Staff account deleted successfully", null, 200);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email } = req.body;
    
    if (!email) {
      return ErrorHandler("Email is required", 400, req, res);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User not found with this email", 404, req, res);
    }

    // Generate reset token (valid for 10 minutes)
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset URL - redirect to frontend instead of backend API
    const resetUrl = `https://kitchen-planner-fe.vercel.app/reset-password/${resetToken}`;
    
    // Send email with reset link using specialized password reset email function
    await sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
      resetUrl
    );

    SuccessHandler(res, "Password reset email sent successfully", {
      message: "Password reset email has been sent to your email address"
    }, 200);

  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Reset password
const resetPassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return ErrorHandler("New password is required", 400, req, res);
    }

    // Hash the token to compare with stored hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return ErrorHandler("Invalid or expired reset token", 400, req, res);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    SuccessHandler(res, "Password reset successful", null, 200);

  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// Change password (for logged-in users)
const changePassword = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return ErrorHandler("Current password and new password are required", 400, req, res);
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return ErrorHandler("User not found", 404, req, res);
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ErrorHandler("Current password is incorrect", 400, req, res);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    SuccessHandler(res, "Password changed successfully", null, 200);

  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  createStaffAccount,
  getAllStaff,
  updateStaffAccount,
  deleteStaffAccount,
  forgotPassword,
  resetPassword,
  changePassword,
};
