import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { BsFillPersonFill } from 'react-icons/bs';
import { MdEmail, MdPhoneAndroid } from 'react-icons/md'
import { FaSellsy } from 'react-icons/fa'
import { GrEdit } from 'react-icons/gr';
import { useContext, useEffect, useState} from 'react';
import { getUserById } from '../../services/userData';
import { getShopInfoByShopAddress } from '../../services/productData';
function ProfileSection({ params, address }) {
    const [ userData, setUserData] = useState("");
    const [ shopData, setShopData ] = useState(null);
    useEffect(() => {
        async function fetchUserData() {
            const response = await getUserById(address);
            if (response.user && response.user._id) {
                console.log(response);
                
                if (response.user.shopAddress) {
                    const shopinfo = await getShopInfoByShopAddress(response.user.shopAddress);
                    console.log(shopinfo);
                    setShopData(shopinfo[0]);
                } else {
                    setShopData(null);
                    // или показать сообщение, что у пользователя нет магазина
                }
                setUserData(response.user);
            }
        }
    
        fetchUserData();
    }, [setUserData, userData, setShopData, shopData]);
    
    if (params === null || userData === null) {
        return <div>Loading...</div>;
    }
    console.log(userData, shopData)
    return (
        <div id="profile-head">
            <div className="container">
                <Row className="profile-row">
                    <Col lg={2} md={5} sm={12}>
                    <img id="avatar" alt="avatar" src={userData.image} />
                    </Col>
                    <Col lg={3} md={3} sm={12}>
                        <p><BsFillPersonFill /> {userData.username}</p>
                        <p><MdEmail /> {userData.address}</p>
                        <p><FaSellsy/>{userData.successfulDeals} Successful sells in total</p>
                        <p><FaSellsy/>{userData.failedDeals} Failed sells in total</p>
                    </Col>
                    <span id="edit-icon">
                        <Link to={`/profile/${userData.address}/edit`}><GrEdit /></Link>
                    </span>
                </Row>
            </div>
        </div>
    )
}

export default ProfileSection;
