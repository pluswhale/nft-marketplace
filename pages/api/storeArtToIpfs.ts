import { NextApiRequest, NextApiResponse } from 'next'
import { NFTStorage, File } from 'nft.storage'
import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing form data.' })
      return
    }

    try {
      // Check if the files.file is an array and take the first file if so
      const fileArray = Array.isArray(files.file) ? files.file : [files.file]
      const file = fileArray[0] // Now you're working with the first file regardless

      if (!file) {
        res.status(400).json({ error: 'No file uploaded.' })
        return
      }

      // Continue as before, now correctly referencing `file`
      const name = fields.name?.[0]
      const description = fields.description?.[0]
      const externalUrl = fields.externalUrl

      const client = new NFTStorage({
        token: process.env.NFT_STORAGE_API_KEY || 'your_nft_storage_token',
      })

      // Convert the file to a format NFTStorage can handle
      const nftStorageFile = new File(
        [await fs.promises.readFile(file.filepath)],
        file.originalFilename || '',
        { type: file.mimetype || '' }
      )

      const nft = {
        image: nftStorageFile,
        name,
        description,
      }

      //@ts-ignore
      const result = await client.store(nft)
      console.log('results', result)
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to upload to NFT.Storage' })
    }
  })
}
