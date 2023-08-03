import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

function ProductCard({ params, index, shop, category }) {
    // Format price from wei to ether and round to two decimal places
    const price = parseFloat(ethers.utils.formatEther(params.price)).toFixed(2);

    return (
        <Card>
            <Link to={`/categories/${category}/${params.subcategory}/${shop}/${index}/details`}>
            <Card.Img variant="top" src={params.image} />
                <Card.Body>
                    <Card.Title>{params.name}</Card.Title>
                    <Card.Text>{price}€</Card.Text>
                </Card.Body>
            </Link>
            <Card.Footer>
                <small className="text-muted">
                    <strong>{params.city}</strong>
                </small>
            </Card.Footer>
        </Card>
    )
}

export default ProductCard;

