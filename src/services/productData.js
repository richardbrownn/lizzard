import { ethers } from 'ethers';
import MarketHubABI from '../contracts/MarketHubABI.json';
import ShopContractABI from '../contracts/ShopContractABI.json';
const contractAddress = '0xFA3969E17D11F252bEd39BD16A6d9f98dB38Df84';
const providerUrl = 'https://node1.neuronnetwork.space';
const baseUrl = 'http://localhost:5000';
const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const contract = new ethers.Contract(contractAddress, MarketHubABI, provider);

export async function getAll(page, category, query) {
    if (query !== "" && query !== undefined) {
        return (await fetch(`${baseUrl}/products?page=${page}&search=${query}`, { credentials: 'include' })).json();
    } else if (category && category !== 'all') {
        return (await fetch(`${baseUrl}/products/${category}?page=${page}`, { credentials: 'include' })).json();
    } else {
        return (await fetch(`${baseUrl}/products?page=${page}`, { credentials: 'include' })).json();
    }
}

export async function createProduct(product) {
    return (await fetch(`${baseUrl}/products/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(product)
    })).json();
}

export async function editProduct(id, product) {
    return (await fetch(`${baseUrl}/products/edit/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(product)
    })).json();
}


export async function activateSell(id) {
    return (await fetch(`/products/enable/${id}`)).json()
}

export async function archiveSell(id) {
    return (await fetch(`/products/archive/${id}`)).json()
}

export async function wishProduct(id) {
    return (await fetch(`${baseUrl}/products/wish/${id}`, { credentials: 'include' })).json();
}
export const getSpecific = async (productId, shopAddress) => {
    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');
    const shopContract = new ethers.Contract(shopAddress, ShopContractABI, provider);
    const product = await shopContract.products(productId);
    return product;
}
export const getOwnerInfoByShopAddress = async (shopAddress) => {
    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');
    const shopContract = new ethers.Contract(shopAddress, ShopContractABI, provider);
    const shopOwner =  await shopContract.shopOwner();
    const markethubContract = new ethers.Contract(await shopContract.marketHubContract(), MarketHubABI, provider);
    const ownerinfo = await markethubContract.users(shopOwner);
    return [ownerinfo];
}

export const getShopInfoByShopAddress = async (shopAddress) => {
    const provider = new ethers.providers.JsonRpcProvider('https://node1.neuronnetwork.space');
    const shopContract = new ethers.Contract(shopAddress, ShopContractABI, provider);
    const markethubContract = new ethers.Contract(await shopContract.marketHubContract(), MarketHubABI, provider);

    const failedDeals = await shopContract.failedDeals();
    const successfulDeals = await  shopContract.successfulDeals();
    const shopinfo = await markethubContract.shops(shopAddress);
    const productCount = await shopContract.productId();

    // create an array to store product info
    const products = [];

    // loop over each product id and get the product info
    for(let i = 0; i < productCount; i++) {
        const productInfo = await shopContract.products(i); // Assuming 'products' is a method in your contract that retrieves product details by id
        products.push(productInfo);
    }

    return [shopinfo, failedDeals, successfulDeals, products];
}
