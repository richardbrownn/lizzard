
import { useEffect, useState } from 'react';
import { Col, Row, Spinner } from 'react-bootstrap';
import SimpleSider from '../components/Siders/SimpleSider';
import Breadcrumb from '../components/Details/Breadcrumb'
import ProductInfo from '../components/Details/ProductInfo/ProductInfo';
import Aside from '../components/Details/Aside/Aside';
import { getSpecific, getOwnerInfoByShopAddress } from '../services/productData';
import '../components/Details/ProductInfo/ProductInfo.css';
import '../components/Details/Aside/Aside.css';

function Details({ match, history }) {
    let shopAddress = match.params.shop;
    let productId = match.params.index;
    let shopinfo = [shopAddress, productId];
    let [product, setProduct] = useState([]);
    let [shopOwner, setShopOwner] = useState(null);
    let [loading, setLoading] = useState(true);
    
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Fetch specific product
        getSpecific(productId, shopAddress)
            .then(res => {
                setProduct(res);
                setLoading(false);
            })
            .catch(err => console.log(err));

        // Fetch shop owner information
        getOwnerInfoByShopAddress(shopAddress)
            .then(res => {
                setShopOwner(res);
            })
            .catch(err => console.log(err));
    }, [productId, shopAddress]);
    
    return (
        <>
            <SimpleSider />
            <div className="container">
                {!loading ? (
                    <>
                    <Breadcrumb params={product} />
                    <Row>
                        <Col lg={8} id="detailsProduct">
                            <ProductInfo params={product} />
                        </Col>
                        <Col lg={4}>
                            <Aside params={product} history={history}  shopinfo={shopinfo} shopOwner={shopOwner}/>
                        </Col>
                    </Row></>) : (<Spinner animation="border" />)}
            </div>
        </>
    )
}

export default Details; 
