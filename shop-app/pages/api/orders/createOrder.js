import nc from 'next-connect';
import Razorpay from 'razorpay';

const handler = nc();

handler.post(async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: req.body.amount,
      currency: 'INR',
    };

    const order = await instance.orders.create(options);
    !order && res.status(500).send('Order not created');
    res.send(order);
  } catch (err) {
    console.log('sorry');
    res.status(500).send(err.message);
  }
});

export default handler;
