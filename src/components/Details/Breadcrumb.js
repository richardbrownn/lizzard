import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function BreadcrumbNav({ params, index, shop }) {
    return (
        <Breadcrumb>
            <li className="breadcrumb-item">
                <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
                <Link to={`/categories/${params.category}`}>{params.category}</Link>
            </li>
            <li  className="breadcrumb-item">
                <Link to={`/categories/${params.subcategory}/${shop}/${index}/details`}>{params.title}</Link>
            </li>
        </Breadcrumb>
    )
}

export default BreadcrumbNav;
