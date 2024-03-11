
import {create} from'ipfs-http-client';


// Configure IPFS
const auth = 'Basic ' + Buffer.from(process.env.NEXT_INFURA_PROJECT_ID + ':' + process.env.NEXT_INFURA_PROJECT_SECRET).toString('base64');
const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

async function uploadToIPFS(file: Blob, fileName: string) {

    try {
        const added = await client.add({ path: fileName, content: file });
        console.log('Uploaded to IPFS:', added.cid.toString());
        return `ipfs://${added.cid.toString()}`;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
    }
}