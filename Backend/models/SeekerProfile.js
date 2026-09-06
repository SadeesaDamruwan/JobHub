const mongoose = require('mongoose');

const seekerProfileSchema = new mongoose.Schema(
    {
        legacyId: {
            type: Number,
            index: true,
            sparse: true
        },
        seekerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seeker',
            index: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        jobTitle: {
            type: String,
            default: '',
            trim: true
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
        bio: {
            type: String,
            default: '',
            trim: true
        },
        skills: {
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
        avatar: {
            type: String,
            default: ''
        },
        savedJobs: [
            {
                type: mongoose.Schema.Types.Mixed
            }
        ]
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

const SeekerProfile = mongoose.models.SeekerProfile || mongoose.model('SeekerProfile', seekerProfileSchema);

module.exports = SeekerProfile;
