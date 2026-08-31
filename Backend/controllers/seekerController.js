const express = require('express');
const router = express.Router();

// ==========================================
// MOCK DATABASES 
// (Replace with MongoDB/MySQL when you connect a real database)
// ==========================================
let registeredSeekers = [];
let seekerProfiles = [];

// ==========================================
// REGISTER ENDPOINT
// POST: /api/seeker/register
// ==========================================
router.post('/register', (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = registeredSeekers.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        const newUser = { id: Date.now(), fullName, email, password };
        registeredSeekers.push(newUser);
        
        console.log('New Seeker Registered:', newUser.email);

        return res.status(200).json({
            success: true,
            message: 'Registration successful!',
            user: newUser
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ==========================================
// LOGIN ENDPOINT
// POST: /api/seeker/login
// ==========================================
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = registeredSeekers.find(u => u.email === email && u.password === password);
        
        if (user) {
            return res.status(200).json({ success: true, message: 'Login successful!', user });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ==========================================
// COMPLETE PROFILE ENDPOINT
// POST: /api/seeker/complete-profile
// ==========================================
router.post('/complete-profile', (req, res) => {
    try {
        const { fullName, email, phone, university, degree, skills, bio } = req.body;

        if (!fullName || !email || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Full Name, Email, and Phone are required fields.' 
            });
        }

        // Check if profile already exists and update it, otherwise create new
        const existingProfileIndex = seekerProfiles.findIndex(p => p.email === email);
        
        const profileData = {
            id: existingProfileIndex !== -1 ? seekerProfiles[existingProfileIndex].id : Date.now(),
            fullName,
            email,
            phone,
            university,
            degree,
            skills,
            bio,
            updatedAt: new Date()
        };

        if (existingProfileIndex !== -1) {
            seekerProfiles[existingProfileIndex] = profileData; // Update existing
            console.log('Seeker Profile Updated:', profileData.email);
        } else {
            seekerProfiles.push(profileData); // Add new
            console.log('New Seeker Profile Saved:', profileData.email);
        }

        return res.status(200).json({
            success: true,
            message: 'Profile saved successfully!',
            profile: profileData
        });

    } catch (error) {
        console.error('Error saving profile:', error);
        return res.status(500).json({ success: false, message: 'Server error while saving profile.' });
    }
});

// ==========================================
// GET PROFILE ENDPOINT
// GET: /api/seeker/profile/:email
// ==========================================
router.get('/profile/:email', (req, res) => {
    try {
        const email = req.params.email;
        const profile = seekerProfiles.find(p => p.email === email);

        if (profile) {
            return res.status(200).json({ success: true, profile });
        } else {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
});

module.exports = router;