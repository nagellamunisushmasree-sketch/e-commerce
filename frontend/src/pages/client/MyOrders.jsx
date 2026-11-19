import { Card, Table, Typography } from 'antd';
import { useGetMyOrdersQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';
import { getOrderStatusLabel } from '../../utils/orderStatus';
import OrderProductLink from '../../components/client/OrderProductLink';

const { Title } = Typography;

function formatDeliveryDate(value) {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

function MyOrders() {
  const { data, isLoading, error } = useGetMyOrdersQuery(undefined, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });
  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load your orders.</p>;

  const orders = Array.isArray(data) ? data : data?.orders || [];

  const columns = [
    {
      title: 'Products',
      render: (_, order) => (
        <div className="order-product-list">
          {(order.items || []).map((item) =>
            <OrderProductLink
              key={item.id}
              product={item.product}
              to={`/client/orders/${order.id}/track`}
            />,
          )}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (amount) => `₹${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: getOrderStatusLabel,
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'deliveryDate',
      render: (date) => formatDeliveryDate(date) || 'Not set',
    },
  ];

  return (
    <Card>
      <Title level={2}>My Orders</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
      />
    </Card>
  );
}

export default MyOrders;
