const express = require('express');
const router = express.Router(); 
const { readData, writeData } = require('../utils/storage');

function parseStipendAmount(stipendStr) {
    if (!stipendStr) return 0;
    const clean = String(stipendStr).replace(/,/g, '');
    const match = clean.match(/\d+/);
    if (!match) return 0;
    let num = parseInt(match[0], 10);
    if (String(stipendStr).includes('$')) {
        num = num * 300;
    }
    return num;
}

const mockJobs = [
    {
        id: 1,
        title: "Mobile App Developer (Flutter)",
        company: "Technova Solutions",
        location: "Anuradhapura, Sri Lanka",
        type: "Full-Time",
        workMode: "Hybrid",
        category: "Tech & Engineering",
        level: "Mid Level",
        salary: "Rs 90,000 / mo",
        stipend: "Rs 90,000 / mo",
        deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        description: "We are looking for a skilled Flutter developer to build real-time mobile applications. Experience with AI integrations and IoT telemetry is a huge plus.",
        postedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 2,
        title: "Gameplay Programmer (Unity/C#)",
        company: "PixelForge Studios",
        location: "Remote",
        type: "Contract",
        workMode: "Remote",
        category: "Tech & Engineering",
        level: "Entry Level",
        salary: "Rs 45,000 / mo",
        stipend: "Rs 45,000 / mo",
        deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        description: "Join our indie team to work on physics-based 2D arcade games. Strong knowledge of rigid-body dynamics and collision physics required.",
        postedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 3,
        title: "Full Stack Engineer",
        company: "Global Tech",
        location: "Colombo, Sri Lanka",
        type: "Full-Time",
        workMode: "Onsite",
        category: "Tech & Engineering",
        level: "Senior Level",
        salary: "Rs 150,000 / mo",
        stipend: "Rs 150,000 / mo",
        deadline: new Date(Date.now() + 86400000 * 21).toISOString().split('T')[0],
        description: "Seeking a developer proficient in React, Node.js, and backend databases (MySQL/MongoDB) to maintain enterprise-level web applications.",
        postedAt: new Date().toISOString()
    },
    {
        id: 4,
        title: "Digital Marketing Specialist",
        company: "Creative Web Agency",
        location: "Colombo, Sri Lanka",
        type: "Full-Time",
        workMode: "Hybrid",
        category: "Marketing",
        level: "Entry Level",
        salary: "Rs 65,000 / mo",
        stipend: "Rs 65,000 / mo",
        deadline: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
        description: "Looking for an experienced marketer to handle SEO, social media campaigns, and analytics reporting.",
        postedAt: new Date(Date.now() - 300000000).toISOString()
    }
];

function getJobs() {
    return readData('jobs', mockJobs);
}

function saveJobs(jobs) {
    return writeData('jobs', jobs);
}

router.get('/all', (req, res) => {
    try {
        const { search, category, workMode, location, level, minStipend } = req.query;
        let filteredJobs = getJobs();

        if (search) {
            const searchLower = search.toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                (job.title && job.title.toLowerCase().includes(searchLower)) ||
                (job.company && job.company.toLowerCase().includes(searchLower)) ||
                (job.description && job.description.toLowerCase().includes(searchLower))
            );
        }

        if (location && location.trim() !== '') {
            const locLower = location.trim().toLowerCase();
            filteredJobs = filteredJobs.filter(job => 
                job.location && job.location.toLowerCase().includes(locLower)
            );
        }

        if (category && category.trim() !== '') {
            const catList = category.split(',').map(c => c.trim().toLowerCase());
            filteredJobs = filteredJobs.filter(job => 
                job.category && catList.some(c => job.category.toLowerCase().includes(c))
            );
        }

        if (workMode && workMode.trim() !== '') {
            filteredJobs = filteredJobs.filter(job => 
                job.workMode && job.workMode.toLowerCase() === workMode.trim().toLowerCase()
            );
        }

        if (level && level.trim() !== '') {
            const levelList = level.split(',').map(l => l.trim().toLowerCase());
            filteredJobs = filteredJobs.filter(job => 
                job.level && levelList.some(lvl => job.level.toLowerCase().includes(lvl))
            );
        }

        if (minStipend && !isNaN(Number(minStipend)) && Number(minStipend) > 0) {
            const min = Number(minStipend);
            filteredJobs = filteredJobs.filter(job => {
                const stipendVal = parseStipendAmount(job.stipend || job.salary);
                return stipendVal >= min;
            });
        }

        return res.status(200).json({ success: true, jobs: filteredJobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching jobs.' });
    }
});

const handleCreateJob = (req, res) => {
    try {
        const { title, company, location, type, workMode, category, salary, stipend, level, deadline, description } = req.body;

        if (!title || !location || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields.' 
            });
        }

        const currentJobs = getJobs();
        const nextId = currentJobs.length > 0 ? Math.max(...currentJobs.map(j => Number(j.id) || 0)) + 1 : 1;

        const newJob = {
            id: nextId,
            title,
            company: company || "Technova Solutions",
            location,
            type: type || workMode || 'Full-Time',
            workMode: workMode || type || 'Onsite',
            category: category || 'Tech & Engineering',
            salary: salary || stipend || 'Not specified',
            stipend: stipend || salary || 'Negotiable',
            level: level || 'Entry Level',
            deadline: deadline || '',
            description,
            postedAt: new Date().toISOString()
        };

        currentJobs.unshift(newJob);
        saveJobs(currentJobs);

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: newJob
        });

    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({ success: false, message: 'Server error creating job.' });
    }
};

router.get('/company/:companyName', (req, res) => {
    try {
        const companyName = decodeURIComponent(req.params.companyName).trim().toLowerCase();
        const allJobs = getJobs();
        const companyJobs = allJobs.filter(j => (j.company || '').trim().toLowerCase() === companyName);
        return res.status(200).json({ success: true, jobs: companyJobs });
    } catch (error) {
        console.error('Error fetching company jobs:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching company jobs.' });
    }
});

router.get('/single/:id', (req, res) => {
    try {
        const jobId = parseInt(req.params.id, 10);
        const allJobs = getJobs();
        const job = allJobs.find(j => j.id === jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        return res.status(200).json({ success: true, job });
    } catch (error) {
        console.error('Error fetching job detail:', error);
        return res.status(500).json({ success: false, message: 'Server error fetching job details.' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const jobId = parseInt(req.params.id, 10);
        const { title, company, location, type, workMode, category, salary, stipend, level, deadline, description, status } = req.body;
        const currentJobs = getJobs();
        const index = currentJobs.findIndex(j => j.id === jobId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Job post not found.' });
        }
        currentJobs[index] = {
            ...currentJobs[index],
            title: title !== undefined ? title : currentJobs[index].title,
            company: company !== undefined ? company : currentJobs[index].company,
            location: location !== undefined ? location : currentJobs[index].location,
            type: type !== undefined ? type : currentJobs[index].type,
            workMode: workMode !== undefined ? workMode : currentJobs[index].workMode,
            category: category !== undefined ? category : currentJobs[index].category,
            salary: salary !== undefined ? salary : currentJobs[index].salary,
            stipend: stipend !== undefined ? stipend : currentJobs[index].stipend,
            level: level !== undefined ? level : currentJobs[index].level,
            deadline: deadline !== undefined ? deadline : currentJobs[index].deadline,
            description: description !== undefined ? description : currentJobs[index].description,
            status: status !== undefined ? status : currentJobs[index].status
        };
        saveJobs(currentJobs);
        return res.status(200).json({ success: true, message: 'Job updated successfully.', job: currentJobs[index] });
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json({ success: false, message: 'Server error updating job.' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const jobId = parseInt(req.params.id, 10);
        let currentJobs = getJobs();
        const initialLength = currentJobs.length;
        currentJobs = currentJobs.filter(j => j.id !== jobId);
        if (currentJobs.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        saveJobs(currentJobs);
        return res.status(200).json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({ success: false, message: 'Server error deleting job.' });
    }
});

router.post('/', handleCreateJob);
router.post('/create', handleCreateJob); 

module.exports = router;