const mongoose = require("mongoose");
const PASSWORD_MONGODB = process.env.PASSWORD_MONGODB
const URI = `mongodb+srv://taptap-totp:${PASSWORD_MONGODB}@cluster0.owcqs.mongodb.net/servicesManagementDatabase?retryWrites=true&w=majority`;

module.exports = connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connecting to DB successfully");
  } catch (e) {
    console.log("ERROR", e);
  }
};
