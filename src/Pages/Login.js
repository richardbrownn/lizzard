import { useState, useContext, useEffect } from 'react';
import { Context } from '../ContextStore';
import { registerUser, isUserExists, createShop } from '../services/userData';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import SimpleSider from '../components/Siders/SimpleSider';
import { ethers } from 'ethers';
import { ThirdwebStorage } from "@thirdweb-dev/storage";

function Login({ history }) {
    const [loading, setLoading] = useState(false);
    const [alertShow, setAlertShow] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [registerAsShop, setRegisterAsShop] = useState(false);
    const [shopName, setShopName] = useState("");
    const [shopCategory, setShopCategory] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const { userData, setUserData } = useContext(Context);
    const [avatarLoading, setAvatarLoading] = useState(false); 
    const storage = new ThirdwebStorage();
    
    // Handle input changes
    const handleChanges = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        if (name === "username") setUsername(value);
        if (name === "shopName") setShopName(value);
        if (name === "shopCategory") setShopCategory(value);
        if (name === "shopDescription") setShopDescription(value);
    }

    // Toggle registerAsShop state
    const handleRegisterAsShopChange = (e) => {
        setRegisterAsShop(e.target.checked);
    }

    // Handle avatar change
    const handleFileChange = async (e) => {
        e.preventDefault();
        setAvatarLoading(true); // set avatar loading state to true
        try {
            const file = e.target.files[0];
            console.log(file);
            const upload = await storage.uploadBatch([file]);
            const newAvatar = storage.resolveScheme(upload[0]);
            console.log(`Gateway URL - ${newAvatar}`);
            setAvatar(newAvatar);
            setAvatarLoading(false); // set avatar loading state to false when upload is done
        } catch (err) {
            console.error('Failed to upload file to IPFS: ', err);
            setAvatarLoading(false); // set avatar loading state to false even when there's error
        }
    };

    // Check existing user and set data
    const checkUserAndSetData = async () => {
        const userData = await isUserExists();
        console.log(userData);
        if (userData && userData.exists !== false && !userData.error) {
            setUserData(userData);
            history.push('/');
        }
    };

    // Run checkUserAndSetData function on component mount
    useEffect(() => {
        checkUserAndSetData();
    }, [history]);

    // Handle form submit
    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        if (avatarLoading) { // if avatar is still loading, do not submit the form
            return;
        }
        setLoading(true);

        try {
            const userData = await isUserExists();
            if (userData && userData.exists !== false && !userData.error) {
                setUserData(userData);
                history.push('/');
            } else {
                console.log(avatar);
                console.log(username)
                const userData = {
                    username: username,
                    avatar: avatar,
                };
                const res = await registerUser(userData);
                if (!res.error) {
                    setUserData(res);
                    if(registerAsShop){
                        console.log("LETS CREATE SHOP")
                        const shopData = {
                            shopName,
                            category: shopCategory,
                            shopPic: avatar, 
                            description: shopDescription,
                        };
                        const shopRes = await createShop(shopData);
                        if(shopRes.error){
                            setError(shopRes.error.message);
                            setAlertShow(true);
                        }
                    }
                    history.push('/');
                } else {
                    setLoading(false);
                    setError(res.error.message);
                    setAlertShow(true);
                }
            }
        } catch (err) {
            console.error('error from register: ', err);
        }
    }  

    useEffect(() => {
        if (userData && userData.username) {
            history.push('/');
        }
    }, [userData, history]);

    return (
        <>
            <SimpleSider />
            <div className="container auth-form">
                <h1 className="auth-heading">Sign In / Register</h1>
                <Form className="col-lg-6" onSubmit={handleSubmitLogin}>
                    {alertShow &&
                        <Alert variant="danger" onClose={() => setAlertShow(false)} dismissible>
                            <p>
                                {error}
                            </p>
                        </Alert>
                    }
                    <Form.Group controlId="formBasicUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" placeholder="Enter username" onChange={handleChanges} required />
                    </Form.Group>
                    <Form.Group controlId="formBasicAvatar">
                        <Form.Label>Avatar</Form.Label>
                        <Form.Control type="file" name="avatar" onChange={handleFileChange} />
                    </Form.Group>
                    <Form.Check type="checkbox" label="Register as Shop" onChange={handleRegisterAsShopChange} />
                    {registerAsShop &&
                        <>
                            <Form.Group controlId="formBasicShopName">
                                <Form.Label>Shop Name</Form.Label>
                                <Form.Control type="text" name="shopName" placeholder="Enter Shop Name" onChange={handleChanges} required />
                            </Form.Group>
                            <Form.Group controlId="formBasicShopCategory">
                                <Form.Label>Shop Category</Form.Label>
                                <Form.Control type="text" name="shopCategory" placeholder="Enter Shop Category" onChange={handleChanges} required />
                            </Form.Group>
                            <Form.Group controlId="formBasicShopDescription">
                                <Form.Label>Shop Description</Form.Label>
                                <Form.Control type="text" name="shopDescription" placeholder="Enter Shop Description" onChange={handleChanges} required />
                            </Form.Group>
                        </>
                    }
                    {loading ?
                        <Button className="col-lg-12 btnAuth" variant="dark" disabled >
                            Please wait... <Spinner animation="border" />
                        </Button>
                        :
                        <Button variant="dark" className="col-lg-12 btnAuth" type="submit">Sign In / Register</Button>
                    }
                </Form>
            </div>
        </>
    )    
}

export default Login;
