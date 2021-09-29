import nc from 'next-connect';

const handler = nc();

handler.get(async (req, res) => {
  try {
    res.send({ key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.log('not found mhane');
    res.send(err.message);
  }
});

export default handler;
