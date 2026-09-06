const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const seekerSchema = new mongoose.Schema(
    {
        legacyId: {
            type: Number,
            index: true,
            sparse: true
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
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

seekerSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

seekerSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
        return bcrypt.compare(candidatePassword, this.password);
    }
    return candidatePassword === this.password;
};

const Seeker = mongoose.models.Seeker || mongoose.model('Seeker', seekerSchema);

module.exports = Seeker;
