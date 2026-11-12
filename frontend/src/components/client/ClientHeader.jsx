import { Button } from 'antd';
import {
  HeartOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function ClientHeader() {
  const { logout, isLoggedIn, role } = useAuth();
  const isClient = isLoggedIn && role === 'CLIENT';

  return (
    <header className="market-header">
      <Link to="/shop" className="market-brand" aria-label="Shoply home">
        <span className="market-brand-mark">
          <ShopOutlined />
        </span>
        <span>shoply</span>
      </Link>

      <nav className="market-nav" aria-label="Shopping navigation">
        <Link to="/shop">Discover</Link>
        {isClient && (
          <>
            <Link to="/client/saved-items">
              <HeartOutlined />
              <span>Saved</span>
            </Link>
            <Link to="/client/orders">Orders</Link>
          </>
        )}
        <Link to="/client/cart">
          <ShoppingCartOutlined />
          <span>Cart</span>
        </Link>
      </nav>

      {isClient ? (
        <Button
          className="market-logout"
          type="text"
          icon={<LogoutOutlined />}
          onClick={logout}
        >
          Logout
        </Button>
      ) : (
        <Button className="market-login" type="primary" href="/client">
          Login / Join
        </Button>
      )}
    </header>
  );
}

export default ClientHeader;
