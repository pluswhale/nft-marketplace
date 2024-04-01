import { decode } from '@ipld/dag-cbor'
import type { NextApiRequest, NextApiResponse } from 'next'

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ipfsPath = req.query.path as string // Ensuring 'path' is treated as a string

  try {
    // Fetch data from IPFS
    const rawData = await fetchFromIPFS(ipfsPath)

    // Decode the dag-cbor data
    const decodedData = decode(rawData) // This operation is synchronous

    // Return the resolved data as JSON
    res.status(200).json(decodedData)
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({ error: 'Internal Server Error' + error })
  }
}

const fetchFromIPFS = async (ipfsPath: string): Promise<Uint8Array> => {
  const response = await fetch(`${IPFS_GATEWAY}${ipfsPath}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }

  // Read the response as ArrayBuffer and convert to Uint8Array
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}
