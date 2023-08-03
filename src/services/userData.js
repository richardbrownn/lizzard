import { ethers } from 'ethers';
import { message, encrypt, decrypt } from 'openpgp';
import MarketHubABI from '../contracts/MarketHubABI.json';
import shopContractABI from '../contracts/ShopContractABI.json';
const contractAddress = '0xFA3969E17D11F252bEd39BD16A6d9f98dB38Df84';
const baseUrl = 'http://localhost:5000';
const providerUrl = 'https://node1.neuronnetwork.space';
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const contract = new ethers.Contract(contractAddress, MarketHubABI, provider);

export async function registerUser(userData) {
    const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
    const newPassword = localStorage.getItem('password');
    if (encryptedPrivateKey && newPassword) {
        try {
            const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, newPassword);
            if (decryptedPrivateKey) {
                const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                const contractWithSigner = contract.connect(wallet);
                const tx = await contractWithSigner.registerUser(userData.username, ethers.utils.computePublicKey(wallet.privateKey), userData.avatar);
                await tx.wait();
                return { 
                    username: userData.username, 
                    avatar: userData.avatar,
                    address: wallet.address, 
                    publicKey: ethers.utils.computePublicKey(wallet.privateKey) 
                };
            } else {
                return { error: { message: "Could not decrypt the private key" } };
            }
        } catch (error) {
            return { error: { message: " Error" } };
        }
    } else {
        return { error: { message: "Encrypted private key or password is missing" } };
    }
}


export async function isUserExists() {
    const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
    const newPassword = localStorage.getItem('password');
    if (encryptedPrivateKey && newPassword) {
        try {
            const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, newPassword);
            if (decryptedPrivateKey) {
                const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                const contractWithSigner = contract.connect(wallet);
                const exists = await contractWithSigner.isUserExists(wallet.address);
                if (exists) {
                    const user = await contractWithSigner.users(wallet.address);
                    // Проверяем, есть ли свойство profilePic в объекте user и используем его только в случае его наличия
                    const image = user.profilePic ? user.profilePic.toString() : 'undefined.JPG'; 

                    if (user.shopAddress !== "0x0000000000000000000000000000000000000000") {
                        const shopContract = new ethers.Contract(user.shopAddress, shopContractABI, provider);
                        const shopContractWithSigner = shopContract.connect(wallet);
                        const successfulDeals = await shopContractWithSigner.successfulDeals();
                        const failedDeals = await shopContractWithSigner.failedDeals();
                
                        return { 
                            exists: true, 
                            username: user.username, 
                            address: user.userAddress, 
                            publicKey: user.publicKey,
                            image: image,
                            shop: user.shopAddress,
                            successfulDeals: successfulDeals.toNumber(), 
                            failedDeals: failedDeals.toNumber()
                        };
                    } else {
                        return { 
                            exists: true, 
                            username: user.username, 
                            address: user.userAddress, 
                            publicKey: user.publicKey,
                            image: image,
                            shop: user.shopAddress,
                        };
                    }
                } else {
                return { exists: false };
            }
            }

            else {
                return { error: { message: "Could not decrypt the private key" } };
            }
        } catch (error) {
            console.error('Invalid password or encrypted private key. Error:', error);
            return { error: { message: error.message } };
        }
    } else {
        return { error: { message: "Encrypted private key or password is missing" } };
    }
}


export async function loginUser(userData) {
    return (await fetch(`/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData)
    })).json();
}

export async function getUser() {
    return await (await fetch(baseUrl + '/auth/getUser', {credentials: 'include'})).json()
}

export async function getUserActiveSells(id) {
    return (await fetch(`${baseUrl}/products/sells/active/${id}`, {credentials: 'include'})).json();
}

export async function getUserArchivedSells() {
    return (await fetch(`${baseUrl}/products/sells/archived`, {credentials: 'include'})).json();
}

export async function getUserWishlist() {
    return (await fetch(`${baseUrl}/products/wishlist/getWishlist`, {credentials: 'include'})).json();
}

export async function editUserProfile(id, data) {
    return (await fetch(`/user/edit-profile/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })).json();
}

export async function getUserById(id) {
    const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
    const newPassword = localStorage.getItem('password');
    if (encryptedPrivateKey && newPassword) {
        try {
            const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, newPassword);
            if (decryptedPrivateKey) {
                const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                const contractWithSigner = contract.connect(wallet);
                const user = await contractWithSigner.users(id);
                console.log(id);
                console.log(user.userAddress);
                console.log(user.publicKey);
                return { 
                    user: {
                        _id: user.userAddress,
                        username: user.username,
                        publicKey: user.publicKey,
                        isAdmin: user.isAdmin,
                        isModerator: user.isModerator,
                        isBanned: user.isBanned,
                        shopAddress: user.shopAddress,
                        image: user.profilePic
                    } 
                };
            }
            else {
                return { error: { message: "Could not decrypt the private key" } };
            }
        } catch (error) {
            console.error('Invalid password or encrypted private key. Error:', error);
            return { error: { message: error.message } };
        }
    } else {
        return { error: { message: "Encrypted private key or password is missing" } };
    }
}


export const encryptPrivateKey = async (privateKey, password) => {
    const privateKeyString = privateKey.toString();
    const pgpMessage = await message.fromText(privateKeyString);
    const { data: encryptedPrivateKey } = await encrypt({
        message: pgpMessage,
        passwords: [password],
        armor: true,
    });
    return encryptedPrivateKey;
};

export const decryptPrivateKey = async (encryptedPrivateKey, password) => {
    try {
        const { data: decryptedPrivateKey } = await decrypt({
            message: await message.readArmored(encryptedPrivateKey),
            passwords: [password],
        });
        return decryptedPrivateKey.trim();
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

export const generateWallet = async (password) => {
    const wallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = await encryptPrivateKey(wallet.privateKey, password);
    return { privateKey: wallet.privateKey, publicKey: wallet.address, encryptedPrivateKey };
};
export const userIsShop = async (address) => {       
    const user = await contract.users(address);
    console.log(user.userAddress);
    console.log(user.publicKey);
    if (user.shopAddress != "0x0000000000000000000000000000000000000000"){
        return true;
    } else {
        return false;
    }
}
export const createShop = async (shopData) => {
    const encryptedPrivateKey = localStorage.getItem('encryptedPrivateKey');
    const newPassword = localStorage.getItem('password');
    console.log(encryptedPrivateKey);
    console.log(newPassword);
    if (encryptedPrivateKey && newPassword) {
        try {
            const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, newPassword);
            console.log(decryptedPrivateKey);
            if (decryptedPrivateKey) {
                const wallet = new ethers.Wallet(decryptedPrivateKey, provider);
                const contractWithSigner = contract.connect(wallet);
                const tx = await contractWithSigner.createShop(shopData.shopName, shopData.category, shopData.shopPic, shopData.description);
                const receipt = await tx.wait();
            
                if (receipt.status === 1) {
                    // Транзакция была успешно включена в блокчейн и не было ошибок во время выполнения
                    return true;
                } else {
                    // Что-то пошло не так во время выполнения транзакции
                    return { error: { message: "Transaction failed" } };
                }
            } else {
                return { error: { message: "Could not decrypt the private key" } };
            }            
        } catch (error) {
            console.error('Invalid password or encrypted private key.');
            return { error: { message: error.message } };
        }
    } else {
        return { error: { message: "Encrypted private key or password is missing" } };
    }
}
