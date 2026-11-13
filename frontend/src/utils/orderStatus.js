const orderStatusLabels = {
  PENDING: 'Pending',
  PROCESSING: 'Accepted',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function getOrderStatusLabel(status) {
  return orderStatusLabels[status] || status;
}
