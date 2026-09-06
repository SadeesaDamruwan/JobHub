const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Seeker = require('../models/Seeker');
const SeekerProfile = require('../models/SeekerProfile');
const Job = require('../models/Job');

const formatSeeker = (user) => {
    if (!user) return null;
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    delete obj.password;
    return obj;
};

const formatProfile = (profile) => {
    if (!profile) return null;
    const obj = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    return obj;
};

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();

        const existingUser = await Seeker.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An existing user already registered with this email. Please sign in or use another email.'
            });
        }

        const newUser = await Seeker.create({
            fullName: cleanName,
            email: cleanEmail,
            password: password
        });

        const existingProfile = await SeekerProfile.findOne({ email: cleanEmail });
        if (!existingProfile) {
            await SeekerProfile.create({
                seekerId: newUser._id,
                fullName: cleanName,
                email: cleanEmail
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Registration successful!',
            user: formatSeeker(newUser)
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await Seeker.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: formatSeeker(user)
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await Seeker.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No job seeker account found with this email address.' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during password reset.' });
    }
});

router.post('/complete-profile', async (req, res) => {
    try {
        const { fullName, jobTitle, email, phone, location, bio, skills, resumeFileName, resumeData, avatar } = req.body;

        if (!fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Full Name, Email, and Phone are required fields.'
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();

        let profile = await SeekerProfile.findOne({ email: cleanEmail });

        if (profile) {
            profile.fullName = cleanName;
            profile.jobTitle = (jobTitle || '').trim();
            profile.phone = (phone || '').trim();
            profile.location = (location || '').trim();
            profile.bio = (bio || '').trim();
            profile.skills = (skills || '').trim();
            if (avatar !== undefined) profile.avatar = avatar;
            if (resumeFileName !== undefined) profile.resumeFileName = resumeFileName;
            if (resumeData !== undefined && resumeData !== '') profile.resumeData = resumeData;
            await profile.save();
        } else {
            const seekerUser = await Seeker.findOne({ email: cleanEmail });
            profile = await SeekerProfile.create({
                seekerId: seekerUser ? seekerUser._id : undefined,
                fullName: cleanName,
                jobTitle: (jobTitle || '').trim(),
                email: cleanEmail,
                phone: (phone || '').trim(),
                location: (location || '').trim(),
                bio: (bio || '').trim(),
                skills: (skills || '').trim(),
                avatar: avatar || '',
                resumeFileName: resumeFileName || '',
                resumeData: resumeData || ''
            });
        }

        await Seeker.updateOne({ email: cleanEmail }, { fullName: cleanName });

        return res.status(200).json({
            success: true,
            message: 'Profile saved successfully!',
            profile: formatProfile(profile)
        });
    } catch (error) {
        console.error('Error saving profile:', error);
        return res.status(500).json({ success: false, message: 'Server error while saving profile.' });
    }
});

router.get('/profile/:email', async (req, res) => {
    try {
        const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
        const profile = await SeekerProfile.findOne({ email: cleanEmail });

        if (profile) {
            return res.status(200).json({ success: true, profile: formatProfile(profile) });
        }

        const user = await Seeker.findOne({ email: cleanEmail });
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
                    skills: '',
                    resumeFileName: '',
                    resumeData: ''
                }
            });
        }

        return res.status(404).json({ success: false, message: 'Profile not found.' });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
});

router.get('/saved-jobs/:email', async (req, res) => {
    try {
        const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
        const profile = await SeekerProfile.findOne({ email: cleanEmail }).select('savedJobs');
        return res.status(200).json({
            success: true,
            savedJobIds: profile?.savedJobs || []
        });
    } catch (error) {
        console.error('Error fetching saved jobs:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching saved jobs.' });
    }
});

router.post('/saved-jobs', async (req, res) => {
    try {
        const { email, jobId } = req.body;
        if (!email || !jobId) {
            return res.status(400).json({ success: false, message: 'Email and Job ID are required.' });
        }
        const cleanEmail = email.trim().toLowerCase();
        let profile = await SeekerProfile.findOne({ email: cleanEmail });
        if (!profile) {
            profile = await SeekerProfile.create({ email: cleanEmail, fullName: 'Job Seeker', savedJobs: [jobId] });
        } else {
            if (!profile.savedJobs.includes(jobId)) {
                profile.savedJobs.push(jobId);
                await profile.save();
            }
        }
        return res.status(200).json({ success: true, savedJobIds: profile.savedJobs });
    } catch (error) {
        console.error('Error saving job:', error);
        return res.status(500).json({ success: false, message: 'Server error saving job.' });
    }
});

router.delete('/saved-jobs/:email/:jobId', async (req, res) => {
    try {
        const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
        const jobId = req.params.jobId;
        const profile = await SeekerProfile.findOne({ email: cleanEmail });
        if (profile) {
            profile.savedJobs = profile.savedJobs.filter((id) => String(id) !== String(jobId));
            await profile.save();
        }
        return res.status(200).json({
            success: true,
            savedJobIds: profile?.savedJobs || []
        });
    } catch (error) {
        console.error('Error removing saved job:', error);
        return res.status(500).json({ success: false, message: 'Server error removing saved job.' });
    }
});

router.get('/saved-jobs-details/:email', async (req, res) => {
    try {
        const cleanEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
        const profile = await SeekerProfile.findOne({ email: cleanEmail }).select('savedJobs');
        const savedIds = profile?.savedJobs || [];
        if (savedIds.length === 0) {
            return res.status(200).json({ success: true, savedJobIds: [], jobs: [] });
        }

        const objectIds = savedIds.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
        const legacyIds = savedIds.map(id => Number(id)).filter(id => !isNaN(id));

        const rawJobs = await Job.find({
            $or: [
                { _id: { $in: objectIds } },
                { legacyId: { $in: legacyIds } }
            ]
        }).sort({ postedAt: -1 }).lean();

        const jobs = rawJobs.map((j) => {
            j.id = j.legacyId || j._id.toString();
            return j;
        });

        return res.status(200).json({
            success: true,
            savedJobIds: savedIds,
            jobs
        });
    } catch (error) {
        console.error('Error fetching saved jobs details:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching saved jobs details.' });
    }
});

module.exports = router;