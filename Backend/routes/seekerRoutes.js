const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/storage');

function getSeekerData() {
    return readData('seekers', { users: [], profiles: [] });
}

function saveSeekerData(data) {
    return writeData('seekers', data);
}

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

        const data = getSeekerData();
        const cleanEmail = email.trim().toLowerCase();
        const existingUser = data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'An existing user already registered with this email. Please sign in or use another email.' 
            });
        }

        const newUser = { id: Date.now(), fullName: fullName.trim(), email: cleanEmail, password };
        data.users.push(newUser);
        saveSeekerData(data);

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

        const data = getSeekerData();
        const cleanEmail = email.trim().toLowerCase();
        const user = data.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
        
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
// FORGOT PASSWORD ENDPOINT
// POST: /api/seeker/forgot-password
// ==========================================
router.post('/forgot-password', (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const data = getSeekerData();
        const cleanEmail = email.trim().toLowerCase();
        const user = data.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

        if (!user) {
            return res.status(404).json({ success: false, message: 'No job seeker account found with this email address.' });
        }

        user.password = newPassword;
        saveSeekerData(data);

        return res.status(200).json({ 
            success: true, 
            message: 'Password reset successful! You can now log in with your new password.' 
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during password reset.' });
    }
});

// ==========================================
// COMPLETE PROFILE ENDPOINT (Updates or Creates)
// POST: /api/seeker/complete-profile
// ==========================================
router.post('/complete-profile', (req, res) => {
    try {
        const { fullName, jobTitle, email, phone, location, bio, skills, resumeFileName, resumeData } = req.body;

        if (!fullName || !email || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Full Name, Email, and Phone are required fields.' 
            });
        }

        const data = getSeekerData();
        const cleanEmail = email.trim().toLowerCase();
        const existingProfileIndex = data.profiles.findIndex(p => p.email.toLowerCase() === cleanEmail);
        
        const profileData = {
            id: existingProfileIndex !== -1 ? data.profiles[existingProfileIndex].id : Date.now(),
            fullName: fullName.trim(),
            jobTitle: (jobTitle || '').trim(),
            email: cleanEmail,
            phone: (phone || '').trim(),
            location: (location || '').trim(),
            bio: (bio || '').trim(),
            skills: (skills || '').trim(),
            resumeFileName: resumeFileName || (existingProfileIndex !== -1 ? data.profiles[existingProfileIndex].resumeFileName : '') || '',
            resumeData: resumeData || (existingProfileIndex !== -1 ? data.profiles[existingProfileIndex].resumeData : '') || '',
            updatedAt: new Date().toISOString()
        };

        if (existingProfileIndex !== -1) {
            data.profiles[existingProfileIndex] = profileData; 
        } else {
            data.profiles.push(profileData); 
        }

        const userIndex = data.users.findIndex(u => u.email.toLowerCase() === cleanEmail);
        if (userIndex !== -1) {
            data.users[userIndex].fullName = fullName.trim();
        }

        saveSeekerData(data);

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
// GET PROFILE ENDPOINT (Powers the Dashboard View)
// GET: /api/seeker/profile/:email
// ==========================================
router.get('/profile/:email', (req, res) => {
    try {
        const cleanEmail = (req.params.email || '').trim().toLowerCase();
        const data = getSeekerData();
        const profile = data.profiles.find(p => p.email.toLowerCase() === cleanEmail);

        if (profile) {
            return res.status(200).json({ success: true, profile });
        } else {
            const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
            if (user) {
                return res.status(200).json({
                    success: true,
                    profile: {
                        fullName: user.fullName,
                        email: user.email,
                        jobTitle: '',
                        phone: '',
                        location: '',
                        bio: '',
                        skills: ''
                    }
                });
            }
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
});

module.exports = router;