import {
  Button,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import NextLink from 'next/link';
import Link from 'next/link';
import Image from 'next/Image';
import dynamic from 'next/dynamic';
import axios from 'axios';
import router from 'next/router';
import useStyles from '../utils/styles';
import CheckoutWizard from '../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError, onError } from '../utils/error';
import Cookies from 'js-cookie';

function Placeorder() {
  const [Loading, setLoading] = useState(false);
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { cartItems, shippingAddress, paymentMethod },
  } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; //123.456 => 123.46
  const itemPrice = round2(
    cartItems.reduce((a, c) => a + c.price * c.quantity, 0)
  );
  const shippingPrice = itemPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemPrice * 0.15);
  const totalPrice = round2(itemPrice + shippingPrice + taxPrice);

  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, []);

  const placeorderHandler = async () => {
    closeSnackbar();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      enqueueSnackbar(
        { message: 'Razorpay SDK Failed to Load, are you online?' },
        (variant = 'error')
      );
    };

    script.onload = async () => {
      try {
        setLoading(true);
        const result = await axios.post('/api/orders/createOrder', {
          amount: totalPrice * 100,
        });

        const { amount, id: order_id, currency } = result.data;

        const {
          data: { key: razorpayKey },
        } = await axios.get('/api/orders/razKey');

        const options = {
          key: razorpayKey,
          amount: amount,
          currency,
          name: 'Sample payment',
          description: 'This is my first payment configuration',
          order_id,
          handler: async function (response) {
            try {
              const result = await axios.post(
                '/api/orders',
                {
                  key: razorpayKey,
                  totalPrice: amount / 100,
                  currency,
                  orderItems: cartItems,
                  shippingAddress,
                  paymentMethod,
                  itemPrice,
                  shippingPrice,
                  taxPrice,
                  isPaid: true,
                  paidAt: Date.now(),
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                },
                {
                  headers: {
                    authorization: `Bearer ${userInfo.token}`,
                  },
                }
              );

              dispatch({ type: 'CART_CLEAR' });
              Cookies.remove('cartItems');
              enqueueSnackbar('Congratulations, your order is placed', {
                variant: 'success',
              });
              router.push(`/order/${result.data._id}`);
            } catch (err) {
              enqueueSnackbar(err.message, (variant = 'error'));
            }
          },
          prefill: {
            name: 'example name',
            email: 'email@example.com',
            contact: '11111111111',
          },
          notes: {
            address: 'example address',
          },
          theme: {
            color: '#F09E51',
          },
        };

        setLoading(false);
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        setLoading(false);
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    };
    document.body.appendChild(script);
  };

  const placeorderCODHandler = async () => {
    closeSnackbar();
    try {
      const result = await axios.post(
        '/api/orders',
        {
          totalPrice,
          currency: 'IND',
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemPrice,
          shippingPrice,
          taxPrice,
          isPaid: false,
          key: '',
          razorpayOrderId: '',
          razorpayPaymentId: '',
          razorpaySignature: '',
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      enqueueSnackbar('Congratulations, your order is placed', {
        variant: 'success',
      });
      dispatch({ type: 'CART_CLEAR' });
      Cookies.remove('cartItems');
      router.push(`/order/${result.data._id}`);
    } catch (err) {
      enqueueSnackbar(onError(err), {
        variant: 'error',
      });
    }
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activestep={3} />
      <Typography component="h1" variant="h1">
        Place Order
      </Typography>
      <Grid container item spacing={1}>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  {' '}
                  Shipping Address{' '}
                </Typography>
              </ListItem>
              <ListItem>
                {shippingAddress.fullname}, {shippingAddress.address},{' '}
                {shippingAddress.city}, {shippingAddress.pincode},{' '}
                {shippingAddress.landmark}, {shippingAddress.country}
              </ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  {' '}
                  Payment Method{' '}
                </Typography>
              </ListItem>
              <ListItem>{paymentMethod}</ListItem>
            </List>
          </Card>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h2" variant="h2">
                  {' '}
                  Order Items{' '}
                </Typography>
              </ListItem>
              <ListItem>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell> Image </TableCell>
                        <TableCell> Name </TableCell>
                        <TableCell align="right"> Quantity </TableCell>
                        <TableCell align="right"> Price </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={50}
                                  height={50}
                                ></Image>
                              </Link>
                            </NextLink>
                          </TableCell>

                          <TableCell>
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Typography>{item.name}</Typography>
                              </Link>
                            </NextLink>
                          </TableCell>

                          <TableCell align="right">
                            <Typography>{item.quantity}</Typography>
                          </TableCell>

                          <TableCell align="right">
                            <NextLink href={`/product/${item.slug}`} passHref>
                              <Link>
                                <Typography>Rs. {item.price}/-</Typography>
                              </Link>
                            </NextLink>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item md={3} cs={12} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography variant="h6">Order Summary</Typography>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Items :</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">Rs. {itemPrice}/-</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Tax :</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">Rs. {taxPrice}/-</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Shipping :</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">Rs. {shippingPrice}/-</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Total :</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">
                      <strong>Rs. {totalPrice}/-</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                {paymentMethod && paymentMethod === 'Cash' ? (
                  <Button
                    onClick={placeorderCODHandler}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {' '}
                    Place Order
                  </Button>
                ) : (
                  <Button
                    onClick={placeorderHandler}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    {' '}
                    Place Order
                  </Button>
                )}
              </ListItem>
              {Loading ? (
                <ListItem>
                  <CircularProgress />
                </ListItem>
              ) : (
                ''
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(Placeorder), { ssr: false });
