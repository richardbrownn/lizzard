import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import { BsFillPersonFill } from 'react-icons/bs';
import { MdEmail, MdPhoneAndroid } from 'react-icons/md'
import { FaSellsy } from 'react-icons/fa'
import { GrEdit } from 'react-icons/gr';
import { useContext, useEffect, useState } from 'react';
import { isUserExists } from '../../services/userData';
function ProfileSection({ params }) {
    const [ userData, setUserData] = useState("");
    useEffect(() => {
        async function fetchUserData() {
            const response = await isUserExists();
            if (response && response.exists) {
                setUserData(response);
            }
        }
    
        fetchUserData();
    }, [setUserData]);
    if (params === null) {
        return <div>Loading...</div>;
    }
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
