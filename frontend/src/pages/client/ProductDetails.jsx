import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Input, Rate, Space, Typography, message } from 'antd';
import { useGetProductByIdQuery } from '../../services/productApi';
import { useSetOrderItemRatingMutation } from '../../services/orderApi';
import ProductCard from '../../components/client/ProductCard';
import Loader from '../../components/common/Loader';

const { Paragraph, Text, Title } = Typography;

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [ratingDraft, setRatingDraft] = useState(0);
  const [reviewDraft, setReviewDraft] = useState('');

  const { data: product, isLoading, error } = useGetProductByIdQuery(id);
  const [setOrderItemRating, { isLoading: savingReview }] =
    useSetOrderItemRatingMutation();

  const startEditingReview = (review) => {
    setEditingReviewId(review.orderItemId);
    setRatingDraft(review.rating);
    setReviewDraft(review.review || '');
  };

  const saveReview = async (review) => {
    const trimmedReview = reviewDraft.trim();

    if (!ratingDraft || !trimmedReview) {
      message.warning('Enter a rating and review before saving');
      return;
    }

    try {
      await setOrderItemRating({
        orderId: review.orderId,
        itemId: review.orderItemId,
        rating: ratingDraft,
        review: trimmedReview,
      }).unwrap();
      message.success('Review updated');
      setEditingReviewId(null);
    } catch (requestError) {
      message.error(
        requestError?.data?.message || 'Unable to update this review',
      );
    }
  };

  if (isLoading) return <Loader />;
  if (error || !product) return <p>Product not found.</p>;

  return (
    <Card className="product-details-view">
      {location.state?.backTo && (
        <Button
          type="link"
          onClick={() => navigate(location.state.backTo)}
        >
          {location.state.backLabel || 'Back to Orders'}
        </Button>
      )}
      <Title level={2}>Product Details</Title>
      <ProductCard product={product} showFullImage />
      <section className="product-reviews">
        <Title level={3}>Ratings & Reviews</Title>
        {product.ratingCount ? (
          <>
            <div className="product-rating-summary">
              <Rate
                disabled
                allowHalf
                value={Number(product.averageRating)}
              />
              <Text>
                {Number(product.averageRating).toFixed(1)} from{' '}
                {product.ratingCount}{' '}
                {product.ratingCount === 1 ? 'review' : 'reviews'}
              </Text>
            </div>
            <div className="product-review-list">
              {product.reviews.map((review, index) => {
                const isEditing = editingReviewId === review.orderItemId;

                return (
                <Card
                  key={`${review.createdAt}-${index}`}
                  size="small"
                  className="product-review-card"
                >
                  <div className="product-review-heading">
                    <Text strong>Verified purchase</Text>
                    <Text type="secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                  {isEditing ? (
                    <div className="product-review-editor">
                      <Rate
                        value={ratingDraft}
                        allowClear={false}
                        onChange={setRatingDraft}
                      />
                      <Input.TextArea
                        value={reviewDraft}
                        maxLength={2000}
                        showCount
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        onChange={(event) => setReviewDraft(event.target.value)}
                      />
                      <Space>
                        <Button
                          type="primary"
                          loading={savingReview}
                          onClick={() => saveReview(review)}
                        >
                          Update review
                        </Button>
                        <Button onClick={() => setEditingReviewId(null)}>
                          Cancel
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <>
                      <Rate disabled value={review.rating} />
                      <Paragraph>
                        {review.review || 'No written review provided.'}
                      </Paragraph>
                      {review.canEdit && (
                        <Button
                          type="link"
                          onClick={() => startEditingReview(review)}
                        >
                          Edit review
                        </Button>
                      )}
                    </>
                  )}
                </Card>
                );
              })}
            </div>
          </>
        ) : (
          <Empty description="No reviews yet" />
        )}
      </section>
    </Card>
  );
}

export default ProductDetails;