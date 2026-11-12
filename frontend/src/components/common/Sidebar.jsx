import { Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

function Sidebar({ type = 'admin' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const adminItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Manage Products' },
    { key: '/admin/sales', icon: <BarChartOutlined />, label: 'Sales' },
  ];

  const clientItems = [
    { key: '/client/home', icon: <ShoppingOutlined />, label: 'Products' },
    { key: '/client/cart', icon: <ShoppingCartOutlined />, label: 'Cart' },
    { key: '/client/saved-items', icon: <HeartOutlined />, label: 'Saved Items' },
    { key: '/client/orders', icon: <FileTextOutlined />, label: 'My Orders' },
  ];

  return (
    <aside className="sidebar">
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={type === 'admin' ? adminItems : clientItems}
        onClick={({ key }) => navigate(key)}
      />
    </aside>
  );
}

export default Sidebar;