import { create } from 'ipfs-http-client'

export default async function handler(req: any, res: any) {
  const ipfs = create({ url: 'https://ipfs.infura.io:5001' })
  const cid = req.query.cid

  try {
    const chunks = []
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk)
    }
    const data = Buffer.concat(chunks)

    res.writeHead(200, {
      'Content-Type': 'image/jpeg', // Adjust based on actual content type
      'Content-Length': data.length,
    })
    res.end(data)
  } catch (error: any) {
    res.status(500).json({ error: `Failed to retrieve data: ${error.message}` })
  }
}
