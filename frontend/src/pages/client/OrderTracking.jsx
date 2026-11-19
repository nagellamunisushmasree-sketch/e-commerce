import {
  Alert,
  Button,
  Card,
  Input,
  Rate,
  Steps,
  Table,
  Typography,
  message,
} from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetOrderByIdQuery,
  useSetOrderItemRatingMutation,
} from '../../services/orderApi';
import Loader from '../../components/common/Loader';
import OrderProductLink from '../../components/client/OrderProductLink';
import { getOrderStatusLabel } from '../../utils/orderStatus';

const { Title } = Typography;
const trackingStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function formatDateTime(value) {
  if (!value) return 'Waiting for admin';
  return new Date(value).toLocaleString();
}

function formatDeliveryDate(value) {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [editingItemIds, setEditingItemIds] = useState({});
  const { data: order, isLoading, error } = useGetOrderByIdQuery(id, {
    pollingInterval: 10000,
    skipPollingIfUnfocused: true,
  });
  const [setOrderItemRating, { isLoading: savingRating }] =
    useSetOrderItemRatingMutation();

  const handleSaveRating = async (item) => {
    const rating = ratingDrafts[item.id] ?? item.rating;
    const review = (reviewDrafts[item.id] ?? item.review ?? '').trim();

    if (!rating) {
      message.warning('Select a star rating');
      return;
    }

    if (!review) {
      message.warning('Write a review before submitting');
      return;
    }

    try {
      await setOrderItemRating({
        orderId: order.id,
        itemId: item.id,
        rating,
        review,
      }).unwrap();
      message.success('Rating and review saved');
      setEditingItemIds((items) => ({ ...items, [item.id]: false }));
    } catch (requestError) {
      message.error(
        requestError?.data?.message || 'Unable to save rating and review',
      );
    }
  };

  if (isLoading) return <Loader />;
  if (error || !order) {
    return <Alert type="error" showIcon message="Unable to load order tracking." />;
  }

  const statusIndex = trackingStatuses.indexOf(order.status);
  const deliveryDate = formatDeliveryDate(order.deliveryDate);
  const productColumns = [
    {
      title: 'Product',
      render: (_, item) => (
        <OrderProductLink
          product={item.product}
          backTo={`/client/orders/${order.id}/track`}
          backLabel="Back to Order Tracking"
        />
      ),
    },
    { title: 'Quantity', dataIndex: 'quantity' },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      render: (amount) => `₹${amount}`,
    },
    {
      title: 'Rating & Review',
      dataIndex: 'rating',
      render: (rating, item) => {
        if (order.status !== 'DELIVERED') {
          return (
            <Typography.Text type="secondary">
              {order.status === 'CANCELLED'
                ? 'Unavailable for cancelled orders'
                : 'Available after delivery'}
            </Typography.Text>
          );
        }

        const isEditing = !rating || editingItemIds[item.id];

        return (
          <div className="order-item-rating">
            {isEditing ? (
              <>
                <Rate
                  value={ratingDrafts[item.id] ?? rating ?? 0}
                  allowClear={false}
                  onChange={(value) =>
                    setRatingDrafts((drafts) => ({
                      ...drafts,
                      [item.id]: value,
                    }))
                  }
                />
                <Input.TextArea
                  value={reviewDrafts[item.id] ?? item.review ?? ''}
                  maxLength={2000}
                  showCount
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  placeholder="Write your review"
                  onChange={(event) =>
                    setReviewDrafts((drafts) => ({
                      ...drafts,
                      [item.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  size="small"
                  type="primary"
                  loading={savingRating}
                  onClick={() => handleSaveRating(item)}
                >
                  {rating ? 'Update review' : 'Submit review'}
                </Button>
              </>
            ) : (
              <>
                <Rate disabled value={rating} />
                <Typography.Paragraph className="order-item-review-comment">
                  {item.review || 'No written review provided.'}
                </Typography.Paragraph>
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    setEditingItemIds((items) => ({
                      ...items,
                      [item.id]: true,
                    }))
                  }
                >
                  Edit review
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="order-tracking-page">
      <Button type="link" onClick={() => navigate('/client/orders')}>
        Back to My Orders
      </Button>
      <Title level={2}>Track Order</Title>
      <p>
        Order #{order.id} · {getOrderStatusLabel(order.status)}
      </p>
      {order.status === 'CANCELLED' ? (
        <Alert type="error" showIcon message="This order was cancelled." />
      ) : (
        <Card size="small" className="order-tracking-card" title="Order tracking">
          <Steps
            current={Math.min(2, Math.max(0, statusIndex))}
            status={order.status === 'DELIVERED' ? 'finish' : 'process'}
            size="small"
            responsive
            items={[
              {
                title: 'Placed',
                description: formatDateTime(order.createdAt),
              },
              {
                title: 'Accepted',
                description: order.acceptedAt
                  ? formatDateTime(order.acceptedAt)
                  : order.status === 'PENDING'
                    ? 'Waiting for admin'
                    : 'Accepted',
              },
              {
                title: 'Expected delivery',
                description: deliveryDate ? `By ${deliveryDate}` : 'Date not set',
              },
            ]}
          />
        </Card>
      )}
      <Title level={4}>Products</Title>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        dataSource={order.items || []}
        columns={productColumns}
      />
    </Card>
  );
}

export default OrderTracking;
