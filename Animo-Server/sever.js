const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user.model.js');
const bcrypt = require('bcrypt');
const UserPreference = require('./models/UserPreference.model.js'); // Adjust path as needed
const jwt = require('jsonwebtoken');
require('dotenv').config();
const generateToken = require('./utils/generateToken'); 
const AnimeList = require('./models/AnimeList.model.js');



const app = express();
const port = 3000;
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());


const protect = async (req, res, next) => {
  let token;

  if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
  ) {
      try {
          // Get token from header
          token = req.headers.authorization.split(' ')[1];

          // Verify token
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret

          // Get user from the token
          req.user = await User.findById(decoded.id).select('-password');

          next();
      } catch (error) {
          console.error(error);
          res.status(401).json({ message: 'Not authorized, token failed' });
      }
  }

  if (!token) {
      res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Gemini API setup
const apiKey = "AIzaSyB7whIOIHnGdzcDwWuVUfDXZ9thWWYVTAo";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });



const dbURI =  'mongodb+srv://mouhamedaminkraiem09:admin@cluster0.n9oaq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your MongoDB URI
mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
// Store chat history
const chatHistories = {};

// Function to generate a character response with history
async function generateCharacterResponse(chatId, characterName, biography, userMessage) {
  // Start fresh chat history for a new character or reset it if switching
  if (!chatHistories[chatId]) {
    chatHistories[chatId] = [];
    chatHistories[chatId].push(
      `You are ${characterName}, a character from this biography: "${biography}". Respond in character,you r anime character, starting the communication directly without referencing yourself as an AI. If the user engages in +18 content with a female character, you may switch to +18 content mode., when talking , if the character what to think in her mind put it between () if she make a move put it between [].`
    );
  }

  // Add the user's message to the history
  chatHistories[chatId].push(`User: ${userMessage}`);

  // Construct the prompt by joining the entire conversation
  const prompt = chatHistories[chatId].join('\n');

  try {
    const result = await model.generateContent(prompt);
    const characterResponse = result.response.text();

    // Add the AI's response to the history
    chatHistories[chatId].push(`AI (${characterName}): ${characterResponse}`);

    return characterResponse;
  } catch (error) {
    console.error("Error generating character response:", error.message);
    throw new Error("Failed to generate response");
  }
}

// API endpoint to handle character chat
app.post('/character-chat', async (req, res) => {
  const { chatId, characterName, biography, userMessage } = req.body;

  if (!chatId || !characterName || !biography || !userMessage) {
    return res.status(400).json({ error: 'Chat ID, character name, biography, and user message are required' });
  }

  try {
    // Ensure chat starts fresh for a new character
    if (!chatHistories[chatId] || chatHistories[chatId][0]?.includes(characterName) === false) {
      chatHistories[chatId] = null; // Clear the previous chat history for this chat ID
    }

    const characterResponse = await generateCharacterResponse(chatId, characterName, biography, userMessage);
    res.json({ response: characterResponse });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});




// Existing /register route...
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the email or username is already taken
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.email);

    res.status(201).json({
      message: 'User registered successfully',
      token, // Send the token
      user: { 
        _id: newUser._id, 
        username: newUser.username, 
        email: newUser.email 
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// server.js

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if all required fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    // Return token and user data
    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username, // Changed from name to username
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "An error occurred during login. Please try again." });
  }
});



app.post('/save-preferences', async (req, res) => {
  const { userId, selectedGenres, favoriteAnimes, recommendedFeatures } = req.body;

  // Validate required fields
  if (!userId || !selectedGenres || !favoriteAnimes) {
    return res.status(400).json({ error: 'User ID, genres, and favorite animes are required' });
  }

  try {
    // Check if preferences already exist for the user
    let userPreference = await UserPreference.findOne({ userId });

    if (userPreference) {
      // Update existing preferences
      userPreference.selectedGenres = selectedGenres;
      userPreference.favoriteAnimes = favoriteAnimes;
      userPreference.recommendedFeatures = recommendedFeatures || [];
    } else {
      // Create new preferences
      userPreference = new UserPreference({
        userId,
        selectedGenres,
        favoriteAnimes,
        recommendedFeatures: recommendedFeatures || [],
      });
    }

    // Save the preferences
    const savedPreference = await userPreference.save();
    res.status(200).json({ message: 'Preferences saved successfully', preferences: savedPreference });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.put('/avatar', protect, async (req, res) => {
  try {
      const { userId, avatar } = req.body; // Destructure userId and avatar from request body

      if (!userId || !avatar) {
          return res.status(400).json({ message: 'userId and avatar are required.' });
      }

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update avatar
      user.avatar = avatar;
      const updatedUser = await user.save();

      res.json({
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          createdAt: updatedUser.createdAt,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/data', protect, async (req, res) => {
  try {
    const userId = req.query.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with all user data, including country and birthDate
    res.json({
      userData: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
        birthDate: user.birthDate, 
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new endpoint for updating user profile
app.put('/update-profile', protect, async (req, res) => {
  try {
   
    const { userId, username,birthDate, country } = req.body; // Destructure request body

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    

    // Update user fields (only if they are provided in the request body)
    if (username) user.username = username;
    if (birthDate) user.birthDate = birthDate;
    if (country) user.country = country;
    

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        country: updatedUser.country,
        birthDate: updatedUser.birthDate,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/list', protect, async (req, res) => {
  const { userId, animeId, status } = req.body;

  // Validate input
  if (!userId || !animeId || !status) {
    return res.status(400).json({ error: 'userId, animeId, and status are required.' });
  }

  try {
    // Check if the anime already exists in the user's list
    const existingAnime = await AnimeList.findOne({ userId, animeId });

    if (existingAnime) {
      // Update the status if the anime exists
      existingAnime.status = status;
      await existingAnime.save();
      return res.status(200).json({ message: 'Anime list updated successfully.', anime: existingAnime });
    }

    // Create a new entry if it doesn't exist
    const newAnime = new AnimeList({ userId, animeId, status });
    await newAnime.save();

    res.status(201).json({ message: 'Anime added to the list successfully.', anime: newAnime });
  } catch (error) {
    console.error('Error saving anime list:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/list/:userId', protect, async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch all anime entries for the user
    const animeList = await AnimeList.find({ userId });
    res.status(200).json({ animeList });
  } catch (error) {
    console.error('Error retrieving anime list:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


