import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import AdminSales from '../pages/admin/AdminSales';
import AdminOrders from '../pages/admin/AdminOrders';

import ClientLogin from '../pages/client/ClientLogin';
import ClientRegister from '../pages/client/ClientRegister';
import Home from '../pages/client/Home';
import ProductDetails from '../pages/client/ProductDetails';
import Cart from '../pages/client/Cart';
import SavedItems from '../pages/client/SavedItems';
import Checkout from '../pages/client/Checkout';
import MyOrders from '../pages/client/MyOrders';

import AdminProtectedRoute from './AdminProtectedRoute';
import ClientProtectedRoute from './ClientProtectedRoute';

import AdminLayout from '../components/admin/AdminLayout';
import ClientLayout from '../components/client/ClientLayout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/shop" replace />} />

      {/* Public marketplace */}
      <Route path="/shop" element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="products/:id" element={<ProductDetails />} />
      </Route>

      {/* Admin login (both /admin and /admin/login) */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin pages */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="sales" element={<AdminSales />} />
        </Route>
      </Route>

      {/* Client login and registration */}
      <Route path="/client" element={<ClientLogin />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/client/register" element={<ClientRegister />} />

      {/* Protected client pages */}
      <Route element={<ClientProtectedRoute />}>
        <Route path="/client" element={<ClientLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="saved-items" element={<SavedItems />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;