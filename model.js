const mongoose = require('mongoose');

const footballSchema = new mongoose.Schema({
    Team: {
        type: String,
        required: true
    },
    GamesPlayed: {
        type: Number,
        required: true
    },
    Win: {
        type: Number,
        required: true
    },
    Draw: {
        type: Number,
        required: true
    },
    Loss: {
        type: Number,
        required: true
    },
    GoalsFor: {
        type: Number,
        required: true
    },
    GoalsAgainst: {
        type: Number,
        required: true
    },
    Points: {
        type: Number,
        required: true
    },
    Year: {
        type: Number,
        required: true
    }
});

const football12 = mongoose.model('football2005', footballSchema);

module.exports = football12;
