import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@material-ui/core';
import Layout from '../components/Layout';
import NextLink from 'next/link';
import db from '../utils/db';
import Product from '../models/Product';
import { Store } from '../utils/Store';
import { useContext } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

function Home({ products }) {
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    //const { data } = await axios.get(`/api/products/${product._id}`);
    const existingQuantity = state.cart.cartItems.find(
      (x) => x._id === product._id
    );
    const quantity = existingQuantity ? existingQuantity.quantity + 1 : 1;
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };

  return (
    <Layout>
      <div>
        <h1>Pizza</h1>
      </div>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item md={3} xs={6} key={product.name}>
            <Card>
              <NextLink href={`/product/${product.slug}`}>
                <CardActionArea>
                  <CardMedia
                    style={{
                      height: '250px',
                      position: 'relative',
                    }}
                    title={product.name}
                  >
                    <Image
                      src={product.image}
                      alt="Picture of the author"
                      layout="fill"
                    />
                  </CardMedia>
                </CardActionArea>
              </NextLink>
              <CardContent>
                <Typography>{product.name}</Typography>
              </CardContent>
              <CardActions>
                <Typography>Rs. {product.price}/-</Typography>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => addToCartHandler(product)}
                >
                  Add to Bag
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();

  return {
    props: {
      products: products.map(db.convertDocToObj),
    },
  };
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
