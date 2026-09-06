require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { connectDB, mongoose } = require('../config/db');

const Job = require('../models/Job');
const Company = require('../models/Company');
const Seeker = require('../models/Seeker');
const SeekerProfile = require('../models/SeekerProfile');
const Application = require('../models/Application');

const readJSON = (fileName, defaultVal = null) => {
    try {
        const p = path.join(__dirname, '../data', fileName);
        if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.warn(`Could not read ${fileName}:`, e.message);
    }
    return defaultVal;
};

const migrate = async () => {
    console.log('🚀 Starting Data Migration to MongoDB...');
    await connectDB();

    let companiesCount = 0;
    let jobsCount = 0;
    let seekersCount = 0;
    let profilesCount = 0;
    let applicationsCount = 0;

    const companiesData = readJSON('companies.json', { companies: [], settings: {} });
    const companiesList = Array.isArray(companiesData) ? companiesData : (companiesData?.companies || []);
    
    for (const c of companiesList) {
        if (!c.email) continue;
        const cleanEmail = c.email.trim().toLowerCase();
        const existing = await Company.findOne({ email: cleanEmail });
        
        if (!existing) {
            await Company.create({
                legacyId: c.id ? Number(c.id) : undefined,
                companyName: c.companyName || 'Company',
                email: cleanEmail,
                password: c.password || 'password123',
                website: c.website || '',
                location: c.location || '',
                industry: c.industry || 'Information Technology',
                description: c.description || '',
                logo: c.logo || '',
                settings: companiesData.settings || {
                    emailNotifications: true,
                    twoFactorAuth: false,
                    privacyMode: 'Public',
                    theme: 'Light'
                }
            });
            companiesCount++;
        }
    }
    console.log(`📦 Companies migrated: ${companiesCount}`);

    const jobsList = readJSON('jobs.json', []);
    for (const j of jobsList) {
        if (!j.title || !j.company) continue;
        const existing = await Job.findOne({
            title: j.title.trim(),
            company: j.company.trim()
        });

        if (!existing) {
            await Job.create({
                legacyId: j.id ? Number(j.id) : undefined,
                title: j.title.trim(),
                company: j.company.trim(),
                location: j.location || 'Sri Lanka',
                type: j.type || j.workMode || 'Full-Time',
                workMode: j.workMode || j.type || 'Onsite',
                category: j.category || 'Tech & Engineering',
                level: j.level || 'Entry Level',
                salary: j.salary || j.stipend || 'Not specified',
                stipend: j.stipend || j.salary || 'Negotiable',
                deadline: j.deadline || '',
                description: j.description || 'Job details available upon request.',
                status: j.status || 'Active',
                postedAt: j.postedAt ? new Date(j.postedAt) : new Date()
            });
            jobsCount++;
        }
    }
    console.log(`📦 Jobs migrated: ${jobsCount}`);

    const seekersData = readJSON('seekers.json', { users: [], profiles: [] });
    const usersList = seekersData.users || [];
    const profilesList = seekersData.profiles || [];

    for (const u of usersList) {
        if (!u.email) continue;
        const cleanEmail = u.email.trim().toLowerCase();
        const existing = await Seeker.findOne({ email: cleanEmail });
        
        if (!existing) {
            await Seeker.create({
                legacyId: u.id ? Number(u.id) : undefined,
                fullName: u.fullName || 'Job Seeker',
                email: cleanEmail,
                password: u.password || 'password123'
            });
            seekersCount++;
        }
    }
    console.log(`📦 Seekers migrated: ${seekersCount}`);

    for (const p of profilesList) {
        if (!p.email) continue;
        const cleanEmail = p.email.trim().toLowerCase();
        const existing = await SeekerProfile.findOne({ email: cleanEmail });
        
        if (!existing) {
            const seekerUser = await Seeker.findOne({ email: cleanEmail });
            await SeekerProfile.create({
                legacyId: p.id ? Number(p.id) : undefined,
                seekerId: seekerUser ? seekerUser._id : undefined,
                email: cleanEmail,
                fullName: p.fullName || 'Job Seeker',
                jobTitle: p.jobTitle || '',
                phone: p.phone || '',
                location: p.location || '',
                bio: p.bio || '',
                skills: p.skills || '',
                resumeFileName: p.resumeFileName || '',
                resumeData: p.resumeData || ''
            });
            profilesCount++;
        }
    }
    console.log(`📦 Seeker Profiles migrated: ${profilesCount}`);

    const appsList = readJSON('applications.json', []);
    for (const a of appsList) {
        if (!a.jobTitle || !a.company || !a.seekerEmail) continue;
        const cleanEmail = a.seekerEmail.trim().toLowerCase();
        const existing = await Application.findOne({
            jobTitle: a.jobTitle,
            company: a.company,
            seekerEmail: cleanEmail
        });

        if (!existing) {
            await Application.create({
                legacyId: a.id ? Number(a.id) : undefined,
                jobId: a.jobId,
                jobTitle: a.jobTitle,
                company: a.company,
                seekerName: a.seekerName || 'Job Seeker',
                seekerEmail: cleanEmail,
                phone: a.phone || '',
                location: a.location || '',
                education: a.education || 'Degree / Professional Experience',
                experience: a.experience || 'Relevant industry experience',
                coverLetter: a.coverLetter || '',
                resumeFileName: a.resumeFileName || '',
                resumeData: a.resumeData || '',
                status: a.status || 'New',
                employerFeedback: a.employerFeedback || '',
                appliedDate: a.appliedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            applicationsCount++;
        }
    }
    console.log(`📦 Applications migrated: ${applicationsCount}`);

    console.log('\n✅ All data migration completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
};

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
