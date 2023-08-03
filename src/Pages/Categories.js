

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import InfiniteScroll from 'react-infinite-scroll-component';
import ProductCard from '../components/ProductCard/ProductCard';
import { Col, Spinner, Dropdown, Form } from 'react-bootstrap';
import { BiSortDown, BiSort, BiSortUp } from 'react-icons/bi';
import MarketHubABI from '../contracts/MarketHubABI.json';
import ShopContractABI from '../contracts/ShopContractABI.json';
import '../components/Siders/SearchSider.css';
import '../components/Categories/Categories.css';
import '../components/ProductCard/ProductCard.css';
import data from './data.json';
function Categories({ match }) {
    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');
    const marketHubContract = new ethers.Contract('0xFA3969E17D11F252bEd39BD16A6d9f98dB38Df84', MarketHubABI, provider);
    let currentCategory = match.params.category;
    const [products, setProduct] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('lowerPrice');
    const [searchParams, setSearchParams] = useState({
        globalCategory: "all",
        type: "all",
        city: "all",
        district: "all",
        quantity: "all",
        category: "all",
        subcategory: "all"
    });
    const [globalCategories] = useState(data.globalCategories || []);
    const [categories, setCategories] = useState(data.categories || []);
    const [subcategories, setSubcategories] = useState([]);


    const [orderType] = useState(data.orderType);
    const [cities] = useState(data.cities);
    const [quantities, setQuantities] = useState(''); 
    const [districts, setDistricts] = useState([]);

    const loadProducts = async () => {
        setLoading(true);
        const shops = await marketHubContract.getAllShopAddresses();
        let allProducts = [];
        for (let shop of shops) {
            const shopContract = new ethers.Contract(shop, ShopContractABI, provider);
            const productCount = await shopContract.productId();
            for (let i = 0; i < productCount; i++) {
                let product = await shopContract.products(i);
                product = { ...product, shop: shop };
                allProducts.push({ product, shop: shop, index: i });
                console.log("Все продукты до фильтрации:", allProducts);
            }
        }
    
        allProducts = allProducts.filter(product => {
            for (const param in searchParams) {
                if (param in product.product && searchParams[param] !== "all") {
                    if (param === "orderType") {
                        if (parseInt(product.product[param]) !== parseInt(searchParams[param])) {
                            return false;
                        }
                    } else {
                        if (product.product[param] !== searchParams[param]) {
                            return false;
                        }
                    }
                }
                if (quantities !== '' && 
                    product.product.quantity < parseInt(quantities)) {
                    return false;
                }      
            }
            return true;
        });
    
        console.log("Все продукты после фильтрации:", allProducts);
    
        setProduct(allProducts);
        setLoading(false);
        setPage(page => page + 1);
    }
    
    const handleCityChange = (event) => {
        const selectedCity = event.target.value;
    
        const cityData = data.cities.find(c => c.name === selectedCity);
    
        if (cityData) {
            setDistricts(cityData.districts);
        } else {
            setDistricts([]);
        }
    
        setSearchParams({
            ...searchParams,
            city: selectedCity
        });
    }
    
    

    useEffect(() => {
        loadProducts();
    }, [currentCategory, setProduct, searchParams]);

    const handleSelectChange = (param) => (event) => {
        setSearchParams({
            ...searchParams,
            [param]: event.target.value !== "all" ? parseInt(event.target.value) : "all"
        });
    }
    const handleGlobalCategoryChange = (event) => {
        const selectedGlobalCategoryName = event.target.value;
    
        const selectedGlobalCategory = data.globalCategories.find(c => c.name === selectedGlobalCategoryName);
        const newCategories = selectedGlobalCategory ? selectedGlobalCategory.categories.map(c => c.name) : [];
    
        setCategories(newCategories);
        setSubcategories([]);
    
        setSearchParams({
          ...searchParams,
          globalCategory: selectedGlobalCategoryName,
          category: "all",
          subcategory: "all"
        });
    };
    
    const handleCategoryChange = (event) => {
        const selectedCategoryName = event.target.value;
    
        const selectedGlobalCategory = data.globalCategories.find(c => c.name === searchParams.globalCategory);
        const selectedCategory = selectedGlobalCategory ? selectedGlobalCategory.categories.find(c => c.name === selectedCategoryName) : null;
        const newSubcategories = selectedCategory ? selectedCategory.subcategories : [];
    
        setSubcategories(newSubcategories);
    
        setSearchParams({
          ...searchParams,
          category: selectedCategoryName,
          subcategory: "all"
        });
    };
    
    
    

    return (
        <>
        <div id="sider"></div>
        <div className="container">

                <Form.Group controlId="filters">

                <Form.Control
                    as="select"
                    onChange={handleGlobalCategoryChange}
                >
                    <option value="all">Глобальная категория</option>
                    {globalCategories ? globalCategories.map(c => <option key={c.name}>{c.name}</option>) : null}
                </Form.Control>


                <Form.Control
                    as="select"
                    onChange={handleCategoryChange}
                >
                    <option value="all">Категория</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                </Form.Control>

                <Form.Control
                    as="select"
                    onChange={handleSelectChange('subcategory')}
                >
                    <option value="all">Подкатегория</option>
                    {subcategories.map(s => <option key={s}>{s}</option>)}
                </Form.Control>
                <Form.Control
                    as="select"
                    onChange={handleSelectChange('orderType')}
                >
                    <option value="all">Тип</option>
                    {orderType.map(t => <option key={t.name} value={t.value}>{t.name}</option>)}
                </Form.Control>


                
                    <Form.Control
                    as="select"
                    onChange={handleCityChange}  
                    >
                    <option value="all">Город</option>
                    {cities.map(c => <option key={c.name}>{c.name}</option>)}
                </Form.Control>

                <Form.Control
                    as="select"
                    onChange={handleSelectChange('district')}
                >
                    <option value="all">Район</option>
                    {districts.map(d => <option key={d}>{d}</option>)}  
                </Form.Control>
                <Form.Control
                    placeholder="Количество"
                    onChange={e => setQuantities(e.target.value)}  
                    value={quantities}
                    type="number"
                />
    
            </Form.Group>
            {!loading ?
                <div className="row justify-content-center align-items-center">
                    {products
                        .sort((a, b) => {
                            if (sort === "lowerPrice") {
                                return parseFloat(ethers.utils.formatEther(a.product.price)) - parseFloat(ethers.utils.formatEther(b.product.price));
                            }
                            if (sort === "biggerPrice") {
                                return parseFloat(ethers.utils.formatEther(b.product.price)) - parseFloat(ethers.utils.formatEther(a.product.price));
                            }
                        })
                        .map((x, i) =>
                            <Col xs={12} md={6} lg={3} key={i}>
                                <ProductCard params={x.product} shop={x.shop} index={x.index} category={currentCategory} />
                            </Col>
                        )}
                </div>
                : <div className="spinner">
                    <Spinner animation="border" />
                </div>
            }
          </div>
    
        </>
      );
}

export default Categories;
