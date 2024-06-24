const mongoose = require('mongoose');
const User = require('./userModel');

mongoose.connect('mongodb://mongo:27017/teamer', {
// mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@mongo:27017/teamer?authSource=admin`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log();
});

// Schema for to-do items
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  tag: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Model for to-do items
const todo = mongoose.model('todo', todoSchema);

// Function to authenticate user during login
async function authenticateUser(username, password) {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return null;
    }
    if (password === user.password) {
      console.log('Authentication successful');
      return user;
    } else {
      console.log('Incorrect password');
      return null;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
}

// Signup
async function saveUser(username, email, password) {
  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

module.exports = { User, todo, authenticateUser, saveUser };
