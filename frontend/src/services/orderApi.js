import { api } from './api';

export const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
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
  useCreateOrderMutation,
  useGetAdminSalesQuery,
} = orderApi;