const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/bakery_store');
        const users = await User.find({ $or: [{ username: 'cat' }, { email: 'pobpapat@gmail.com' }] });
        console.log('Found users:', users.map(u => ({ username: u.username, email: u.email })));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
