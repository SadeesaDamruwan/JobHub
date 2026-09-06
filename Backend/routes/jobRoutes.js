const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');

const formatJob = (job) => {
    if (!job) return null;
    const obj = typeof job.toObject === 'function' ? job.toObject() : { ...job };
    obj.id = obj.legacyId || (obj._id ? obj._id.toString() : obj.id);
    return obj;
};

const findJobById = async (idParam) => {
    if (!idParam) return null;
    if (mongoose.Types.ObjectId.isValid(idParam)) {
        const job = await Job.findById(idParam);
        if (job) return job;
    }
    const numId = Number(idParam);
    if (!isNaN(numId)) {
        const job = await Job.findOne({ legacyId: numId });
        if (job) return job;
    }
    return null;
};

router.get('/all', async (req, res) => {
    try {
        const { search, category, workMode, location, level, minStipend, company } = req.query;
        const filter = {};

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            filter.$or = [
                { title: searchRegex },
                { company: searchRegex },
                { description: searchRegex }
            ];
        }

        if (company && company.trim()) {
            filter.company = new RegExp(`^${company.trim()}$`, 'i');
        }

        if (location && location.trim()) {
            filter.location = new RegExp(location.trim(), 'i');
        }

        if (category && category.trim()) {
            const catList = category.split(',').map((c) => new RegExp(c.trim(), 'i'));
            filter.category = { $in: catList };
        }

        if (workMode && workMode.trim()) {
            filter.workMode = new RegExp(`^${workMode.trim()}$`, 'i');
        }

        if (level && level.trim()) {
            const levelList = level.split(',').map((l) => new RegExp(l.trim(), 'i'));
            filter.level = { $in: levelList };
        }

        if (minStipend && !isNaN(Number(minStipend)) && Number(minStipend) > 0) {
            filter.stipendNumeric = { $gte: Number(minStipend) };
        }

        const rawJobs = await Job.find(filter).sort({ postedAt: -1 }).lean();
        const jobs = rawJobs.map((j) => {
            j.id = j.legacyId || j._id.toString();
            return j;
        });

        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching jobs.' });
    }
});

const handleCreateJob = async (req, res) => {
    try {
        const { title, company, location, type, workMode, category, salary, stipend, level, deadline, description } = req.body;

        if (!title || !location || !description || !company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields including company name.'
            });
        }

        const newJob = await Job.create({
            title: title.trim(),
            company: company.trim(),
            location: location.trim(),
            type: type || workMode || 'Full-Time',
            workMode: workMode || type || 'Onsite',
            category: category || 'Tech & Engineering',
            level: level || 'Entry Level',
            salary: salary || stipend || 'Not specified',
            stipend: stipend || salary || 'Negotiable',
            deadline: deadline || '',
            description: description.trim(),
            postedAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: formatJob(newJob)
        });
    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ success: false, message: 'Server error creating job.' });
    }
};

router.get('/company/:companyName', async (req, res) => {
    try {
        const companyName = decodeURIComponent(req.params.companyName).trim();
        const rawJobs = await Job.find({
            company: new RegExp(`^${companyName}$`, 'i')
        }).sort({ postedAt: -1 }).lean();

        const jobs = rawJobs.map((j) => {
            j.id = j.legacyId || j._id.toString();
            return j;
        });

        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching company jobs.' });
    }
});

router.get('/single/:id', async (req, res) => {
    try {
        const job = await findJobById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        return res.status(200).json({ success: true, job: formatJob(job) });
    } catch (error) {
        console.error('Error fetching job detail:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching job details.' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const job = await findJobById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job post not found.' });
        }

        const { title, company, location, type, workMode, category, salary, stipend, level, deadline, description, status } = req.body;

        if (title !== undefined) job.title = title;
        if (company !== undefined) job.company = company;
        if (location !== undefined) job.location = location;
        if (type !== undefined) job.type = type;
        if (workMode !== undefined) job.workMode = workMode;
        if (category !== undefined) job.category = category;
        if (salary !== undefined) job.salary = salary;
        if (stipend !== undefined) job.stipend = stipend;
        if (level !== undefined) job.level = level;
        if (deadline !== undefined) job.deadline = deadline;
        if (description !== undefined) job.description = description;
        if (status !== undefined) job.status = status;

        await job.save();

        return res.status(200).json({
            success: true,
            message: 'Job updated successfully.',
            job: formatJob(job)
        });
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json({ success: false, message: 'Server error updating job.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const job = await findJobById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        await Job.findByIdAndDelete(job._id);

        return res.status(200).json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({ success: false, message: 'Server error deleting job.' });
    }
});

router.post('/', handleCreateJob);
router.post('/create', handleCreateJob);

module.exports = router;