import { Card, Col, Row, Typography } from 'antd';
import { useGetAdminSalesQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function AdminDashboard() {
  const { data, isLoading, error } = useGetAdminSalesQuery();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load sales information.</p>;

  const totalOrders = data?.totalOrders ?? 0;
  const totalSales = data?.totalSales ?? 0;

  return (
    <>
      <Title level={2}>Admin Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Total Orders">{totalOrders}</Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Total Sales">₹{totalSales}</Card>
        </Col>
      </Row>
    </>
  );
}

export default AdminDashboard;