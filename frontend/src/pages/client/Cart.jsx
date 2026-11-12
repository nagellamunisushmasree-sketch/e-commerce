import { Button, Card, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useSaveCartItemForLaterMutation,
} from '../../services/cartApi';
import CartItem from '../../components/client/CartItem';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function Cart() {
  const { data, isLoading, error } = useGetCartQuery();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [saveCartItemForLater] = useSaveCartItemForLaterMutation();

  const cartItems = Array.isArray(data) ? data : data?.items || [];

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id).unwrap();
      message.success('Item removed');
    } catch (error) {
      message.error(error?.data?.message || 'Unable to remove item');
    }
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      await updateCartItem({ id, quantity }).unwrap();
    } catch (error) {
      message.error(error?.data?.message || 'Unable to update quantity');
    }
  };

  const handleSaveForLater = async (id) => {
    try {
      await saveCartItemForLater(id).unwrap();
      message.success('Moved to saved items');
    } catch (error) {
      message.error(error?.data?.message || 'Unable to save item');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load cart.</p>;

  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.product?.price ?? item.price ?? 0) * item.quantity,
    0
  );

  return (
    <>
      <Title level={2}>My Cart</Title>

      {cartItems.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={handleRemove}
          onQuantityChange={handleQuantityChange}
          onSaveForLater={handleSaveForLater}
        />
      ))}

      <Card style={{ marginTop: 20 }}>
        <Title level={4}>Total: ₹{total}</Title>

        <Link to="/client/checkout">
          <Button type="primary" disabled={!cartItems.length}>
            Proceed to Checkout
          </Button>
        </Link>
      </Card>
    </>
  );
}

export default Cart;