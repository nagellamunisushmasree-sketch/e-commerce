import { useParams } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { useGetProductByIdQuery } from '../../services/productApi';
import ProductCard from '../../components/client/ProductCard';
import Loader from '../../components/common/Loader';

const { Title } = Typography;

function ProductDetails() {
  const { id } = useParams();

  const { data: product, isLoading, error } = useGetProductByIdQuery(id);

  if (isLoading) return <Loader />;
  if (error || !product) return <p>Product not found.</p>;

  return (
    <Card className="product-details-view">
      <Title level={2}>Product Details</Title>
      <ProductCard product={product} showFullImage />
    </Card>
  );
}

export default ProductDetails;