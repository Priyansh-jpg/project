const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const football = require('./dbconnect/db');
const football12 = require('./product/model');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


football();


app.get('/Data', async (req, res) => {
    try {
        const data = await football12.find({});
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/api/football/update/:team', async (req, res) => {
  try{
    const {name} = req.params;
    const UpdateTeam = await football12.findOneAndupdate({ Team: new RegExp(`^${name}$`, 'i') });
    if (!UpdateTeam) {
        return res.status(404).json({ message: 'Team not found. updation failed.' });
      }
 
      res.status(200).json({ message: `Team '${UpdateTeam.team}' updated successfully.` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.delete('/teams/delete/:name', async (req, res) => {
    try {
      const { name } = req.params; // Extract the name from the URL parameter
      const deletedTeam = await football12.findOneAndDelete({ Team: new RegExp(`^${name}$`, 'i') }); // Case-insensitive match
 
      if (!deletedTeam) {
        return res.status(404).json({ message: 'Team not found. Deletion failed.' });
      }
 
      res.status(200).json({ message: `Team '${deletedTeam.Team}' deleted successfully.` });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
 

  app.get('/api/football/stats', async (req, res) => {
    const { Year } = req.query;

    try {
        const stats = await football12.aggregate([
            { $match: { Year: Number(Year) } },
            {
                $group: {
                    _id: '',
                    GamesPlayed: { $sum: '$GamesPlayed' },
                    Win: { $sum: '$Win' },
                    Draw: { $sum: '$Draw' },
                },
            },
        ]);

        if (stats.length === 0) {
            return res.status(404).json({ message: `No stats found for year ${Year}` });
        }

        // Return the stats directly
        res.status(200).json({ message: 'Statistics fetched successfully', stats: stats[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});
app.get('/api/football/teams', async (req, res) => {
    const { Win } = req.query; // Extracting from query parameters

    try {
        if (!Win) {
            return res.status(400).json({ message: 'Win parameter is required' });
        }

        const teams = await football12.find({ Win: { $gt: Number(Win) } })
            .limit(10)
            .select('-__v'); 

        res.status(200).json({ message: 'Teams fetched successfully', data: teams });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
});


app.get('/api/football/averageGoals', async (req, res) => {
    const { Year } = req.query;

    try {
        if (!Year) {
            return res.status(400).json({ message: 'Year parameter is required' });
        }

        const teams = await football12.aggregate([
            // Match documents for the specified Year
            { $match: { Year: parseInt(Year) } },

            // Project only required fields and calculate averageGoalsFor
            {
                $project: {
                    Team: 1,
                    Year: 1,
                    GoalsFor: 1,
                    GamesPlayed: 1,
                    // Handle potential null, missing, or zero values
                    averageGoalsFor: {
                        $cond: {
                            if: { $eq: ["$GamesPlayed", 0] }, // Avoid division by zero
                            then: 0,
                            else: {
                                $divide: [
                                    { $ifNull: [{ $toDouble: "$GoalsFor" }, 0] }, // Default GoalsFor to 0 if null or missing
                                    { $ifNull: [{ $toDouble: "$GamesPlayed" }, 1] }, // Default GamesPlayed to 1 if null or missing
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        if (!teams.length) {
            return res.status(404).json({ message: `No teams found for the year ${Year}` });
        }

        res.status(200).json({ message: 'Average goals calculated successfully', data: teams });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating average goals', error: error.message });
    }
});




// Add new team data
app.post('/addteamdata', async (req, res) => {
    try {
        const add = req.body;

        // Validate that all fields are present
        if (
            !add.Team ||
            !add.GamesPlayed ||
            !add.Win ||
            !add.Draw ||
            !add.Loss ||
            !add.GoalsFor ||
            !add.GoalsAgainst ||
            !add.Points ||
            !add.Year
        ) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newTeam = new football12(add);

        const savedTeam = await newTeam.save();

        res.status(201).json(savedTeam);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Server listener
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
