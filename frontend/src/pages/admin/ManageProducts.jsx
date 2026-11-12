import { useState } from 'react';
import { Button, Card, Modal, Table, message } from 'antd';
import ProductForm from '../../components/admin/ProductFrom';
import {
  useGetMyProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../services/productApi';
import Loader from '../../components/common/Loader';

function ManageProducts() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Only this admin's products (including out-of-stock ones).
  const { data = [], isLoading } = useGetMyProductsQuery();
  const [addProduct, { isLoading: adding }] = useAddProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = Array.isArray(data) ? data : data?.products || [];

  const handleSave = async (values) => {
    try {
      if (selectedProduct) {
        await updateProduct({
          id: selectedProduct.id,
          ...values,
        }).unwrap();

        message.success('Product updated');
      } else {
        await addProduct(values).unwrap();
        message.success('Product added');
      }

      setOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      message.error(error?.data?.message || 'Unable to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('Product deleted');
    } catch (error) {
      message.error(error?.data?.message || 'Unable to delete product');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Price', dataIndex: 'price', render: (price) => `₹${price}` },
    { title: 'Quantity', dataIndex: 'quantity' },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button
            onClick={() => {
              setSelectedProduct(record);
              setOpen(true);
            }}
          >
            Edit
          </Button>

          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <Card title="Manage Products">
      <Button
        type="primary"
        onClick={() => {
          setSelectedProduct(null);
          setOpen(true);
        }}
      >
        Add Product
      </Button>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        style={{ marginTop: 20 }}
      />

      <Modal
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        open={open}
        onCancel={() => {
          setOpen(false);
          setSelectedProduct(null);
        }}
        footer={null}
        destroyOnHidden
      >
        <ProductForm
          onSubmit={handleSave}
          loading={adding || updating}
          initialValues={selectedProduct || {}}
        />
      </Modal>
    </Card>
  );
}

export default ManageProducts;