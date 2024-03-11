import axios from "axios";

async function mintLazyNFT(ipfsURL: string, name: string = '', description: string = '') {
    const metadata = {
        name,
        description,
        image: ipfsURL, // Use the IPFS URL from the previous step
        // Add more metadata as needed
    };

    try {
        const response = await axios.post('https://api.rarible.org/v0.1/nft/mints', metadata, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RARIBLE_API_KEY}`, // Use your Rarible API key
            },
        });

        console.log('Minted NFT:', response.data);
    } catch (error) {
        console.error('Error minting NFT:', error);
    }
}

