import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginMutation } from '../../services/authApi';

const { Title } = Typography;

function AdminLogin() {
  const navigate = useNavigate();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (values) => {
    try {
      setErrorMessage('');

      const result = await adminLogin(values).unwrap();

      if (result.role !== 'ADMIN') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        throw new Error('This account is not an admin account');
      }

      message.success('Admin login successful');
      navigate('/admin/dashboard');
    } catch (error) {
      setErrorMessage(
        error?.data?.message || error.message || 'Login failed'
      );
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Admin Login</Title>
        <p>Login to manage your store</p>

        <Form
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{
            username: import.meta.env.VITE_DEFAULT_ADMIN_USERNAME || 'admin',
            password: import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD || '',
          }}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Enter username' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Enter password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          {errorMessage && <p className="error">{errorMessage}</p>}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={isLoading}
          >
            Admin Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default AdminLogin;