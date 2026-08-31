const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/storage');

function getCompanyData() {
    return readData('companies', {
        companies: [
            {
                id: 1,
                companyName: 'Technova Solutions',
                email: 'contact@technovasolutions.lk',
                password: 'password123',
                website: 'https://technovasolutions.lk',
                location: 'Anuradhapura, Sri Lanka',
                industry: 'Information Technology',
                description: 'We specialize in custom web and mobile software development services, bringing innovative ideas to life.'
            }
        ],
        settings: {
            emailNotifications: true,
            twoFactorAuth: false,
            privacyMode: 'Public',
            theme: 'Light'
        }
    });
}

function saveCompanyData(data) {
    return writeData('companies', data);
}

// ==========================================
// GET & UPDATE PROFILE (Edit Company Profile)
// GET/PUT: /api/company-details/profile
// ==========================================
router.get('/profile', (req, res) => {
    try {
        const data = getCompanyData();
        const { email, companyName } = req.query;

        let company = null;
        if (email) {
            company = data.companies.find(c => c.email.toLowerCase() === email.toLowerCase());
        } else if (companyName) {
            company = data.companies.find(c => c.companyName.toLowerCase() === companyName.toLowerCase());
        }

        if (!company && data.companies.length > 0) {
            company = data.companies[0];
        }

        return res.status(200).json({ 
            success: true, 
            profile: company || {
                companyName: 'Technova Solutions',
                email: 'contact@technovasolutions.lk',
                website: 'https://technovasolutions.lk',
                location: 'Colombo 03, Sri Lanka',
                industry: 'Information Technology',
                description: 'We are a leading tech company specializing in web development, mobile apps, and enterprise solutions.'
            } 
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
});

router.put('/profile', (req, res) => {
    try {
        const data = getCompanyData();
        const { companyName, email, website, location, industry, description } = req.body;

        let index = -1;
        if (email) {
            index = data.companies.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
        } else if (companyName) {
            index = data.companies.findIndex(c => c.companyName.toLowerCase() === companyName.toLowerCase());
        }

        if (email) {
            const cleanEmail = email.trim().toLowerCase();
            const conflict = data.companies.find((c, i) => c.email && c.email.toLowerCase() === cleanEmail && index !== -1 && i !== index);
            if (conflict) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'An existing user already registered with this company email. Please sign in or use another email.' 
                });
            }
        }

        const updatedProfile = {
            id: index !== -1 ? data.companies[index].id : Date.now(),
            companyName: companyName || (index !== -1 ? data.companies[index].companyName : 'Technova Solutions'),
            email: email || (index !== -1 ? data.companies[index].email : 'contact@technovasolutions.lk'),
            website: website !== undefined ? website : (index !== -1 ? data.companies[index].website : ''),
            location: location !== undefined ? location : (index !== -1 ? data.companies[index].location : ''),
            industry: industry || (index !== -1 ? data.companies[index].industry : 'Information Technology'),
            description: description !== undefined ? description : (index !== -1 ? data.companies[index].description : '')
        };

        if (index !== -1) {
            data.companies[index] = { ...data.companies[index], ...updatedProfile };
        } else {
            data.companies.push(updatedProfile);
        }

        saveCompanyData(data);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully', 
            profile: updatedProfile 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
});

// ==========================================
// GET & UPDATE SETTINGS
// GET/PUT: /api/company-details/settings
// ==========================================
router.get('/settings', (req, res) => {
    try {
        const data = getCompanyData();
        return res.status(200).json({ success: true, settings: data.settings || {} });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching settings.' });
    }
});

router.put('/settings', (req, res) => {
    try {
        const data = getCompanyData();
        data.settings = { ...data.settings, ...req.body };
        saveCompanyData(data);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Settings saved successfully', 
            settings: data.settings 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ success: false, message: 'Server error updating settings.' });
    }
});

module.exports = router;