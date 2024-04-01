import type { NextApiRequest, NextApiResponse } from 'next'
import { NFTStorage } from 'nft.storage'

const NFT_STORAGE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cid = req.query.cid as string

  try {
    const client = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY || NFT_STORAGE_TOKEN,
    })

    const response = await client.delete(cid)
    res.status(200).json({ message: response })
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Internal Server Error' + error })
  }
}
