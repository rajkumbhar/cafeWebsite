import nc from 'next-connect';
import { onError } from '../../../utils/error';
import Product from '../../../models/Product';
import db from '../../../utils/db';
import { isAuth } from '../../../utils/auth';
import Order from '../../../models/Order';
const handler = nc({ onError });

handler.use(isAuth);

handler.post(async (req, res) => {
  try {
    await db.connect();
    const newOrder = new Order({
      ...req.body,
      user: req.user._id,
      razorpay: {
        key: req.body.key,
        orderId: req.body.razorpayOrderId,
        paymentId: req.body.razorpayPaymentId,
        signature: req.body.razorpaySignature,
      },
    });

    const order = await newOrder.save();
    res.status(201).send(order);
  } catch (err) {
    console.log('not created');
  }
});

export default handler;
