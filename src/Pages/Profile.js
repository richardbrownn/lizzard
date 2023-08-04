import { useEffect, useState } from 'react';
import ProfileSection from '../components/Profile/ProfileSection'
import Wishlist from '../components/Profile/Wishlist/Wishlist'
import ActiveSells from '../components/Profile/Sells/ActiveSells';
import ArchivedSells from '../components/Profile/Sells/ArchivedSells'
import SellerProfile from '../components/Profile/SellerProfile'
import { getUserById, decryptPrivateKey } from '../services/userData';
import { Col, Row, Button } from 'react-bootstrap';
import { ethers } from 'ethers';
import { Context } from '../ContextStore';
import '../components/Profile/Profile.css';

function Profile({ match, history }) {
    const [active, setActive] = useState(true);
    const [archived, setArchived] = useState(false);
    const [wishlist, setWishlist] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const address = match.params.id;

    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');

    const handleActive = () => {
        setActive(true)
        setArchived(false);
        setWishlist(false);
    }

    const handleArchived = () => {
        setActive(false);
        setArchived(true);
        setWishlist(false);
    }

    const handleWish = () => {
        setActive(false);
        setArchived(false);
        setWishlist(true);
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        getUserById(ethers.utils.getAddress(match.params.id))
            .then(res => {
                const localStorageKey = localStorage.getItem('encryptedPrivateKey');
                const password = localStorage.getItem('password');
    
                // Check if localStorage has key and password
                if (localStorageKey && password) {
                    // Decrypt private key
                    decryptPrivateKey(localStorageKey, password)
                        .then(decryptedPrivateKey => {
                            // Initialize wallet with decrypted private key
                            const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
    
                            // Compare wallet address with fetched user's address
                            if (wallet.address.toLowerCase() === res.user._id.toLowerCase()) {
                                // User is the same as the one in localStorage
                                setUser({ ...res.user, isMe: true });
                            } else {
                                setUser(res.user);
                            }
                        })
                        .catch(err => console.error('Error decrypting private key: ', err));
                } else {
                    setUser(res.user);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err)
                setLoading(false);
            })
    }, [match.params.id]);
    
    if (loading || !address) {
        return <div>Loading...</div>;
    }
    console.log(address);
    return (
        <>
            {user && user.isMe ? (
                <>
                <ProfileSection params={user} match={match} address={address}/>
                <div className="container">
                    <Row>
                        <Col lg={2} sm={12} id="aside">
                            <Button variant="dark" id="active-sells" onClick={handleActive}>Active Sells</Button>{' '}
                            <Button variant="dark" id="archived-sells" onClick={handleArchived}>Archived</Button>{' '}
                            <Button variant="dark" id="wishlist" onClick={handleWish}>Wishlist</Button>{' '}
                        </Col>
                        <Col lg={10} sm={12}>
                            {active && <ActiveSells address={address}/>}
                            {archived && <ArchivedSells history={history} />}
                            {wishlist && <Wishlist />}
                        </Col>
                    </Row>
                </div>
                </>
            ) : ( 
                <SellerProfile params={user} history={history}  match={match} address={address}/>
            )}

        </>
    )
}

export default Profile;
