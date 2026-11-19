import { Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import AdminSales from '../pages/admin/AdminSales';
import AdminOrders from '../pages/admin/AdminOrders';

import Login from '../pages/client/ClientLogin';
import ClientRegister from '../pages/client/ClientRegister';
import Home from '../pages/client/Home';
import ProductDetails from '../pages/client/ProductDetails';
import Cart from '../pages/client/Cart';
import SavedItems from '../pages/client/SavedItems';
import Checkout from '../pages/client/Checkout';
import MyOrders from '../pages/client/MyOrders';
import OrderTracking from '../pages/client/OrderTracking';

import AdminProtectedRoute from './AdminProtectedRoute';
import ClientProtectedRoute from './ClientProtectedRoute';

import AdminLayout from '../components/admin/AdminLayout';
import ClientLayout from '../components/client/ClientLayout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/client" element={<Navigate to="/login" replace />} />
      <Route path="/login/admin" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/client/login" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<ClientRegister />} />
      <Route path="/client/register" element={<Navigate to="/register" replace />} />

      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="sales" element={<AdminSales />} />
        </Route>
      </Route>

      <Route element={<ClientProtectedRoute />}>
        <Route path="/shop" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetails />} />
        </Route>
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="saved-items" element={<SavedItems />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id/track" element={<OrderTracking />} />
        </Route>
      </Route>

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;