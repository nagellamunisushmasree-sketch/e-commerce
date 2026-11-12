import { Form, Input, Button, Card, Typography, message } from 'antd';
import { KeyOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminRegisterMutation } from '../../services/authApi';

const { Title } = Typography;

function AdminRegister() {
  const navigate = useNavigate();
  const [registerAdmin, { isLoading }] = useAdminRegisterMutation();

  const handleRegister = async (values) => {
    try {
      await registerAdmin(values).unwrap();
      message.success('Admin account created. Please sign in.');
      navigate('/admin/login');
    } catch (error) {
      const errorMessage = error?.data?.message || 'Admin registration failed';
      message.error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Admin Registration</Title>
        <p>Register with your private setup code</p>

        <Form layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Enter username' },
              { min: 3, message: 'Username must have at least 3 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Enter password' },
              { min: 6, message: 'Password must have at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="At least 6 characters"
              size="large"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Admin setup code"
            name="setupCode"
            rules={[{ required: true, message: 'Enter the private setup code' }]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="Enter setup code"
              size="large"
              autoComplete="off"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
            Create Admin Account
          </Button>
        </Form>

        <p className="register-link">
          Already registered? <Link to="/admin/login">Admin login</Link>
        </p>
      </Card>
    </div>
  );
}

export default AdminRegister;
