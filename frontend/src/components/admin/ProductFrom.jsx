import { Form, Input, InputNumber, Button, Image, Upload, message } from 'antd';
import { useState } from 'react';
import { useUploadProductImageMutation } from '../../services/productApi';

function ProductForm({ onSubmit, loading = false, initialValues = {} }) {
  const [fileList, setFileList] = useState([]);
  const [uploadProductImage, { isLoading: uploading }] =
    useUploadProductImageMutation();

  const handleSubmit = async (values) => {
    let imageUrl = initialValues.imageUrl;
    const imageFile = fileList[0]?.originFileObj;

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        ({ imageUrl } = await uploadProductImage(formData).unwrap());
      } catch (error) {
        message.error(error?.data?.message || 'Unable to upload product image');
        return;
      }
    }

    await onSubmit({ ...values, imageUrl });
  };

  return (
    <Form
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Product Name"
        name="name"
        rules={[{ required: true, message: 'Enter product name' }]}
      >
        <Input placeholder="Enter product name" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={3} placeholder="Enter description" />
      </Form.Item>

      <Form.Item
        label="Price"
        name="price"
        rules={[{ required: true, message: 'Enter price' }]}
      >
        <InputNumber min={0.01} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Quantity"
        name="quantity"
        rules={[{ required: true, message: 'Enter quantity' }]}
      >
        <InputNumber min={0} precision={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Product Image">
        {initialValues.imageUrl && fileList.length === 0 && (
          <Image
            src={
              initialValues.imageUrl.startsWith('/uploads/')
                ? new URL(
                    initialValues.imageUrl,
                    import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
                  ).href
                : initialValues.imageUrl
            }
            alt={initialValues.name || 'Current product'}
            width={96}
            height={96}
            style={{ objectFit: 'cover', marginBottom: 8 }}
          />
        )}
        <Upload
          accept="image/jpeg,image/png,image/webp,image/gif"
          listType="picture"
          maxCount={1}
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
        >
          <Button>Select image (JPG, PNG, WEBP, GIF; max 5 MB)</Button>
        </Upload>
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading || uploading}>
        Save Product
      </Button>
    </Form>
  );
}

export default ProductForm;