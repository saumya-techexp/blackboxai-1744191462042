const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
mongoose.set('strictQuery', false);

const app = express();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grihutpaad';

async function connectDB() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'grihutpaad-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const householderRouter = require('./routes/householder');
const consumerRouter = require('./routes/consumer');

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/householder', householderRouter);
app.use('/consumer', consumerRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server on first available port
async function startServer() {
  await connectDB();
  
  const PORT = process.env.PORT || 3001;
  const MAX_PORT_ATTEMPTS = 10;
  
  for (let i = 0; i < MAX_PORT_ATTEMPTS; i++) {
    const currentPort = PORT + i;
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(currentPort, () => {
          console.log(`🚀 Server running on port ${currentPort}`);
          resolve();
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${currentPort} in use, trying next port...`);
            reject(err);
          } else {
            console.error('Server error:', err);
            process.exit(1);
          }
        });
      });
      break; // Successfully started server
    } catch (err) {
      if (i === MAX_PORT_ATTEMPTS - 1) {
        console.error('❌ Could not find available port');
        process.exit(1);
      }
    }
  }
}

startServer();
