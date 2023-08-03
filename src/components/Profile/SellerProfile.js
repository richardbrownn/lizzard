import { useState, useEffect } from 'react';
import ActiveSells from './Sells/ActiveSells'
import { Col, Row, Button, Form, Modal } from 'react-bootstrap';
import { BsFillPersonFill } from 'react-icons/bs';
import { MdEmail, MdPhoneAndroid } from 'react-icons/md';
import { FaSellsy } from 'react-icons/fa'
import { RiMessage3Fill } from 'react-icons/ri';
import { createChatRoom } from '../../services/messagesData'
import { getUserById } from '../../services/userData';
import { getShopInfoByShopAddress } from '../../services/productData';
function SellerProfile({ params, history, address }) {
    const [showMsg, setShowMdg] = useState(false);
    const [message, setMessage] = useState("");
    const handleClose = () => setShowMdg(false);
    const handleShow = () => setShowMdg(true);
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

    const handleMsgChange = (e) => {
        e.preventDefault();
        setMessage(e.target.value)
    }

    const onMsgSent = (e) => {
        e.preventDefault();
        createChatRoom(params._id, message)
            .then((res) => {
                history.push(`/messages`)
            })
            .catch(err => console.log(err))
    }
    if (params === null || userData === null) {
        return <div>Loading...</div>;
    }
    console.log(userData, shopData)
    return (
        <>
            <div id="profile-head">
                <div className="container">
                    <Row className="profile-row">
                        <Col lg={2} md={5} sm={12}>
                        <img id="avatar" alt="avatar" src={userData.image} />
                        </Col>
                        <Col lg={2} md={3} sm={12}>
                        {shopData ? (
                                <>
                                    <h2>Информация о магазине</h2>
                                    <p><BsFillPersonFill /> {shopData.shopName}</p>
                                    <p><MdEmail /> {shopData.shopContractAddress }</p>
                                    <p><FaSellsy/>{userData.successfulDeals} Успешных продаж всего</p>
                                    <p><FaSellsy/>{userData.failedDeals}  Проваленных продаж всего</p>
                                </>
                            ) : (
                                <>
                                    <h2>Информация о пользователе</h2>
                                    <p><BsFillPersonFill /> {userData.username}</p>
                                    <p><MdEmail /> {userData.address}</p>
                                    <p><FaSellsy/>{userData.successfulDeals} Успешных покупок всего</p>
                                    <p><FaSellsy/>{userData.failedDeals}  Проваленных покупок всего</p>
                                </>
                            )}

                        </Col>
                    </Row>
                </div>
            </div>
            <div className="container">
                <Row>
                    <Col lg={12}>
                        <ActiveSells params={params} />
                    </Col>
                </Row>
            </div>
            <Modal show={showMsg} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Control as="textarea" name="textarea" onChange={handleMsgChange} rows={3} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={onMsgSent}>Sent</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default SellerProfile;
