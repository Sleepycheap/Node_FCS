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
      type: Boolean,
    },
    dateReceived: {
      type: Date,
    },
    dateSent: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toOject: { virtuals: true },
  },
);

emailSchema.pre('save', function (next) {
  next();
});

export const Email = mongoose.model('Email', emailSchema);
