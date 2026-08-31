const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/storage');

function getCompanyData() {
    return readData('companies', { companies: [], settings: {} });
}

function saveCompanyData(data) {
    return writeData('companies', data);
}

// ==========================================
// EMPLOYER REGISTER
// POST: /api/company/register
// ==========================================
router.post('/register', (req, res) => {
    try {
        const { companyName, email, password } = req.body;

        if (!companyName || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const data = getCompanyData();
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = companyName.trim().toLowerCase();
        const existingCompanyByEmail = data.companies.find(c => c.email && c.email.toLowerCase() === cleanEmail);
        if (existingCompanyByEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'An existing user already registered with this company email. Please sign in or use another email.' 
            });
        }

        const existingCompanyByName = data.companies.find(c => c.companyName && c.companyName.toLowerCase() === cleanName);
        if (existingCompanyByName) {
            return res.status(400).json({ 
                success: false, 
                message: 'A company with this name is already registered.' 
            });
        }

        const newCompany = {
            id: Date.now(),
            companyName: companyName.trim(),
            email: cleanEmail,
            password,
            website: '',
            location: '',
            industry: 'Information Technology',
            description: ''
        };

        data.companies.push(newCompany);
        saveCompanyData(data);

        return res.status(200).json({
            success: true,
            message: 'Company registration successful!',
            company: newCompany
        });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ==========================================
// EMPLOYER LOGIN
// POST: /api/company/login
// ==========================================
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const data = getCompanyData();
        const cleanEmail = email.trim().toLowerCase();
        const company = data.companies.find(c => c.email.toLowerCase() === cleanEmail && c.password === password);
        
        if (company) {
            return res.status(200).json({ success: true, message: 'Login successful!', company });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ==========================================
// EMPLOYER FORGOT PASSWORD
// POST: /api/company/forgot-password
// ==========================================
router.post('/forgot-password', (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Company email and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const data = getCompanyData();
        const cleanEmail = email.trim().toLowerCase();
        const company = data.companies.find(c => c.email && c.email.toLowerCase() === cleanEmail);

        if (!company) {
            return res.status(404).json({ success: false, message: 'No employer account found with this company email address.' });
        }

        company.password = newPassword;
        saveCompanyData(data);

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