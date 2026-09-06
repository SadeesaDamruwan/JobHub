const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

const formatProfile = (comp) => {
    if (!comp) return null;
    const obj = typeof comp.toObject === 'function' ? comp.toObject() : { ...comp };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    delete obj.password;
    return obj;
};

router.get('/profile', async (req, res) => {
    try {
        const { email, companyName } = req.query;
        let company = null;

        if (email && email.trim()) {
            company = await Company.findOne({ email: email.trim().toLowerCase() });
        } else if (companyName && companyName.trim()) {
            company = await Company.findOne({
                companyName: new RegExp(`^${companyName.trim()}$`, 'i')
            });
        }

        if (!company) {
            return res.status(200).json({
                success: true,
                profile: {
                    companyName: '',
                    email: '',
                    website: '',
                    location: '',
                    industry: 'Information Technology',
                    description: ''
                }
            });
        }

        return res.status(200).json({
            success: true,
            profile: formatProfile(company)
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
});

router.put('/profile', async (req, res) => {
    try {
        const { companyName, email, website, location, industry, description, logo } = req.body;

        if (!email && !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company email or company name is required.'
            });
        }

        let company = null;
        if (email && email.trim()) {
            company = await Company.findOne({ email: email.trim().toLowerCase() });
        } else if (companyName && companyName.trim()) {
            company = await Company.findOne({
                companyName: new RegExp(`^${companyName.trim()}$`, 'i')
            });
        }

        if (email) {
            const cleanEmail = email.trim().toLowerCase();
            const conflict = await Company.findOne({
                email: cleanEmail,
                _id: company ? { $ne: company._id } : { $exists: true }
            });
            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: 'An existing user already registered with this company email. Please sign in or use another email.'
                });
            }
        }

        if (!company) {
            if (!companyName || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Company name and email are required to create a company profile.'
                });
            }
            company = await Company.create({
                companyName: companyName.trim(),
                email: email.trim().toLowerCase(),
                password: 'password123',
                website: website || '',
                location: location || '',
                industry: industry || 'Information Technology',
                description: description || '',
                logo: logo || ''
            });
        } else {
            if (companyName !== undefined) company.companyName = companyName;
            if (email !== undefined) company.email = email.trim().toLowerCase();
            if (website !== undefined) company.website = website;
            if (location !== undefined) company.location = location;
            if (industry !== undefined) company.industry = industry;
            if (description !== undefined) company.description = description;
            if (logo !== undefined) company.logo = logo;
            await company.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: formatProfile(company)
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
});

router.get('/settings', async (req, res) => {
    try {
        const { email, companyName } = req.query;
        let company = null;

        if (email && email.trim()) {
            company = await Company.findOne({ email: email.trim().toLowerCase() });
        } else if (companyName && companyName.trim()) {
            company = await Company.findOne({
                companyName: new RegExp(`^${companyName.trim()}$`, 'i')
            });
        }

        if (!company) {
            company = await Company.findOne().sort({ createdAt: -1 });
        }

        const settings = company?.settings || {
            emailNotifications: true,
            twoFactorAuth: false,
            privacyMode: 'Public',
            theme: 'Light'
        };

        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching settings.' });
    }
});

router.put('/settings', async (req, res) => {
    try {
        const { email, companyName, ...settingsData } = req.body;
        let company = null;

        if (email && email.trim()) {
            company = await Company.findOne({ email: email.trim().toLowerCase() });
        } else if (companyName && companyName.trim()) {
            company = await Company.findOne({
                companyName: new RegExp(`^${companyName.trim()}$`, 'i')
            });
        }

        if (!company) {
            company = await Company.findOne().sort({ createdAt: -1 });
        }

        if (company) {
            company.settings = { ...company.settings, ...settingsData };
            await company.save();
            return res.status(200).json({
                success: true,
                message: 'Settings saved successfully',
                settings: company.settings
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Settings saved successfully',
            settings: settingsData
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Server error updating settings.' });
    }
});

module.exports = router;