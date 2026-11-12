import { Button, Card, message } from 'antd';
import {
  CoffeeOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import {
  useAddToCartMutation,
  useSaveItemMutation,
} from '../../services/cartApi';
import { useAuth } from '../../hooks/useAuth';

const productArt = [
  { match: /headphone|audio/i, icon: CustomerServiceOutlined, tone: 'lilac' },
  { match: /shirt|cotton|clothing/i, icon: ShoppingOutlined, tone: 'peach' },
  { match: /backpack|bag/i, icon: ShoppingOutlined, tone: 'mint' },
  { match: /bottle|mug|coffee/i, icon: CoffeeOutlined, tone: 'butter' },
  { match: /organizer|home|desk/i, icon: HomeOutlined, tone: 'sky' },
];

function ProductCard({ product, showFullImage = false }) {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [addToCart, { isLoading: cartLoading }] = useAddToCartMutation();
  const [saveItem, { isLoading: saveLoading }] = useSaveItemMutation();
  const isClient = isLoggedIn && role === 'CLIENT';
  const normalizedPrice = Number(product.price);
  const art =
    productArt.find(({ match }) => match.test(product.name)) || {
      icon: GiftOutlined,
      tone: 'lilac',
    };
  const ProductIcon = art.icon;
  const imageUrl = product.imageUrl?.startsWith('/uploads/')
    ? new URL(
        product.imageUrl,
        import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      ).href
    : product.imageUrl;

  const handleAddToCart = async () => {
    if (!isClient) {
      navigate('/client');
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap();
      message.success('Added to your cart');
    } catch (error) {
      message.error(error?.data?.message || 'Could not add this item to your cart');
    }
  };

  const handleSave = async () => {
    if (!isClient) {
      navigate('/client');
      return;
    }

    try {
      await saveItem(product.id).unwrap();
      message.success('Saved for later');
    } catch (error) {
      message.error(error?.data?.message || 'Could not save this item');
    }
  };

  return (
    <Card className="market-product-card" hoverable>
      <div
        className={`market-product-art ${art.tone}${showFullImage ? ' product-details-art' : ''}`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} />
        ) : (
          <ProductIcon aria-hidden="true" />
        )}
        <Button
          className="market-save-button"
          shape="circle"
          aria-label={`Save ${product.name}`}
          icon={<HeartOutlined />}
          loading={saveLoading}
          onClick={handleSave}
        />
      </div>

      <div className="market-product-info">
        <Link className="market-product-name" to={`/shop/products/${product.id}`}>
          {product.name}
        </Link>
        <p className="market-product-description">
          {product.description || 'A useful find for everyday living.'}
        </p>
        <div className="market-product-price-row">
          <span className="market-product-price">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(normalizedPrice)}
          </span>
          <span className="market-stock">{product.quantity} left</span>
        </div>
        <Button
          className="market-add-button"
          block
          loading={cartLoading}
          disabled={product.quantity < 1}
          onClick={handleAddToCart}
        >
          Add to bag
        </Button>
      </div>
    </Card>
  );
}

export default ProductCard;
