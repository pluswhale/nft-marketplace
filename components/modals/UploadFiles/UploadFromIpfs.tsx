import React, { useEffect, useState } from 'react'

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

const MetadataComponent = () => {
  const [imageSrc, setImageSrc] = useState('')
  const [metadata, setMetadata] = useState<any>(null)

  const metadataUrl =
    'https://bafyreieojik33qkfec53yigixhf6cjmhchtfwkftkzqhttzqdmssumdzji.ipfs.nftstorage.link/' // Example URL

  useEffect(() => {
    fetch(
      `/api/fetchArtByCid?path=bafyreieojik33qkfec53yigixhf6cjmhchtfwkftkzqhttzqdmssumdzji`
    )
      .then((response) => {
        if (!response.ok) throw new Error('Response from API was not ok')
        return response.json() // Expecting JSON response from your API
      })
      .then(async (decodedData) => {
        const { image, 'metadata.json': metadataJson } = decodedData

        // Fetch image

        // For metadata, since it's a JSON, fetch and then parse it
        const metadataUrl = `${IPFS_GATEWAY}${metadataJson['/']}`
        const metadataResponse = await fetch(metadataUrl)

        const metadata = await metadataResponse.json()
        const imageUrl = IPFS_GATEWAY + metadata.image.split('://')[1]
        setImageSrc(imageUrl)
        setMetadata(metadata)
      })
      .catch((error) => console.error('Error fetching decoded data:', error))
  }, [])

  if (!metadata) return <div>Loading...</div>

  return (
    <div>
      {metadata && (
        <>
          <h1>{metadata.name}</h1>
          <p>{metadata.description}</p>
        </>
      )}
      {imageSrc && <img src={imageSrc} alt="IPFS Image" />}
    </div>
  )
}

export default MetadataComponent
