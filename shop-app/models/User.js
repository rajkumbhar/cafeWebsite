import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    shippingAddress: {
      fullname: { type: String, required: false },
      address: { type: String, required: false },
      city: { type: String, required: false },
      pincode: { type: Number, required: false },
      landmark: { type: String, required: false },
      country: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
