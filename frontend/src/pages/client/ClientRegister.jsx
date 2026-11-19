import { Form, Input, Button, Card, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useClientRegisterMutation } from '../../services/authApi';

const { Title } = Typography;

function ClientRegister() {
  const navigate = useNavigate();
  const [registerClient, { isLoading }] = useClientRegisterMutation();

  const handleRegister = async (values) => {
    try {
      await registerClient(values).unwrap();

      message.success('Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      message.error(error?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Client Registration</Title>

        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Enter username' }]}
          >
            <Input placeholder="Enter username" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Enter password' },
              { min: 6, message: 'Password must have at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
          >
            Register
          </Button>
        </Form>

        <p className="register-link">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </Card>
    </div>
  );
}

export default ClientRegister;