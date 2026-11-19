import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const endpointRoles = {
  getProducts: 'CLIENT',
  getProductById: 'CLIENT',
  getCart: 'CLIENT',
  addToCart: 'CLIENT',
  updateCartItem: 'CLIENT',
  saveCartItemForLater: 'CLIENT',
  removeFromCart: 'CLIENT',
  getSavedItems: 'CLIENT',
  saveItem: 'CLIENT',
  getMyOrders: 'CLIENT',
  setOrderItemRating: 'CLIENT',
  getProfile: 'CLIENT',
  createOrder: 'CLIENT',
  getAddresses: 'CLIENT',
  createAddress: 'CLIENT',
  deleteAddress: 'CLIENT',
  getAdminProducts: 'ADMIN',
  uploadProductImage: 'ADMIN',
  addProduct: 'ADMIN',
  updateProduct: 'ADMIN',
  deleteProduct: 'ADMIN',
  getAdminOrders: 'ADMIN',
  acceptOrder: 'ADMIN',
  getAdminSales: 'ADMIN',
};

const fetchBase = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const roleAwareBaseQuery = (args, api, extraOptions) => {
  const requiredRole = endpointRoles[api.endpoint];
  // here the api.endpoint fetch the currently being called

  if (requiredRole && localStorage.getItem('role') !== requiredRole) {
    return {
      error: {
        status: 403,
        data: {
          message: `This API is only available to ${requiredRole.toLowerCase()} accounts.`,
        },
      },
    };
  }

  return fetchBase(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: roleAwareBaseQuery,

  tagTypes: ['Product', 'Cart', 'Order', 'SavedItems', 'Address'],

  endpoints: () => ({}),
});