const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
    {
        legacyId: {
            type: Number,
            index: true,
            sparse: true
        },
        jobId: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Job ID is required'],
            index: true
        },
        jobTitle: {
            type: String,
            required: [true, 'Job Title is required'],
            trim: true
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            index: true
        },
        seekerName: {
            type: String,
            required: [true, 'Applicant name is required'],
            trim: true
        },
        seekerEmail: {
            type: String,
            required: [true, 'Applicant email is required'],
            lowercase: true,
            trim: true,
            index: true
        },
        phone: {
            type: String,
            default: '',
            trim: true
        },
        location: {
            type: String,
            default: '',
            trim: true
        },
        education: {
            type: String,
            default: 'Degree / Professional Experience',
            trim: true
        },
        experience: {
            type: String,
            default: 'Relevant industry experience',
            trim: true
        },
        coverLetter: {
            type: String,
            default: '',
            trim: true
        },
        resumeFileName: {
            type: String,
            default: '',
            trim: true
        },
        resumeData: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['New', 'Applied', 'Under Review', 'Interview', 'Offer', 'Accepted', 'Rejected'],
            default: 'New',
            index: true
        },
        employerFeedback: {
            type: String,
            default: '',
            trim: true
        },
        appliedDate: {
            type: String,
            default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            getters: true,
            transform: (doc, ret) => {
                ret.id = ret.legacyId || ret._id.toString();
                return ret;
            }
        },
        toObject: {
            virtuals: true,
            getters: true,
            transform: (doc, ret) => {
                ret.id = ret.legacyId || ret._id.toString();
                return ret;
            }
        }
    }
);

applicationSchema.index({ company: 1, createdAt: -1 });
applicationSchema.index({ seekerEmail: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, seekerEmail: 1 });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

module.exports = Application;
