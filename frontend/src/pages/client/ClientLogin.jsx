import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useClientLoginMutation } from '../../services/authApi';

const { Title } = Typography;

function ClientLogin() {
  const navigate = useNavigate();
  const [clientLogin, { isLoading }] = useClientLoginMutation();

  const handleLogin = async (values) => {
    try {
      const result = await clientLogin(values).unwrap();

      if (result.role !== 'CLIENT') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        throw new Error('This account is not a client account');
      }

      message.success('Login successful');
      navigate('/client/home');
    } catch (error) {
      message.error(
        error?.data?.message || error.message || 'Login failed'
      );
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Client Login</Title>
        <p>Welcome to our store</p>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Enter username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Enter password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isLoading}
          >
            Client Login
          </Button>
        </Form>

        <p className="register-link">
          Don't have an account? <Link to="/client/register">Register</Link>
        </p>
      </Card>
    </div>
  );
}

export default ClientLogin;