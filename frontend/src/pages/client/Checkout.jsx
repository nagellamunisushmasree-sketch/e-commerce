import { Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery } from '../../services/cartApi';
import { useCreateOrderMutation } from '../../services/orderApi';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function Checkout() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetCartQuery();
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();

  const items = Array.isArray(data) ? data : data?.items || [];

  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.product?.price ?? item.price ?? 0) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      await createOrder({}).unwrap();

      message.success('Order placed successfully');
      navigate('/client/orders');
    } catch (error) {
      message.error(error?.data?.message || 'Order placement failed');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load checkout details.</p>;

  return (
    <Card>
      <Title level={2}>Checkout</Title>

      <p>Total Items: {items.length}</p>
      <Title level={3}>Total Amount: ₹{total}</Title>

      <Button
        type="primary"
        loading={placingOrder}
        disabled={!items.length}
        onClick={handleCheckout}
      >
        Place Order
      </Button>
    </Card>
  );
}

export default Checkout;