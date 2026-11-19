import { api } from './api';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ search } = {}) => ({
        url: '/products',
        params: search ? { search } : undefined,
      }),
      providesTags: ['Product'],
    }),

    getAdminProducts: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: '/products/admin',
        params: { page, pageSize },
      }),
      providesTags: ['Product'],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),

    uploadProductImage: builder.mutation({
      query: (file) => ({
        url: '/products/upload-image',
        method: 'POST',
        body: file,
      }),
    }),

    addProduct: builder.mutation({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetAdminProductsQuery,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;