import { Card, Button, InputNumber } from 'antd';

function CartItem({ item, onRemove, onQuantityChange, onSaveForLater }) {
  return (
    <Card className="cart-item">
      <div className="cart-item-content">
        <div>
          <h3>{item.product?.name || item.name}</h3>
          <p>Price: ₹{item.product?.price ?? item.price}</p>
        </div>

        <InputNumber
          min={1}
          max={item.product?.quantity}
          value={item.quantity}
          onChange={(value) => {
            if (value) onQuantityChange(item.id, value);
          }}
        />

        <Button onClick={() => onSaveForLater(item.id)}>Save for later</Button>

        <Button danger onClick={() => onRemove(item.id)}>
          Remove
        </Button>
      </div>
    </Card>
  );
}

export default CartItem;
