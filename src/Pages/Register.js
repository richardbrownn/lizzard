// Register.js
import { useState, useEffect, useCallback } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { registerUser } from '../services/userData';
import { generateWallet, encryptPrivateKey, decryptPrivateKey } from '../services/userData';
import SimpleSider from '../components/Siders/SimpleSider';
import '../components/Register/Register.css';

function Register({ history }) {
    const [loading, setLoading] = useState(false);
    const [alertShow, setAlertShow] = useState(false);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState('0 ETH');
    const [userData, setUserData] = useState({
        password: "",
    });

    const [privateKey, setPrivateKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [walletExist, setWalletExist] = useState(false);

    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');

    const handleChanges = (e) => {
        e.preventDefault();
        setUserData({ ...userData, [e.target.name]: e.target.value });
    }

    const loadFromLocalStorage = async () => {
        const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
        const newPassword = localStorage.getItem('password');
        if (encryptedPrivateKey && newPassword) {
            try {
                const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, newPassword);
                if (decryptedPrivateKey) {
                    setPrivateKey(decryptedPrivateKey);
                    const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                    setPublicKey(wallet.address);
                    setWalletExist(true);
                }
            } catch {
                console.error('Invalid password or encrypted private key.');
            }
        }
    };

    const deleteWallet = () => {
        if (window.confirm("Are you sure you want to delete the wallet?")) {
            localStorage.removeItem('encryptedPrivateKey');
            localStorage.removeItem('password');
            setPrivateKey('');
            setPublicKey('');
            setWalletExist(false);
        }
    }

    const isPrivateKeyStored = useCallback(() => {
        return (localStorage.getItem('encryptedPrivateKey'));
    }, []);

    const lockWallet = () => {
        localStorage.removeItem('password');
        setPrivateKey('');
        setPublicKey('');
        setWalletExist(false);
    };

    const importPrivateKey = async (importedPrivateKey) => {
        if (!walletExist && userData.password) {
            setPrivateKey(importedPrivateKey);
            const wallet = new ethers.Wallet(importedPrivateKey, provider);
            setPublicKey(wallet.address);
            setWalletExist(true);
            const encryptedPrivateKey = await encryptPrivateKey(importedPrivateKey, userData.password);
            localStorage.setItem('encryptedPrivateKey', encryptedPrivateKey);
            localStorage.setItem('password', userData.password);
            await showBalance();
        } else {
            if(!userData.password) {
                alert("Please enter a password before importing a private key.");
            } else {
                alert("Wallet already exist in local storage.");
            }
        }
    }

    const isWalletStored = useCallback(() => {
        return (localStorage.getItem('encryptedPrivateKey') && localStorage.getItem('password'));
    }, []);

    const generateNewWallet = async () => {
        if (!userData.password) {
            alert("Please enter a password before generating a wallet.");
            return;
        }
        if (window.confirm("Are you sure you want to generate a new wallet?")) {
            const { privateKey, publicKey, encryptedPrivateKey } = await generateWallet(userData.password);
            setPrivateKey(privateKey);
            setPublicKey(publicKey);
            localStorage.setItem('encryptedPrivateKey', encryptedPrivateKey);
            localStorage.setItem('password', userData.password);
            await loadFromLocalStorage();
            await showBalance();
        }
    }

    const handleSubmitReg = async (e) => {
        e.preventDefault();
        if (ethers.utils.parseEther(balance.split(' ')[0]).isZero()) {
            alert("Please add funds to your wallet before registering.");
            return;
        }
        setLoading(true);
        try {
        //    const res = await registerUser(userData);
        //    if (res) {
        //       setLoading(false);
                history.push('/auth/login')
       //     } else {
          //      setError("Something went wrong!");
        //        setAlertShow(true);
        //    }
        } catch (err) {
            setLoading(false);
            setError(err.message);
            setAlertShow(true);
            console.error('Error from register: ', err);
        }
    }    

    const handleCopyPublicKey = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(publicKey);
                alert('Public Address copied to clipboard');
            } catch (error) {
                alert('Error copying public address to clipboard');
            }
        } else {
            prompt('Copy the public address:', publicKey);
        }
    }

    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    const handleUnlockClick = async () => {
        const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
        if (encryptedPrivateKey && userData.password) {
            try {
                const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, userData.password);
                if (decryptedPrivateKey) {
                    localStorage.setItem('password', userData.password);
                    setPrivateKey(decryptedPrivateKey);
                    const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                    setPublicKey(wallet.address);
                    setWalletExist(true);
                    await showBalance();
                }
            } catch {
                alert('Invalid password or private key.');
            }
        }
    }
    
    const showBalance = useCallback(async () => {
        const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
        const bPassword = localStorage.getItem('password');
        if (encryptedPrivateKey && bPassword) {
            try {
                const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, bPassword);
                if (decryptedPrivateKey) {
                    const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                    const balance = await wallet.getBalance();
                    setBalance(ethers.utils.formatEther(balance) + ' ETH');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }, [userData.password]);

    useEffect(() => {
        showBalance();
    }, [privateKey, showBalance]);

    return (
        <>
            <SimpleSider />
            <div className="container auth-form">
                <h1 className="auth-heading">Wallet</h1>
                <p className="wallet-balance">Your Wallet Balance: {balance}</p>
                <Form className="col-lg-8" onSubmit={handleSubmitReg}>
                    {alertShow &&
                        <Alert variant="danger" onClose={() => setAlertShow(false)} dismissible>
                            <p>
                                {error}
                            </p>
                        </Alert>
                    }
                    <Form.Row>
                        <Form.Group controlId="formBasicPassword" className="col-lg-12">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control type="password" name="password" placeholder="Password" onChange={handleChanges} required />
                            <Form.Text muted>
                                Your password must be 8-20 characters long
                            </Form.Text>
                        </Form.Group>
                    </Form.Row>
                    {!isWalletStored() && <Button variant="dark" onClick={handleUnlockClick} className="col-lg-12 btnAuth">Unlock Wallet</Button>}
                    {!isWalletStored() && <Button variant="dark" onClick={generateNewWallet} className="col-lg-12 btnAuth">Generate Wallet</Button>}
                    {isWalletStored() && <Button variant="dark" onClick={deleteWallet} className="col-lg-12 btnAuth">Delete Wallet</Button>}
                    {isWalletStored() && <Button variant="dark" onClick={lockWallet} className="col-lg-12 btnAuth">Lock Wallet</Button>}
                    {walletExist && <Button variant="dark" onClick={handleCopyPublicKey} className="col-lg-12 btnAuth">Copy Public Address</Button>}
                    {walletExist && <Button variant="dark" onClick={() => { alert(privateKey); }} className="col-lg-12 btnAuth">Export Private Key</Button>}
                    {!walletExist && !isPrivateKeyStored() &&
                    <Form.Row>
                        <Form.Group controlId="importPrivateKey" className="col-lg-12">
                            <Form.Label>Import Private Key</Form.Label>
                            <Form.Control type="text" name="importPrivateKey" placeholder="Enter your private key here" onChange={(e) => importPrivateKey(e.target.value)} />
                        </Form.Group>
                    </Form.Row>}
                    {loading ?
                        <Button className="col-lg-12 btnAuth" variant="dark" disabled>
                            Please wait... <Spinner animation="border" />
                        </Button>
                        :
                        (isWalletStored() && <Button variant="dark" className="col-lg-12 btnAuth" type="submit">Login</Button>)
                    }
                    <p className="bottom-msg-paragraph">Already have an account? <Link to="/auth/login">Sign In</Link>!</p>
                </Form>
            </div>
        </>
    )         
       
}

export default Register;
