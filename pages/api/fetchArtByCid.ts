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

const fetchFromIPFS = async (
  ipfsPath: string,
  retries = 3
): Promise<Uint8Array> => {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${ipfsPath}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const arrayBuffer = await response.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // wait for 1 second before retrying
      return fetchFromIPFS(ipfsPath, retries - 1)
    }
    throw error
  }
}
