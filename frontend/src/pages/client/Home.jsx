import { Row, Col, Typography, Input, Empty, Button } from 'antd';
import { useState } from 'react';
import { useGetProductsQuery } from '../../services/productApi';
import ProductCard from '../../components/client/ProductCard';
import Loader from '../../components/common/Loader';
import { ArrowDownOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Home() {
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  const { data, isLoading, error } = useGetProductsQuery();

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className="market-error">
        <Title level={3}>We couldn’t load the shop</Title>
        <p>Check that the API is running, then refresh this page.</p>
      </div>
    );
  }

  const products = Array.isArray(data) ? data : data?.products || [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const price = Number(product.price);
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'under-500' && price < 500) ||
      (priceRange === '500-1000' && price >= 500 && price <= 1000) ||
      (priceRange === 'over-1000' && price > 1000);

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="market-home">
      <section className="market-hero">
        <div className="market-hero-copy">
          <span className="market-eyebrow">
            <ShopOutlined /> YOUR EVERYDAY MARKETPLACE
          </span>
          <Title level={1}>Good finds. <span>Better prices.</span></Title>
          <p>Explore useful little upgrades for your home, work, and everyday life.</p>
          <Button
            className="market-hero-button"
            href="#shop"
            icon={<ArrowDownOutlined />}
          >
            Explore the collection
          </Button>
        </div>
        <div className="market-hero-art" aria-hidden="true">
          <div className="market-hero-sun" />
          <div className="market-hero-bag"><ShopOutlined /></div>
          <div className="market-hero-sparkle sparkle-one">✦</div>
          <div className="market-hero-sparkle sparkle-two">✦</div>
          <span className="market-hero-caption">little things, lovely prices</span>
        </div>
      </section>

      <section id="shop" className="market-shop">
        <div className="market-section-heading">
          <div>
            <span className="market-eyebrow">MADE FOR YOUR EVERYDAY</span>
            <Title level={2}>Find your next favourite</Title>
            <p>{products.length} thoughtful finds, picked for you</p>
          </div>
          <Input
            className="market-search"
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="market-filter-row" aria-label="Filter products by price">
          {[
            ['all', 'All finds'],
            ['under-500', 'Under ₹500'],
            ['500-1000', '₹500 – ₹1,000'],
            ['over-1000', 'Above ₹1,000'],
          ].map(([value, label]) => (
            <Button
              key={value}
              className={priceRange === value ? 'market-filter active' : 'market-filter'}
              onClick={() => setPriceRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <Row gutter={[20, 20]}>
            {filteredProducts.map((product) => (
              <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            className="market-empty"
            description={products.length ? 'No items match those filters' : 'The shop is waiting for its first finds'}
          />
        )}
      </section>
    </div>
  );
}

export default Home;