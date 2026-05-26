const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, surname, address, phone, email } = req.body;

        const user = new User({
            username,
            password,
            name,
            surname,
            address,
            addresses: address ? [address] : [],
            phone,
            email
        });

        await user.save();
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
    } catch (err) {
        console.error('Register error:', err);
        let errorMessage = 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        if (err.code === 11000) {
            if (err.keyValue) {
                const field = Object.keys(err.keyValue)[0];
                errorMessage = field === 'username' ? 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' : 'อีเมลนี้ถูกใช้งานแล้ว';
            } else {
                errorMessage = 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว';
            }
        } else {
            errorMessage = err.message || 'Internal Server Error';
        }
        res.status(400).json({ error: errorMessage });
    }
});



router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;



        const user = await User.findOne({ username });

        if (!user) return res.status(401).json({ error: 'ชื่อผู้ใช้ไม่ถูกต้อง' });


        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

module.exports = router;