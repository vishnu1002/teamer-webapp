const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { authenticateUser, User, todo, saveUser } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/teamer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware to check if user is authenticated
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/dashboard', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));

// Login route handler
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authenticateUser(username, password);
    if (user) {
      req.session.user = user;
      console.log(`${user.username} logged in`);
      res.redirect('/dashboard');
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send('Error authenticating user. Please try again.');
  }
});

// Signup route handler
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await saveUser(username, email, password);
    console.log(`${username} account created`);
    const user = await authenticateUser(username, password);
    if (user) {
      req.session.user = user;
      console.log(`${username} logged in`);
      res.redirect('/dashboard');
    } else {
      res.redirect('/signup?error=1');
    }
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).send('Error signing up user. Please try again.');
  }
});

// Add todo route handler
app.post('/addTodo', requireLogin, async (req, res) => {
  const { title, description, dueDate, tag } = req.body;
  const user = req.session.user;
  try {
    const newTodo = new todo({ title, description, dueDate, tag, user: user._id });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating to-do item:', error);
    res.status(500).send('Error creating to-do item. Please try again.');
  }
});

// Delete todo route handler
app.delete('/deleteTodo/:id', requireLogin, async (req, res) => {
  const todoId = req.params.id;
  try {
    await todo.findByIdAndDelete(todoId);
    res.status(200).send('To-do item deleted successfully.');
  } catch (error) {
    console.error('Error deleting to-do item:', error);
    res.status(500).send('Error deleting to-do item. Please try again.');
  }
});

// Get all todo items route handler
app.get('/todo', requireLogin, async (req, res) => {
  const user = req.session.user;
  try {
    const todoItems = await todo.find({ user: user._id });
    res.json(todoItems);
  } catch (error) {
    console.error('Error fetching to-do items:', error);
    res.status(500).send('Error fetching to-do items. Please try again.');
  }
});

// Start the server
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
