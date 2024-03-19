import {NFTStorage, File} from "nft.storage";

import mime from 'mime';
import fs from 'fs';
import path from 'path'

export const config = {
    api: {
        bodyParser: false,
    },
};

// export default async function handler(req: any, res: any) {
//     try {
//
//         res.status(200).json({ message: 'Request successful' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

export default async function handler(req: any, res: any) {

    try {
        // load the file from disk
        const image = await fileFromPath(req.imagePath);

        // create a new NFTStorage client using our API key
        const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY || '' });

        // call client.store, passing in the image & metadata
        const response  =  nftStorage.store({
            image,
            name: req.name,
            description: req.description
        });

        return res.status(200).json({ message: 'Request successful', data: response });
    } catch(e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * A helper to read a file from a location on disk and return a File object.
 * Note that this reads the entire file into memory and should not be used for
 * very large files.
 * @param {string} filePath the path to a file to store
 * @returns {File} a File object containing the file content
 */
async function fileFromPath(filePath: string): Promise<File> {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type: (type as string)  })
}