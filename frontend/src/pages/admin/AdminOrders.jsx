import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Modal,
  Table,
  Typography,
  message,
} from 'antd';
import { useAcceptOrderMutation, useGetAdminOrdersQuery } from '../../services/orderApi';
import Loader from '../../components/common/Loader';
import { getOrderStatusLabel } from '../../utils/orderStatus';

const { Title } = Typography;

function AdminOrders() {
  const [orderToAccept, setOrderToAccept] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const { data = [], isLoading, error } = useGetAdminOrdersQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const [acceptOrder, { isLoading: accepting }] = useAcceptOrderMutation();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load orders.</p>;

  const orders = Array.isArray(data) ? data : data?.orders || [];

  const handleAccept = async () => {
    if (!orderToAccept || !deliveryDate) return;

    try {
      await acceptOrder({
        id: orderToAccept.id,
        deliveryDate: deliveryDate.format('YYYY-MM-DD'),
      }).unwrap();
      message.success('Order accepted and delivery date set');
      setOrderToAccept(null);
      setDeliveryDate(null);
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
      title: 'Expected Delivery',
      dataIndex: 'deliveryDate',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'Set on acceptance'),
    },
    {
      title: 'Action',
      render: (_, order) =>
        order.status === 'PENDING' ? (
          <Button
            type="primary"
            onClick={() => {
              setOrderToAccept(order);
              setDeliveryDate(null);
            }}
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
        message="Set an expected delivery date when accepting an order. Customers can see it in their order tracker."
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        pagination={{
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
        }}
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
      <Modal
        title={`Accept order${orderToAccept ? ` #${orderToAccept.id}` : ''}`}
        open={Boolean(orderToAccept)}
        okText="Accept order"
        confirmLoading={accepting}
        okButtonProps={{ disabled: !deliveryDate }}
        onOk={handleAccept}
        onCancel={() => {
          setOrderToAccept(null);
          setDeliveryDate(null);
        }}
      >
        <p>Select the expected delivery date for this order.</p>
        <DatePicker
          value={deliveryDate}
          format="DD/MM/YYYY"
          disabledDate={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date && date.toDate() < today;
          }}
          onChange={setDeliveryDate}
          style={{ marginTop: 16, width: '100%' }}
        />
      </Modal>
    </Card>
  );
}

export default AdminOrders;
