import nc from 'next-connect';
import User from '../../../models/User';
import db from '../../../utils/db';
import bcrypt from 'bcryptjs';
import { isAuth } from '../../../utils/auth';
import mongoose from 'mongoose';

const handler = nc();

handler.use(isAuth);

handler.post(async (req, res) => {
  try {
    await db.connect();

    await User.findOneAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $addToSet: {
          shippingAddress: req.body.shippingAddress,
        },
      }
    );

    await db.disconnect();

    res.send({
      message: 'Success',
    });
  } catch (err) {
    res.status(500).send({ message: 'Email already exist' });
  }
});

export default handler;
