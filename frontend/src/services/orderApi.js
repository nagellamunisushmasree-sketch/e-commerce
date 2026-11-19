import { api } from './api';

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),

    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),

    getAdminOrders: builder.query({
      query: () => '/orders/admin',
      providesTags: ['Order'],
    }),

    acceptOrder: builder.mutation({
      query: ({ id, deliveryDate }) => ({
        url: `/orders/${id}/accept`,
        method: 'PATCH',
        body: { deliveryDate },
      }),
      invalidatesTags: ['Order'],
    }),

    setOrderItemRating: builder.mutation({
      query: ({ orderId, itemId, rating, review }) => ({
        url: `/orders/${orderId}/items/${itemId}/rating`,
        method: 'PATCH',
        body: { rating, review },
      }),
      invalidatesTags: ['Order', 'Product'],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    getAdminSales: builder.query({
      query: () => '/sales/admin',
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetAdminOrdersQuery,
  useAcceptOrderMutation,
  useSetOrderItemRatingMutation,
  useCreateOrderMutation,
  useGetAdminSalesQuery,
} = orderApi;