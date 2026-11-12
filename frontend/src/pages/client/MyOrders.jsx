import { Card, Table, Typography } from 'antd';
import { useGetMyOrdersQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function MyOrders() {
  const { data, isLoading, error } = useGetMyOrdersQuery();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load your orders.</p>;

  const orders = Array.isArray(data) ? data : data?.orders || [];

  const columns = [
    { title: 'Order ID', dataIndex: 'id' },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      render: (amount) => `₹${amount}`,
    },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  return (
    <Card>
      <Title level={2}>My Orders</Title>
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

export default MyOrders;