const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');

const formatApplication = (app) => {
    if (!app) return null;
    const obj = typeof app.toObject === 'function' ? app.toObject() : { ...app };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    return obj;
};

const findApplicationById = async (idParam) => {
    if (!idParam) return null;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
        const app = await Application.findById(idParam);
        if (app) return app;
    }
    const numId = Number(idParam);
    if (!isNaN(numId)) {
        const app = await Application.findOne({ legacyId: numId });
        if (app) return app;
    }
    return null;
};

router.post('/apply', async (req, res) => {
    try {
        const {
            jobId,
            jobTitle,
            company,
            seekerName,
            seekerEmail,
            phone,
            location,
            education,
            experience,
            coverLetter,
            resumeFileName,
            resumeData
        } = req.body;

        if (!jobId || !company || !seekerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required application fields.'
            });
        }

        const cleanEmail = seekerEmail.trim().toLowerCase();
        const existing = await Application.findOne({
            jobId: jobId,
            seekerEmail: cleanEmail
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this position.'
            });
        }

        const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newApplication = await Application.create({
            jobId,
            jobTitle: jobTitle || 'Job Role',
            company: company.trim(),
            seekerName: seekerName || 'Job Seeker',
            seekerEmail: cleanEmail,
            phone: phone || '',
            location: location || '',
            education: education || 'Degree / Professional Experience',
            experience: experience || 'Relevant industry experience',
            coverLetter: coverLetter || `Application submitted for ${jobTitle} at ${company}.`,
            resumeFileName: resumeFileName || '',
            resumeData: resumeData || '',
            status: 'New',
            appliedDate: formattedDate
        });

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            application: formatApplication(newApplication)
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        return res.status(500).json({ success: false, message: 'Server error submitting application.' });
    }
});

router.get('/my-applications', async (req, res) => {
    try {
        const email = req.query.email ? decodeURIComponent(req.query.email).trim().toLowerCase() : null;
        const filter = email ? { seekerEmail: email } : {};

        const rawApps = await Application.find(filter).sort({ createdAt: -1 }).lean();
        const applications = rawApps.map((a) => {
            a.id = a.legacyId || a._id.toString();
            return a;
        });

        return res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching applications.' });
    }
});

router.get('/employer-applicants', async (req, res) => {
    try {
        const companyName = req.query.company ? decodeURIComponent(req.query.company).trim() : null;
        const filter = companyName ? { company: new RegExp(`^${companyName}$`, 'i') } : {};

        const rawApps = await Application.find(filter).sort({ createdAt: -1 }).lean();
        const applicants = rawApps.map((a) => {
            a.id = a.legacyId || a._id.toString();
            return a;
        });

        return res.status(200).json({
            success: true,
            applicants
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching applicants.' });
    }
});

router.put('/update-status/:id', async (req, res) => {
    try {
        const app = await findApplicationById(req.params.id);
        if (!app) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        const { status, employerFeedback } = req.body;

        if (status !== undefined) {
            app.status = status;
        }
        if (employerFeedback !== undefined) {
            app.employerFeedback = employerFeedback;
        }

        await app.save();

        return res.status(200).json({
            success: true,
            message: `Applicant status updated to ${status}.`,
            application: formatApplication(app)
        });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ success: false, message: 'Server error updating status.' });
    }
});

module.exports = router;