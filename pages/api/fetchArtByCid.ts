import { create } from 'ipfs'

// export default async function handler(req: any, res: any) {
//   // Initialize the IPFS node. Note that this can be resource-intensive.
//
//   const ipfs = await create({
//     config: {
//       Addresses: {
//         Swarm: [
//           // Use public IPFS gateways or your own setup as needed
//           '/dns4/ipfs.infura.io/tcp/5001/https',
//         ],
//       },
//     },
//   })
//
//   const metadataCID: any =
//     'bafyreiautl6jjzpzgibpzigmt3wbrz737opn4ud4ozcqz6gs6lqputeghi'
//
//   try {
//     // Fetch the DAG object using the CID
//     const data = await ipfs.dag.get(metadataCID)
//
//     // You might want to convert the data to a format that's easy to send via HTTP
//     const jsonData = data.value.toJSON ? data.value.toJSON() : data.value
//
//     // Send the data back as a response
//     res.status(200).json({ data: jsonData })
//   } catch (error: any) {
//     console.error(error)
//     res
//       .status(500)
//       .json({ error: `Failed to retrieve data: ${error.message || error}` })
//   } finally {
//     // Consider stopping the IPFS node if you're done with it to free up resources
//     await ipfs.stop()
//   }
// }

export default async function handler(req: any, res: any) {
  const metadataCID =
    'bafyreiautl6jjzpzgibpzigmt3wbrz737opn4ud4ozcqz6gs6lqputeghi'

  try {
    // Use a public IPFS gateway to fetch the metadata. Adjust the URL as needed.
    const response = await fetch(`https://ipfs.io/ipfs/${metadataCID}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch CID ${metadataCID} from IPFS`)
    }
    // const data = await response.json()

    // Send the fetched data back as a response
    // res.status(200).json({ data })
  } catch (error: any) {
    console.error(error)
    res
      .status(500)
      .json({ error: `Failed to retrieve data: ${error.message || error}` })
  }
}
