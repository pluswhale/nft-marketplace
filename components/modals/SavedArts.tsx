import { FC, ReactElement, useEffect, useState } from 'react'
import { uploadNFT } from '../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../redux/selectors/authSelectors'
import dayjs from 'dayjs'
import { Button } from '../primitives'
import { SavedArtCard } from '../portfolio/SavedArtCard/SavedArtCard'
import styles from './UploadFiles/upload_files_modal.module.scss'
import { NFTStorage } from 'nft.storage'

const NFT_STORAGE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export const SavedArts: FC = (): ReactElement => {
  const [savedArts, setSavedArts] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const userId = useSelector(authUserIdSelector, shallowEqual)

  function fetchWithTimeout(resource: any, options = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Set timeout timer
      const timer = setTimeout(() => {
        reject(new Error('Operation timed out'))
      }, timeout)

      fetch(resource, options)
        .then((response) => {
          clearTimeout(timer)
          resolve(response)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  // Then, use fetchWithTimeout instead of fetch in your useEffect

  useEffect(() => {
    setIsLoading(true)
    uploadNFT
      .getAllSavedArts(userId, page)
      .then(async (res) => {
        if (res.data.items) {
          const promises = res.data.items.map(async (art: any) => {
            let themeName = ''
            if (art.themeId) {
              try {
                const themeResponse = await uploadNFT.getCollectionThemeById(
                  art.themeId as number
                )
                themeName =
                  themeResponse?.data?.collectionTheme?.name?.replace(
                    '_',
                    ' '
                  ) || ''
              } catch (error) {
                console.error('Error fetching theme name:', error)
                // Handle the error appropriately, maybe set a default theme name or leave it empty
              }
            }

            if (art.cid) {
              try {
                const response: any = await fetchWithTimeout(
                  `/api/fetchArtByCid?path=${art.cid}`
                )
                if (!response.ok)
                  throw new Error('Response from API was not ok')
                const decodedData = await response.json()
                const { 'metadata.json': metadataJson } = decodedData

                let metadataUrl,
                  imageUrl = '',
                  metadataAttributes = []
                if (metadataJson && metadataJson['/']) {
                  metadataUrl = `${IPFS_GATEWAY}${metadataJson['/']}`
                  try {
                    const metadataResponse: any = await fetchWithTimeout(
                      metadataUrl
                    )
                    const metadata = await metadataResponse.json()
                    if (metadata.attributes)
                      metadataAttributes = metadata.attributes
                    if (metadata.image)
                      imageUrl = IPFS_GATEWAY + metadata.image.split('://')[1]
                  } catch (error) {
                    console.error('Error fetching metadata:', error)
                    // If metadata fetch fails, proceed without imageUrl and metadataAttributes
                  }
                }

                return {
                  ...art,
                  imageIpfsUrl: imageUrl,
                  metadataAttributes,
                  themeName,
                }
              } catch (error) {
                console.error('Error fetching decoded data:', error)
                return art // In case of an error, return unmodified art object
              }
            } else {
              return { ...art, themeName }
            }
          })

          const uplgradedItems = await Promise.all(promises)
          setSavedArts((prev) => [...prev, ...uplgradedItems])
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [page, userId])

  const handlePaginate = () => {
    setPage((prev) => prev + 1)
  }

  const onDeleteArt = async (cid: string) => {
    await fetch(`api/deleteArtFromNFTStorage?cid=${cid}`)
    await uploadNFT.deleteUserUploadedArt(cid)
    setSavedArts((prev) => prev.filter((art) => art.cid !== cid))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '15px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {savedArts?.length > 0 &&
          !isLoading &&
          savedArts.map((art, index) => (
            <SavedArtCard
              key={index}
              art={{ ...art, serialNumber: index + 1 }}
              onDelete={onDeleteArt}
            />
          ))}
        {isLoading && (
          <img
            className={styles.loader}
            style={{ width: '100px', height: '100px' }}
            src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
            alt="loader"
          />
        )}
      </div>

      {!isLoading && (
        <Button
          css={{ height: '42px', width: 'fit-content', textAlign: 'center' }}
          color={'primary'}
          onClick={handlePaginate}
        >
          Load more
        </Button>
      )}
    </div>
  )
}
