import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Popconfirm,
  Radio,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from '../../services/addressesApi';
import { useGetCartQuery } from '../../services/cartApi';
import { useCreateOrderMutation } from '../../services/orderApi';
import Loader from '../../components/common/Loader';

const { Title, Text } = Typography;

function Checkout() {
  const navigate = useNavigate();
  const [addressForm] = Form.useForm();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const { data: cartData, isLoading: cartLoading, error: cartError } = useGetCartQuery();
  const {
    data: addressData,
    isLoading: addressesLoading,
    error: addressesError,
  } = useGetAddressesQuery();
  const [createAddress, { isLoading: savingAddress }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();

  const items = Array.isArray(cartData) ? cartData : cartData?.items || [];
  const addresses = Array.isArray(addressData) ? addressData : [];
  const activeAddressId = selectedAddressId ?? addresses[0]?.id;
  const showAddressForm = isAddingAddress || addresses.length === 0;
  const total = items.reduce(
    (sum, item) =>
      sum + Number(item.product?.price ?? item.price ?? 0) * item.quantity,
    0,
  );

  const handleAddAddress = async (values) => {
    try {
      const address = await createAddress(values).unwrap();
      setSelectedAddressId(address.id);
      setIsAddingAddress(false);
      addressForm.resetFields();
      message.success('Address saved');
    } catch (error) {
      message.error(error?.data?.message || 'Unable to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id).unwrap();
      if (selectedAddressId === id) {
        setSelectedAddressId(addresses.find((address) => address.id !== id)?.id ?? null);
      }
      message.success('Address removed');
    } catch (error) {
      message.error(error?.data?.message || 'Unable to remove address');
    }
  };

  const handleCheckout = async () => {
    if (!activeAddressId) {
      message.error('Add or select a delivery address first');
      return;
    }

    try {
      await createOrder({ addressId: activeAddressId }).unwrap();
      message.success('Order placed successfully');
      navigate('/client/orders');
    } catch (error) {
      message.error(error?.data?.message || 'Order placement failed');
    }
  };

  if (cartLoading || addressesLoading) return <Loader />;
  if (cartError) return <p>Unable to load checkout details.</p>;
  if (addressesError) return <p>Unable to load saved addresses.</p>;

  return (
    <>
      <Title level={2}>Checkout</Title>

      <Row gutter={[20, 20]} align="top">
        <Col xs={24} lg={14}>
          <Card title="Delivery address">
            {addresses.length > 0 && (
              <Radio.Group
                className="checkout-address-list"
                value={activeAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
              >
                <Space direction="vertical" size="middle" className="checkout-address-space">
                  {addresses.map((address) => (
                    <Card
                      key={address.id}
                      size="small"
                      className="checkout-address-card"
                    >
                      <div className="checkout-address-row">
                        <Radio value={address.id}>
                          <span className="checkout-address-details">
                            <strong>{address.recipientName}</strong>
                            <span>{address.phone}</span>
                            <span>
                              {address.streetAddress}, {address.city}, {address.state}{' '}
                              {address.postalCode}
                            </span>
                          </span>
                        </Radio>
                        <Popconfirm
                          title="Remove this saved address?"
                          onConfirm={() => handleDeleteAddress(address.id)}
                        >
                          <Button type="link" danger>
                            Remove
                          </Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>
            )}

            {addresses.length > 0 && !isAddingAddress && (
              <Button
                className="checkout-add-address"
                onClick={() => setIsAddingAddress(true)}
              >
                Add another address
              </Button>
            )}

            {showAddressForm && (
              <Card
                size="small"
                title={addresses.length ? 'Add a new address' : 'Add a delivery address'}
                className="checkout-address-form-card"
              >
                <Form
                  form={addressForm}
                  layout="vertical"
                  onFinish={handleAddAddress}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Recipient name"
                        name="recipientName"
                        rules={[{ required: true, message: 'Enter the recipient name' }]}
                      >
                        <Input autoComplete="name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Phone"
                        name="phone"
                        rules={[{ required: true, message: 'Enter a phone number' }]}
                      >
                        <Input autoComplete="tel" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Street address"
                        name="streetAddress"
                        rules={[{ required: true, message: 'Enter the street address' }]}
                      >
                        <Input.TextArea rows={2} autoComplete="street-address" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="City"
                        name="city"
                        rules={[{ required: true, message: 'Enter the city' }]}
                      >
                        <Input autoComplete="address-level2" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="State"
                        name="state"
                        rules={[{ required: true, message: 'Enter the state' }]}
                      >
                        <Input autoComplete="address-level1" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Postal code"
                        name="postalCode"
                        rules={[{ required: true, message: 'Enter the postal code' }]}
                      >
                        <Input autoComplete="postal-code" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Space>
                    <Button type="primary" htmlType="submit" loading={savingAddress}>
                      Save address
                    </Button>
                    {addresses.length > 0 && (
                      <Button onClick={() => setIsAddingAddress(false)}>
                        Cancel
                      </Button>
                    )}
                  </Space>
                </Form>
              </Card>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Order summary">
            {items.length === 0 ? (
              <Alert type="info" message="Your cart is empty." showIcon />
            ) : (
              <Space direction="vertical" size="small" className="checkout-summary">
                {items.map((item) => (
                  <div className="checkout-summary-item" key={item.id}>
                    <Text>
                      {item.product?.name || item.name} × {item.quantity}
                    </Text>
                    <Text>
                      ₹
                      {(
                        Number(item.product?.price ?? item.price ?? 0) *
                        item.quantity
                      ).toFixed(2)}
                    </Text>
                  </div>
                ))}
                <div className="checkout-summary-total">
                  <Text strong>Total</Text>
                  <Title level={4}>₹{total.toFixed(2)}</Title>
                </div>
              </Space>
            )}

            <Button
              type="primary"
              block
              loading={placingOrder}
              disabled={!items.length || !activeAddressId}
              onClick={handleCheckout}
            >
              Place Order
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Checkout;
