const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    zoneId: String,
    wardNo: String,
    vehicleNo: String,
    shared: { type: Boolean, default: false } // Track sharing status
});

module.exports = mongoose.model('User', userSchema);

