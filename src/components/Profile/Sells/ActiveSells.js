import { useEffect, useState } from 'react';
import ProductCard from '../../ProductCard/ProductCard';
import { Col, Row, Spinner } from 'react-bootstrap';
import { getShopInfoByShopAddress  } from '../../../services/productData';
import { getUserById } from '../../../services/userData';
import './Sells.css';

// Маппер для преобразования массива данных в объект
const productMapper = productData => ({
    name: productData[0],
    image: productData[1],
    description: productData[2],
    category: productData[3],
    subcategory: productData[4],
    city: productData[5],
    quantity: productData[6],
    unit: productData[7],
    district: productData[8],
    orderType: productData[9],
    price: productData[10],
    sold: productData[11]
});

function ActiveSells({ address }) {
    const [products, setProducts] = useState([])
    let [loading, setLoading] = useState(true);
    useEffect(() => {
        window.scrollTo(0, 0);
        console.log(address);
        async function fetchProducts() {
            try {
                const response = await getUserById(address);
            if (response.user && response.user.shopAddress) {
                console.log(response);
                if (response.user.shopAddress) {
                const shopInfo = await getShopInfoByShopAddress(response.user.shopAddress);
                const activeProducts = shopInfo[3]; // Получаем продукты из возвращенного массива
                const productsData = activeProducts.map(productMapper); // Преобразуем данные каждого продукта в объект
                const unsoldProducts = productsData.filter(product => !product.sold); // Оставляем только непроданные продукты
                setProducts(unsoldProducts);
                } else {
                    setProducts(null);
                    // или показать сообщение, что у пользователя нет магазина
                }
            }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }

        if (address) {
            fetchProducts();
        }
    }, [address]);

    return (
        <>
            {!loading ?
                (<>
                    <h1 className="heading">Active Sells</h1>
                    {products.length ? (
                        <Row>
                            {products
                                .map((x, i) =>
                                    <Col xs={12} md={6} lg={4} key={i}>
                                        <ProductCard params={x} index={i} shop={address} category={x.category} />
                                    </Col>
                                )
                            }
                        </Row>
                    ) : (
                            <p className="nothing-to-show">Nothing to show</p>
                        )
                    }
                </>) :
                <Spinner animation="border" />}
        </>
    )
}

export default ActiveSells;
