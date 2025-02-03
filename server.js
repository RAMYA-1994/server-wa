const dotenv=require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { LoginCred } = require('./login');
const { RegisterCred } = require('./register');
const { ActiveUsers } = require('./dashboard');
const { ActiveUserDetails } = require('./activeUser');
const { FetchAPIdata } = require('./weatherAPI');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ **Fix 1: MongoDB Connection**
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weatherapp';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1); // Exit if MongoDB fails to connect
  });

// ✅ **Fix 2: Add Error Handling in API Endpoints**
app.post('/loginCredentials', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    const result = await LoginCred(Username, Password);
    res.send(result === 1 ? 'successful' : 'unsuccessful');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/registerCredentials', async (req, res) => {
  try {
    const { Username, Password, Name, City } = req.body;
    const result = await RegisterCred(Username, Password, Name, City);

    if (result === 1) res.send('exists');
    else if (result === 2) res.send('created');
    else res.send('unsuccessful');
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/loadDashboard', async (req, res) => {
  try {
    const result = await ActiveUserDetails();
    const WeatherData = await FetchAPIdata(result.City);

    // ✅ **Fix 3: Properly Declare `finData`**
    const finData = { result, WeatherData };

    console.log('📌 Sending this data to frontend:', finData);
    res.send(finData);
  } catch (error) {
    console.error('Dashboard Load Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/activeUsers', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    const result = await ActiveUsers(Username, Password);

    res.send(result === 1 ? 'added' : 'not added');
  } catch (error) {
    console.error('Active Users Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ **Fix 4: Add Server Start Confirmation Message**
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
