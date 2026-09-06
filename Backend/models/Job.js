const mongoose = require('mongoose');

const parseStipendAmount = (stipendStr) => {
    if (!stipendStr) return 0;
    const clean = String(stipendStr).replace(/,/g, '');
    const match = clean.match(/\d+/);
    if (!match) return 0;
    let num = parseInt(match[0], 10);
    if (String(stipendStr).includes('$')) {
        num = num * 300;
    }
    return num;
};

const jobSchema = new mongoose.Schema(
    {
        legacyId: {
            type: Number,
            index: true,
            sparse: true
        },
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
            index: true
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            index: true
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
            index: true
        },
        type: {
            type: String,
            default: 'Full-Time',
            trim: true
        },
        workMode: {
            type: String,
            default: 'Onsite',
            trim: true,
            index: true
        },
        category: {
            type: String,
            default: 'Tech & Engineering',
            trim: true,
            index: true
        },
        level: {
            type: String,
            default: 'Entry Level',
            trim: true,
            index: true
        },
        salary: {
            type: String,
            default: 'Not specified',
            trim: true
        },
        stipend: {
            type: String,
            default: 'Negotiable',
            trim: true
        },
        stipendNumeric: {
            type: Number,
            default: 0,
            index: true
        },
        deadline: {
            type: String,
            default: '',
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true
        },
        status: {
            type: String,
            enum: ['Active', 'Closed', 'Draft'],
            default: 'Active',
            index: true
        },
        postedAt: {
            type: Date,
            default: Date.now,
            index: true
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

jobSchema.pre('save', function () {
    if (this.stipend || this.salary) {
        this.stipendNumeric = parseStipendAmount(this.stipend || this.salary);
    }
});

jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ category: 1, workMode: 1, level: 1, stipendNumeric: -1 });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

module.exports = Job;
