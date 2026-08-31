// controllers/jobController.js

// Mock database with comprehensive fields
const jobs = [
    { 
        id: 1, 
        title: "Senior Flutter Developer", 
        company: "Technova Solutions", 
        location: "Colombo 03", 
        type: "Hybrid", 
        workMode: "Hybrid",
        level: "Mid Level",
        category: "Tech & Engineering",
        stipend: "Rs 85,000 / mo",
        deadline: "2026-09-30",
        description: "We are looking for an experienced developer to join Technova Solutions. You will be building scalable mobile and web applications using Flutter, React, and Node.js."
    },
    { 
        id: 2, 
        title: "Backend Node.js Engineer", 
        company: "DataSync", 
        location: "Remote", 
        type: "Remote",
        workMode: "Remote",
        level: "Senior Level",
        category: "Tech & Engineering",
        stipend: "Rs 120,000 / mo",
        deadline: "2026-09-15",
        description: "Looking for a backend expert to handle our high-traffic API architecture."
    }
];

const getJobs = (req, res) => {
    let filteredJobs = [...jobs];

    const { search, category, workMode, level } = req.query;

    if (search) {
        filteredJobs = filteredJobs.filter(job => 
            (job.title && job.title.toLowerCase().includes(search.toLowerCase())) ||
            (job.description && job.description.toLowerCase().includes(search.toLowerCase()))
        );
    }

    if (category && category !== '') {
        const catFiltered = filteredJobs.filter(job => 
            job.category && job.category.toLowerCase() === category.toLowerCase()
        );
        // Fallback: If filtering by category yields 0 results, keep the list instead of showing nothing
        if (catFiltered.length > 0) filteredJobs = catFiltered;
    }

    if (workMode && workMode !== '') {
        const modeFiltered = filteredJobs.filter(job => 
            job.workMode && job.workMode.toLowerCase() === workMode.toLowerCase()
        );
        if (modeFiltered.length > 0) filteredJobs = modeFiltered;
    }

    if (level && level !== '') {
        const levelFiltered = filteredJobs.filter(job => 
            job.level && job.level.toLowerCase() === level.toLowerCase()
        );
        if (levelFiltered.length > 0) filteredJobs = levelFiltered;
    }

    res.status(200).json(filteredJobs);
};

// POST: Create a new job
const postJob = (req, res) => {
    const { title, category, level, workMode, location, stipend, deadline, description } = req.body;

    const newJob = {
        id: jobs.length + 1,
        title,
        company: "Technova Solutions", // Hardcoded for now until session tokens are added
        category: category || 'Tech & Engineering',
        level: level || 'Entry Level',
        type: workMode || 'Onsite', // Mapped so the Home page UI reads it correctly
        workMode: workMode || 'Onsite',
        location,
        stipend: stipend || 'Negotiable',
        deadline: deadline || '',
        description
    };

    jobs.push(newJob);
    console.log("New Job Posted:", newJob);
    
    res.status(201).json({ message: "Job posted successfully!", job: newJob });
};

module.exports = {
    getJobs,
    postJob
};