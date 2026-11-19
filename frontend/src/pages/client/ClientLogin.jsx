import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../services/authApi';

const { Title } = Typography;

function ClientLogin() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  //isloading is used to indicates whether the API request is curenntly running

  const handleLogin = async (values) => {
    try {
      const result = await login(values).unwrap();
      //unwarp() it returns when it successfully response direclty or throws an error if the request fails 
      const isAdmin = result.role === 'ADMIN';
      message.success(`${isAdmin ? 'Admin' : 'Client'} login successful`);
      navigate(isAdmin ? '/admin/dashboard' : '/client/home', { replace: true });
    } catch (error) {
      message.error(
        error?.data?.message || error.message || 'Login failed'
      );
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2}>Login</Title>
        <p>Sign in to continue to your account</p>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          {/* //layout="vertical" displays the labels above input    */}
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
            Login
          </Button>
        </Form>

        <p className="register-link">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </Card>
    </div>
  );
}

export default ClientLogin;