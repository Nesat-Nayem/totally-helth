import mongoose, { Schema } from 'mongoose';
import { IContact } from './contact.interface';

const ContactSchema: Schema = new Schema(
  {
    fullName: { 
      type: String, 
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters']
    },
    emailAddress: { 
      type: String, 
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phoneNumber: { 
      type: String, 
      trim: true,
      match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
    },
    subject: { 
      type: String, 
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: { 
      type: String, 
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    isDeleted: { 
      type: Boolean, 
      default: false,
      index: true
    },
  },
  { 
    timestamps: true
  }
);

// Index for efficient queries
ContactSchema.index({ isDeleted: 1, createdAt: -1 });
ContactSchema.index({ emailAddress: 1 });

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);

