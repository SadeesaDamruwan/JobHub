const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema(
    {
        legacyId: {
            type: Number,
            index: true,
            sparse: true
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, 'Company email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        website: {
            type: String,
            default: '',
            trim: true
        },
        location: {
            type: String,
            default: '',
            trim: true
        },
        industry: {
            type: String,
            default: 'Information Technology',
            trim: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        logo: {
            type: String,
            default: ''
        },
        settings: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            twoFactorAuth: {
                type: Boolean,
                default: false
            },
            privacyMode: {
                type: String,
                enum: ['Public', 'Private', 'Restricted'],
                default: 'Public'
            },
            theme: {
                type: String,
                enum: ['Light', 'Dark', 'System'],
                default: 'Light'
            }
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            getters: true,
            transform: (doc, ret) => {
                ret.id = ret.legacyId || ret._id.toString();
                delete ret.password;
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

companySchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

companySchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return bcrypt.compare(candidatePassword, this.password);
    }
    return candidatePassword === this.password;
};

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

module.exports = Company;
