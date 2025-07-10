const mongoose = require('mongoose'); // Mongoose
const bcrypt = require('bcryptjs'); // Bcrypt Encryption

// Schema definitions


// Address Schema

const addressSchema = {
    addressLine1: { type: String, required: true, maxlength: 100 },
    addressLine2: { type: String, required: false, maxlength: 100 },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  };



//  User Schema 
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, ' First Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },

  lastName: {
    type: String,
    required: [true, 'Last Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    // select: false 
  },

  phone:{
    type: String,
    required: [true, 'Phone Number is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Invalid phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  shippingAddress:
   { type: addressSchema, required: true },
  billingAddress:
   { type: addressSchema, required: true },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next(); // If password wasn't changed, skip
  
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   });
  