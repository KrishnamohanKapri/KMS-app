// const getProfile = async (req, res) => {
//   // #swagger.tags = ['auth']
//   console.log("🔍 getProfile function called");
//   console.log("👤 Request user:", req.user);
//   console.log("🔑 User ID:", req.user?._id);
  
//   try {
//     const user = await User.findById(req.user._id);
//     console.log("✅ User found:", user);
//     return SuccessHandler(user, 200, res);
//   } catch (error) {
//     console.error("❌ Error in getProfile:", error);
//     return ErrorHandler(error.message, 500, req, res);
//   }
// }; 