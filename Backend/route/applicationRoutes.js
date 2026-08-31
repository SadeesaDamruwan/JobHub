const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/storage');

const getApplications = () => readData('applications.json', []);
const saveApplications = (data) => writeData('applications.json', data);

// ==========================================
// [JOB SEEKER] APPLY FOR A JOB
// POST: /api/applications/apply
// ==========================================
router.post('/apply', (req, res) => {
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

        const applications = getApplications();
        const existing = applications.find(
            a => a.jobId === Number(jobId) && (a.seekerEmail || '').trim().toLowerCase() === (seekerEmail || '').trim().toLowerCase()
        );

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this position.'
            });
        }

        const nextId = applications.length > 0 ? Math.max(...applications.map(a => Number(a.id) || 0)) + 1 : 1;
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newApplication = {
            id: nextId,
            jobId: Number(jobId),
            jobTitle: jobTitle || 'Job Role',
            company: company,
            seekerName: seekerName || 'Job Seeker',
            seekerEmail: seekerEmail.trim().toLowerCase(),
            phone: phone || '',
            location: location || '',
            education: education || 'Degree / Professional Experience',
            experience: experience || 'Relevant industry experience',
            coverLetter: coverLetter || `Application submitted for ${jobTitle} at ${company}.`,
            resumeFileName: resumeFileName || '',
            resumeData: resumeData || '',
            status: 'New',
            appliedDate: formattedDate
        };

        applications.unshift(newApplication);
        saveApplications(applications);

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            application: newApplication
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        return res.status(500).json({ success: false, message: 'Server error submitting application.' });
    }
});

// ==========================================
// [JOB SEEKER] GET MY APPLICATIONS 
// GET: /api/applications/my-applications
// ==========================================
router.get('/my-applications', (req, res) => {
    try {
        const applications = getApplications();
        const email = req.query.email ? decodeURIComponent(req.query.email).trim().toLowerCase() : null;

        let result = applications;
        if (email) {
            result = applications.filter(a => (a.seekerEmail || '').trim().toLowerCase() === email);
        }

        return res.status(200).json({
            success: true,
            applications: result
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching applications.' });
    }
});

// ==========================================
// [EMPLOYER] GET COMPANY APPLICANTS
// GET: /api/applications/employer-applicants
// ==========================================
router.get('/employer-applicants', (req, res) => {
    try {
        const applications = getApplications();
        const companyName = req.query.company ? decodeURIComponent(req.query.company).trim().toLowerCase() : null;

        let result = applications;
        if (companyName) {
            result = applications.filter(a => (a.company || '').trim().toLowerCase() === companyName);
        }

        return res.status(200).json({
            success: true,
            applicants: result
        });
    } catch (error) {
        console.error('Error fetching applicants:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching applicants.' });
    }
});

// ==========================================
// [EMPLOYER] UPDATE APPLICANT STATUS
// PUT: /api/applications/update-status/:id
// ==========================================
router.put('/update-status/:id', (req, res) => {
    try {
        const appId = parseInt(req.params.id, 10);
        const { status, employerFeedback } = req.body; 

        const applications = getApplications();
        const appIndex = applications.findIndex(a => a.id === appId);
        
        if (appIndex === -1) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        applications[appIndex].status = status;
        if (employerFeedback !== undefined) {
            applications[appIndex].employerFeedback = employerFeedback;
        }
        applications[appIndex].updatedAt = new Date().toISOString();
        saveApplications(applications);

        return res.status(200).json({ 
            success: true, 
            message: `Applicant status updated to ${status}.`,
            application: applications[appIndex]
        });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ success: false, message: 'Server error updating status.' });
    }
});

module.exports = router;