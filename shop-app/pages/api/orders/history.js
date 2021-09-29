import nc from 'next-connect';
import { onError } from '../../../utils/error';
import Product from '../../../models/Product';
import db from '../../../utils/db';
import { isAuth } from '../../../utils/auth';
import Order from '../../../models/Order';
const handler = nc({ onError });

handler.use(isAuth);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  } catch (err) {
    console.log('not created');
  }
});

export default handler;
