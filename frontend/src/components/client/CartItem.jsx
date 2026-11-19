import { Card, Button, InputNumber } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/productImageUrl';

function CartItem({ item, onRemove, onQuantityChange, onSaveForLater }) {
  const product = item.product;
  const productId = product?.id ?? item.productId;
  const productName = product?.name || item.name;
  const imageUrl = getProductImageUrl(product?.imageUrl);

  return (
    <Card className="cart-item">
      <div className="cart-item-content">
        <div className="cart-product-summary">
          <div className="cart-product-image">
            {imageUrl ? (
              <img src={imageUrl} alt={productName} />
            ) : (
              <GiftOutlined aria-hidden="true" />
            )}
          </div>
          <div className="cart-product-details">
            <h3>
              {productId ? (
                <Link
                  className="cart-product-link"
                  to={`/shop/products/${productId}`}
                  state={{
                    backTo: '/client/cart',
                    backLabel: 'Back to Cart',
                  }}
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </h3>
            <p>Price: ₹{product?.price ?? item.price}</p>
          </div>
        </div>

        <div className="cart-item-controls">
          <label className="cart-item-quantity">
            <span>Quantity</span>
            <InputNumber
              min={1}
              max={product?.quantity}
              value={item.quantity}
              onChange={(value) => {
                if (value) onQuantityChange(item.id, value);
              }}
            />
          </label>

          <Button onClick={() => onSaveForLater(item.id)}>Save for later</Button>

          <Button danger onClick={() => onRemove(item.id)}>
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default CartItem;
