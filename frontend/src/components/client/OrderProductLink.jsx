import { GiftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/productImageUrl';

function OrderProductLink({
  product,
  to,
  backTo,
  backLabel = 'Back to Orders',
}) {
  const imageUrl = getProductImageUrl(product?.imageUrl);
  const details = (
    <div className="order-product-details">
      <div className="order-product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product?.name || 'Product'} />
        ) : (
          <GiftOutlined aria-hidden="true" />
        )}
      </div>
      <span>{product?.name || 'Product'}</span>
    </div>
  );

  if (!product?.id) return details;

  return (
    <Link
      className="order-product-link"
      to={to || `/shop/products/${product.id}`}
      state={!to && backTo ? { backTo, backLabel } : undefined}
    >
      {details}
    </Link>
  );
}

export default OrderProductLink;
