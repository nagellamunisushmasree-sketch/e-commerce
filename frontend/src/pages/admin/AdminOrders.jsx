import { Alert, Button, Card, Table, Typography, message } from 'antd';
import { useAcceptOrderMutation, useGetAdminOrdersQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';
import { getOrderStatusLabel } from '../../utils/orderStatus';

const { Title } = Typography;

function AdminOrders() {
  const { data = [], isLoading, error } = useGetAdminOrdersQuery();
  const [acceptOrder, { isLoading: accepting }] = useAcceptOrderMutation();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load orders.</p>;

  const orders = Array.isArray(data) ? data : data?.orders || [];

  const handleAccept = async (orderId) => {
    try {
      await acceptOrder(orderId).unwrap();
      message.success('Order accepted');
    } catch (requestError) {
      message.error(
        requestError?.data?.message || 'Unable to accept this order',
      );
    }
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'id' },
    { title: 'Client', dataIndex: ['user', 'username'] },
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
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Action',
      render: (_, order) =>
        order.status === 'PENDING' ? (
          <Button
            type="primary"
            loading={accepting}
            onClick={() => handleAccept(order.id)}
          >
            Accept
          </Button>
        ) : null,
    },
  ];

  return (
    <Card>
      <Title level={2}>Orders</Title>
      <Alert
        type="info"
        showIcon
        message="Accepting an order updates the status for the customer's entire order."
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        expandable={{
          expandedRowRender: (order) => (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={order.items || []}
              columns={[
                { title: 'Product', dataIndex: ['product', 'name'] },
                { title: 'Quantity', dataIndex: 'quantity' },
                {
                  title: 'Unit Price',
                  dataIndex: 'unitPrice',
                  render: (amount) => `₹${amount}`,
                },
              ]}
            />
          ),
        }}
      />
    </Card>
  );
}

export default AdminOrders;
