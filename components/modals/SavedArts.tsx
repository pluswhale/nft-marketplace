import { useEffect, useState } from 'react'

type Props = {}

export function SavedArts(props: Props) {
  const [savedArts, setSavedArts] = useState<any[]>([])

  useEffect(() => {
    fetch('api/fetchArtByCid').then((res) => {
      console.log('res', res)
    })
  }, [])

  console.log(savedArts, '202020')

  return (
    <div>
      {savedArts &&
        savedArts.slice(0, 20)?.map((art, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '10px',
              flexDirection: 'column',
              marginBottom: '20px',
            }}
          >
            <div>
              <p>{index + 1}</p>
              <p>Name: {art.name}</p>
              <p>Description: {art.description}</p>
              <p>Created: {art.created_at}</p>
              <p>CID: {art.cid}</p>
              {art.imageUrl && (
                <img
                  src={
                    'https://ipfs.io/ipfs/bafyreihoub2otpyba6n5zkceuwlm222safwjhftyrwoc42aotopgozvm3m'
                  }
                  alt={`Art ${index + 1}`}
                  style={{ width: '100px', height: '100px' }}
                />
              )}
              {art.metadata && (
                <>
                  <p>Metadata Name: {art.metadata.name}</p>
                  <p>Metadata Description: {art.metadata.description}</p>
                </>
              )}
            </div>
          </div>
        ))}
      <img
        src={
          'https://ipfs.io/ipfs/bafyreihoub2otpyba6n5zkceuwlm222safwjhftyrwoc42aotopgozvm3m'
        }
        alt={`Art`}
        style={{ width: '100px', height: '100px' }}
      />
    </div>
  )
}
