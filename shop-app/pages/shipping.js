import {
  Button,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import useStyles from '../utils/styles';
import NextLink from 'next/link';
import axios from 'axios';
import { Store } from '../utils/Store';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import CheckoutWizard from '../components/CheckoutWizard';

export default function Shipping() {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const router = useRouter();
  const { redirect } = router.query; // jiss page se user login pe aya vo previous page isme store hota h
  const { state, dispatch } = useContext(Store);

  const {
    userInfo,
    cart: { shippingAddress },
  } = state;

  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/shipping');
    }

    setValue('fullname', shippingAddress.fullname);
    setValue('landmark', shippingAddress.landmark);
    setValue('city', shippingAddress.city);
    setValue('address', shippingAddress.address);
    setValue('pincode', shippingAddress.pincode);
    setValue('country', shippingAddress.country);
  }, []);

  const classes = useStyles();

  const submitHandler = async ({
    fullname,
    address,
    landmark,
    city,
    pincode,
    country,
  }) => {
    try {
      const shippingData = JSON.stringify({
        fullname,
        address,
        landmark,
        city,
        pincode,
        country,
      });
      Cookies.set('shippingAddress', shippingData);

      const id = userInfo._id;
      const shipping = shippingAddress;

      try {
        const { data } = await axios.post(
          '/api/users/addAddress',
          {
            id: userInfo._id,
            shippingAddress: {
              fullname,
              address,
              landmark,
              city,
              pincode,
              country,
            },
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }

      dispatch({
        type: 'SAVE_DELIVERY_ADDRESS',
        payload: {
          fullname,
          address,
          landmark,
          city,
          pincode,
          country,
        },
      });

      router.push(redirect || '/payment');
    } catch (err) {
      enqueueSnackbar(
        err.response.data ? err.response.data.message : err.message,
        {
          variant: 'error',
        }
      );
    }
  };
  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activestep={1} />
      <form className={classes.form} onSubmit={handleSubmit(submitHandler)}>
        <Typography componen="h1" variant="h1">
          Delivery Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullname"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullname"
                  label="Full Name"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.fullname)}
                  helperText={
                    errors.fullname
                      ? errors.fullname.type === 'minLength'
                        ? 'Full Name Should be more than 2 letters'
                        : 'Full Name is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="address"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === 'minLength'
                        ? 'Address Should be more than 5 letters'
                        : 'Address is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="landmark"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 4,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="landmark"
                  label="Land Mark"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.landmark)}
                  helperText={
                    errors.landmark
                      ? errors.landmark.type === 'minLength'
                        ? 'Land Mark Should be more than 2 letters'
                        : 'Land Mark is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="City"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === 'minLength'
                        ? 'City Should be more than 2 letters'
                        : 'City is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="pincode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 5,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="pincode"
                  label="pincode"
                  inputProps={{ type: 'number' }}
                  error={Boolean(errors.pincode)}
                  helperText={
                    errors.pincode
                      ? errors.pincode.type === 'minLength'
                        ? 'Please enter valid Pin code'
                        : 'Pin code is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="country"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="country"
                  label="country"
                  inputProps={{ type: 'text' }}
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country
                      ? errors.country.type === 'minLength'
                        ? 'Country Name Should be more than 2 letters'
                        : 'Country is required'
                      : ''
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Continue
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
