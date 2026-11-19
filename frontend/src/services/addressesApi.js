import { api } from './api';

export const addressesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),

    createAddress: builder.mutation({
      query: (address) => ({
        url: '/addresses',
        method: 'POST',
        body: address,
      }),
      invalidatesTags: ['Address'],
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
