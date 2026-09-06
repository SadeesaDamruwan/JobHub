const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

const formatCompany = (comp) => {
    if (!comp) return null;
    const obj = typeof comp.toObject === 'function' ? comp.toObject() : { ...comp };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    delete obj.password;
    return obj;
};

router.post('/register', async (req, res) => {
    try {
        const { companyName, email, password, logo } = req.body;

        if (!companyName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = companyName.trim();

        const existingCompanyByEmail = await Company.findOne({ email: cleanEmail });
        if (existingCompanyByEmail) {
            return res.status(400).json({
                success: false,
                message: 'An existing user already registered with this company email. Please sign in or use another email.'
            });
        }

        const existingCompanyByName = await Company.findOne({
            companyName: new RegExp(`^${cleanName}$`, 'i')
        });
        if (existingCompanyByName) {
            return res.status(400).json({
                success: false,
                message: 'A company with this name is already registered.'
            });
        }

        const newCompany = await Company.create({
            companyName: cleanName,
            email: cleanEmail,
            password: password,
            website: '',
            location: '',
            industry: 'Information Technology',
            description: '',
            logo: logo || ''
        });

        return res.status(200).json({
            success: true,
            message: 'Company registration successful!',
            company: formatCompany(newCompany)
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
        const company = await Company.findOne({ email: cleanEmail });

        if (!company) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await company.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            company: formatCompany(company)
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
            return res.status(400).json({ success: false, message: 'Company email and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const company = await Company.findOne({ email: cleanEmail });

        if (!company) {
            return res.status(404).json({ success: false, message: 'No employer account found with this company email address.' });
        }

        company.password = newPassword;
        await company.save();

        return res.status(200).json({
            success: true,
            message: 'Company password reset successful! You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Company Forgot Password Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during password reset.' });
    }
});

module.exports = router;