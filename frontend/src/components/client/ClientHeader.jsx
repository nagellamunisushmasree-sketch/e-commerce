import { Avatar, Button, Popover, Typography } from 'antd';
import {
  FileTextOutlined,
  HeartOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGetProfileQuery } from '../../services/authApi';

function ClientHeader() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout, isLoggedIn, role, username: savedUsername } = useAuth();
  const isClient = isLoggedIn && role === 'CLIENT';
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isClient });
  const username = profile?.username || savedUsername || 'Client';

  return (
    <header className="market-header">
      <Link to="/shop" className="market-brand" aria-label="Shoply home">
        <span className="market-brand-mark">
          <ShopOutlined />
        </span>
        <span>shoply</span>
      </Link>

      {!isClient && (
        <nav className="market-nav" aria-label="Shopping navigation">
          <NavLink to="/shop">Discover</NavLink>
          <NavLink to="/client/cart">
            <ShoppingCartOutlined />
            <span>Cart</span>
          </NavLink>
        </nav>
      )}

      {isClient ? (
        <div className="market-user-actions">
          <Popover
            title="Profile"
            trigger="click"
            placement="bottomRight"
            open={profileOpen}
            onOpenChange={setProfileOpen}
            content={
              <div className="market-profile-popover">
                <div className="market-profile-identity">
                  <Avatar size={40} icon={<UserOutlined />} />
                  <div>
                    <Typography.Text type="secondary">Username</Typography.Text>
                    <Typography.Text strong>{username}</Typography.Text>
                  </div>
                </div>
                <nav className="market-profile-nav" aria-label="Shopping navigation">
                  <NavLink to="/shop" onClick={() => setProfileOpen(false)}>
                    <ShopOutlined />
                    <span>Discover</span>
                  </NavLink>
                  <NavLink
                    to="/client/saved-items"
                    onClick={() => setProfileOpen(false)}
                  >
                    <HeartOutlined />
                    <span>Saved</span>
                  </NavLink>
                  <NavLink to="/client/orders" onClick={() => setProfileOpen(false)}>
                    <FileTextOutlined />
                    <span>Orders</span>
                  </NavLink>
                  <NavLink to="/client/cart" onClick={() => setProfileOpen(false)}>
                    <ShoppingCartOutlined />
                    <span>Cart</span>
                  </NavLink>
                </nav>
              </div>
            }
          >
            <button
              type="button"
              className="market-user-profile"
              aria-label={`View profile for ${username}`}
            >
              <Avatar size="small" icon={<UserOutlined />} />
              <span>{username}</span>
            </button>
          </Popover>
          <Button
            className="market-logout"
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      ) : (
        <Button className="market-login" type="primary" href="/client">
          Login / Join
        </Button>
      )}
    </header>
  );
}

export default ClientHeader;
