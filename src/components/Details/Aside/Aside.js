import { useState, useContext, useEffect } from 'react';
import { Button, Modal, Form, OverlayTrigger, Tooltip, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Context } from '../../../ContextStore';
import { RiMessage3Fill } from 'react-icons/ri';
import { GrEdit } from 'react-icons/gr';
import { ethers } from 'ethers';
import { MdArchive } from 'react-icons/md'
import { BsFillPersonFill } from 'react-icons/bs';
import { MdEmail, MdPhoneAndroid } from 'react-icons/md'
import { FaSellsy } from 'react-icons/fa'
import { archiveSell } from '../../../services/productData';
import { createChatRoom } from '../../../services/messagesData';
import { isUserExists } from '../../../services/userData';
import './Aside.css';


function Aside({ params, history, shopinfo, shopOwner, shopDetails }) {
    const [showMsg, setShowMdg] = useState(false);
    const [showArchive, setShowArchive] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const { userData, setUserData } = useContext(Context);
    const handleClose = () => setShowMdg(false);
    const handleShow = () => setShowMdg(true);

    const handleCloseArchive = () => setShowArchive(false);
    const handleShowArchive = () => setShowArchive(true);

    // New useEffect hook to fetch user data when the component loads
    useEffect(() => {
        async function fetchUserData() {
            const response = await isUserExists();
            if (response && response.exists) {
                setUser(response);
                setUserData(userData);
            } else {
                setUser("guest"); // Изменение состояния пользователя на "гость", если пользователь не существует
            }
        }

        fetchUserData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        archiveSell(user._id)
            .then(res => {
                setShowArchive(false);
                history.push(`/profile/${user._id}`);
            })
            .catch(err => console.log(err))
    }

    const handleMsgChange = (e) => {
        e.preventDefault();
        setMessage(e.target.value)
    }
    const onMsgSent = (e) => {
        e.preventDefault();
        createChatRoom(params.sellerId, message)
            .then((res) => {
                history.push(`/messages/${res.messageId}`)
            })
            .catch(err => console.log(err))
    }
    if (user === null || shopOwner == null) {
        return <div>Loading...</div>;
    }
    console.log(shopDetails);
    const shopdetail = shopDetails[0];

    const failedDeals = shopDetails[1];
    const successfulDeals = shopDetails[2];
    return (
        <aside>
            <div className="product-details-seller">
                <div id="priceLabel" className="col-lg-12">
                    <h4 id="product-price-heading">Product Price </h4>
                    {user.shop !== "0x0000000000000000000000000000000000000000" && user.shop === shopinfo[0] &&
                        <>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Edit the selling</Tooltip>}>
                                <span id="edit-icon">
                                    <Link to={`/categories/${params.category}/${params._id}/edit`}><GrEdit /></Link>
                                </span>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Archive</Tooltip>}>
                                <span id="archive-icon" onClick={handleShowArchive}>
                                    <MdArchive />
                                </span>
                            </OverlayTrigger>
                        </>
                    }
                    {params.price && <h1 id="price-heading">{ethers.utils.formatEther(params.price)}€</h1>}
                </div>
                {user !== "guest" ? (<>
                    {user.shop !== shopinfo[0] &&
                        <Button variant="dark" className="col-lg-10" id="btnContact" onClick={handleShow}>
                            <RiMessage3Fill />Contact Seller
                        </Button>
                    }
                    <Link to={`/profile/${shopdetail ?  shopdetail.ownerAddress : params.sellerId}`}>
                        <Col lg={12}>
                            <img id="avatar" src={shopdetail.shopPic} alt="user-avatar" />
                        </Col>
                        <Col lg={12}>
                            <p><BsFillPersonFill /> {shopdetail.shopName}</p>
                            <p><MdEmail /> {shopdetail.description}</p>
                            <p><FaSellsy /> {ethers.utils.formatUnits(successfulDeals, "ether")} Successful sells in total</p>
                            <p><FaSellsy /> {ethers.utils.formatUnits(failedDeals, "ether")} Failed sells in total</p>
                        </Col>
                    </Link>
                </>) : (
                        <p id="guest-msg"><Link to="/auth/login">Sign In</Link> now to contact the seller!</p>
                    )}
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
    
            <Modal show={showArchive} onHide={handleCloseArchive}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure you want to archive this item?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        By clicking <strong>Archive</strong>, this sell will change
                        it's status to <strong>Archived</strong>,
                        which means that no one but you will be able see it.
                        You may want to change the status to <strong>Actived</strong> if you have
                        sold the item or you don't want to sell it anymore.
                        </p>
    
                    Don't worry, you can unarchive it at any time from Profile - Sells!
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseArchive}>
                        Close
                    </Button>
                    <Button variant="success" onClick={handleSubmit}>
                        Archive
                    </Button>
                </Modal.Footer>
            </Modal>
        </aside>
    )    
}

export default Aside;
