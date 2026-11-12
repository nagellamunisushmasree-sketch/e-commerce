import { Row, Col, Typography, Empty } from 'antd';
import { useGetSavedItemsQuery } from '../../services/cartApi';
import ProductCard from '../../components/client/ProductCard';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function SavedItems() {
  const { data, isLoading, error } = useGetSavedItemsQuery();

  if (isLoading) return <Loader />;
  if (error) return <p>Unable to load saved items.</p>;

  const items = Array.isArray(data) ? data : data?.items || [];

  return (
    <>
      <Title level={2}>Saved Items</Title>

      <Row gutter={[16, 16]}>
        {items.map((item) => {
          const product = item.product || item;

          return (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <ProductCard product={product} />
            </Col>
          );
        })}
      </Row>

      {items.length === 0 && <Empty description="No saved items" />}
    </>
  );
}

export default SavedItems;