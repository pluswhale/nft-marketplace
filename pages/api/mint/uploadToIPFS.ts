// import {create} from'ipfs-http-client';
// // Configure IPFS
// const auth = 'Basic ' + Buffer.from(process.env.NEXT_INFURA_PROJECT_ID + ':' + process.env.NEXT_INFURA_PROJECT_SECRET).toString('base64');
// const client = create({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https',
//     headers: {
//         authorization: auth,
//     },
// });
//
// async function uploadToIPFS(file: Blob, fileName: string) {
//
//     try {
//         const added = await client.add({ path: fileName, content: file });
//         console.log('Uploaded to IPFS:', added.cid.toString());
//         return `ipfs://${added.cid.toString()}`;
//     } catch (error) {
//         console.error('Error uploading to IPFS:', error);
//     }
// }

// pages/api/mint/uploadToIPFS.js


import {NFTStorage, File} from "nft.storage";

import mime from 'mime';
import fs from 'fs';
import path from 'path'

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: any, res: any) {
    const data = req.body;

    const { file, name, description } = data;

    // load the file from disk
    // const image = await fileFromPath(imagePath);
    const nftStorageFile =  new File([file], name, { type: ('image' as string)  })

    // create a new NFTStorage client using our API key
    const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY || '' });

    // call client.store, passing in the image & metadata
    return nftStorage.store({
        image: nftStorageFile,
        name: name,
        description: description
    });
}

/**
 * A helper to read a file from a location on disk and return a File object.
 * Note that this reads the entire file into memory and should not be used for
 * very large files.
 * @param {string} filePath the path to a file to store
 * @returns {File} a File object containing the file content
 */
// async function fileFromPath(file: File): Promise<File> {
//     const content = await fs.promises.readFile(file)
//     const type = mime.getType(file)
//     return new File([file], path.basename(filePath), { type: (type as string)  })
// }