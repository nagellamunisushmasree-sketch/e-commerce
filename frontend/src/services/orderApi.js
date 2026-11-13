import { api } from './api';

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),

    getAdminOrders: builder.query({
      query: () => '/orders/admin',
      providesTags: ['Order'],
    }),

    acceptOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Order'],
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
  useGetAdminOrdersQuery,
  useAcceptOrderMutation,
  useCreateOrderMutation,
  useGetAdminSalesQuery,
} = orderApi;