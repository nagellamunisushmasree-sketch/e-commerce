import { Card, Table, Typography } from 'antd';
import { useGetAdminSalesQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function AdminSales() {
  const { data, isLoading, error } = useGetAdminSalesQuery();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load sales.</p>;

  const sales = data?.sales || [];

  const columns = [
    { title: 'Order ID', dataIndex: ['order', 'id'] },
    { title: 'Product', dataIndex: ['product', 'name'] },
    { title: 'Quantity', dataIndex: 'quantity' },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      render: (amount) => `₹${amount}`,
    },
    { title: 'Status', dataIndex: ['order', 'status'] },
    {
      title: 'Date',
      dataIndex: ['order', 'createdAt'],
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  return (
    <Card>
      <Title level={2}>Admin Sales</Title>
      <Table rowKey="id" columns={columns} dataSource={sales} />
    </Card>
  );
}

export default AdminSales;