import { Row, Col, Typography, Input, Empty, Button, Spin, Select } from 'antd';
import { useState } from 'react';
import {
  useGetProductsQuery,
  useLazyGetProductsQuery,
} from '../../services/productApi';
import ProductCard from '../../components/client/ProductCard';
import Loader from '../../components/common/Loader';
import { ArrowDownOutlined, SearchOutlined, ShopOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/productImageUrl';

const { Title } = Typography;

function Home() {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: allData, isLoading, isFetching, error } = useGetProductsQuery();
  const [
    searchProducts,
    {
      currentData: searchData,
      isFetching: isSearching,
      error: searchError,
    },
  ] = useLazyGetProductsQuery();
  const hasSubmittedSearch = Boolean(
    submittedSearch && search.trim() === submittedSearch,
  );

  if (isLoading) return <Loader />; 
  if (error || (hasSubmittedSearch && searchError)) {
    return (
      <div className="market-error">
        <Title level={3}>We couldn’t load the shop</Title>
        <p>Check that the API is running, then refresh this page.</p>
      </div>
    );
  }

  const allProducts = Array.isArray(allData)
    ? allData
    : allData?.products || [];
  const categories = [
    ...new Set(
      allProducts
        .map((product) => product.category?.trim())
        .filter(Boolean),
        // removes null undefined and other falsy values
    ),
  ].sort((first, second) => first.localeCompare(second));
  const searchResults = Array.isArray(searchData)
    ? searchData
    : searchData?.products || [];
  const products = hasSubmittedSearch && searchData
    ? searchResults
    : allProducts;
  const activeSearch = hasSubmittedSearch ? submittedSearch : '';
  const searchSuggestions = search.trim()
    ? allProducts.filter((product) =>
        product.name
          .toLowerCase()
          .includes(search.trim().toLowerCase()) &&
        (!selectedCategory || product.category === selectedCategory),
      )
    : [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(activeSearch.toLowerCase());
    const price = Number(product.price);
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'under-500' && price < 500) ||
      (priceRange === '500-1000' && price >= 500 && price <= 1000) ||
      (priceRange === 'over-1000' && price > 1000);
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesPrice && matchesCategory;
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
        </div>
      </section>

      <section id="shop" className="market-shop">
        <div className="market-section-heading">
          <div>
            <span className="market-eyebrow">MADE FOR YOUR EVERYDAY</span>
            <Title level={2}>Find your next favourite</Title>
            <p>{filteredProducts.length} thoughtful finds, picked for you</p>
          </div>
          <div className="market-search-wrap">
            <Input
              className="market-search"
              allowClear//x  symboll will visible it will clear the data
              prefix={<SearchOutlined />}//search icon is visible  while searching
              //prefix is displays something at the starting of the input
              suffix={isFetching || isSearching ? <Spin size="small" /> : null}
              //suffix is displays something at the end of the input
              placeholder="Search products"
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                if (!value.trim()) {
                  setSubmittedSearch('');
                }
              }}
              onPressEnter={(event) => {
                event.preventDefault();
                const term = search.trim();
                setSubmittedSearch(term);
                if (term) {
                  searchProducts({ search: term });
                }
              }}
              aria-label="Search products"
            />
            {search.trim() && (
              <div className="market-search-suggestions" role="listbox">
                {searchSuggestions.length > 0 ? (
                  searchSuggestions.map((product) => {
                    const imageUrl = getProductImageUrl(product.imageUrl);

                    return (
                      <Link
                        key={product.id}
                        className="market-search-suggestion"
                        to={`/shop/products/${product.id}`}
                        role="option"
                        aria-label={`View ${product.name}`}
                      >
                        <span className="market-search-suggestion-image">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" />
                          ) : (
                            <ShopOutlined aria-hidden="true" />
                          )}
                        </span>
                        <span className="market-search-suggestion-name">
                          {product.name}
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="market-search-no-results">
                    No matching products
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className="market-filter-row"
          aria-label="Filter products by price and category"
        >
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
          <Select
            aria-label="Filter products by category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: '', label: 'All categories' },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
            style={{ minWidth: 160 }}
          />
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
            description={
              activeSearch || priceRange !== 'all' || selectedCategory
                ? 'No items match those filters'
                : 'The shop is waiting for its first finds'
            }
          />
        )}
      </section>
    </div>
  );
}

export default Home;

// Fetch all products from the backend.
// Display products using ProductCard.
// Search products by name.
// Show product suggestions while typing.
// Filter products by price.
// Filter products by category.
// Navigate to product details when a suggestion is clicked.
// Show loading, error, and empty states.