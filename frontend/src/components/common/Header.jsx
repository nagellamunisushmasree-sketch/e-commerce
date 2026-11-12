import { Button } from 'antd';
import { ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const { logout, role } = useAuth();

  return (
    <header className="header">
      <h2>E-Commerce</h2>

      <div className="header-actions">
        {role === 'CLIENT' && (
          <Link to="/client/cart">
            <Button icon={<ShoppingCartOutlined />}>Cart</Button>
          </Link>
        )}

        <Button icon={<LogoutOutlined />} onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Header;