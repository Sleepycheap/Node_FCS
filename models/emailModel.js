import mongoose from 'mongoose';

export const emailSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: [true, 'Email must have a sender'],
    },
    subject: {
      type: String,
      required: [true, 'Email must have a subject'],
    },
    body: {
      type: String,
    },
    attachments: {
      type: Array,
    },
    dateReceived: {
      type: Date,
    },
    dateSent: {
      type: Date,
    },
  },
  {
    // This allows virtual properties to be shown in the API output
    toJSON: { virtuals: true },
    toOject: { virtuals: true },
  },
);

// Prevents Duplicates using combination of Sender and Subject
emailSchema.index({ sender: 1, subject: 1 }, { unique: true });

export const Email = mongoose.model('Email', emailSchema);
