import Dropzone from '../../common/DropZone/DropZone'
import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import styles from './upload_files_modal.module.scss'
import { CustomizedLinearProgressBar } from '../../linear-progress/CustomizedLinearProgressBar'
import { normalizeProgress } from '../../../utils/normilizeProgress'
import { useAppDispatch } from '../../../redux/store'
import { addCid, clearCids } from '../../../redux/slices/uploadNFT'
import { FaPauseCircle } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import { FcFullTrash } from 'react-icons/fc'
import store from '../../../redux/store'
import { uploadNFT } from '../../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../../redux/selectors/authSelectors'
import { generateMetadataContent } from '../../../utils/generateRandomPhrases'
import { GridVirtualList } from '../../virtual-lists/index'
import { ToastContext } from '../../../context/ToastContextProvider'
import { checkImageResolution } from '../../../utils/checkImageResolution'
import { TfiReload } from 'react-icons/tfi'
import Button from '../../primitives/Button'
import { Input } from '../../primitives'
import axios from 'axios'
import { sortFilesByName } from '../../../utils/sortFileByName'
import { capitalizeFirstLetter } from '../../../utils/capitalizeFirstLetterInString'

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

type Props = {
  onClose: () => void
}

const LENGTH_OF_MOCK_FILES = 10

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

export function UploadFilesModal({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const [currentStep, setCurrentStep] = useState<
    'input-initial' | 'upload-files'
  >('input-initial')
  const [userInitials, setUserInitials] = useState<string>('')
  const [images, setImages] = useState<File[]>([])
  const [metadatas, setMetadatas] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoadingToIPFS, setIsLoadingToIPFS] = useState<boolean>(false)
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false)
  const [isRegeneratingMetadata, setIsRegeneratingMetadata] =
    useState<boolean>(false)
  const [isStartClearingUploadedFiles, setIsStartClearingUploadedFiles] =
    useState<boolean>(false)
  const [collectionTheme, setCollectionTheme] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const isPaused = useRef<any>(false)
  const isCancelled = useRef<any>(false)
  const authUserId = useSelector(authUserIdSelector, shallowEqual)
  let estimationTimeOfUploading = Math.ceil((images?.length * 2) / 60) // in mins
  const { addToast } = useContext(ToastContext)

  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isLoadingToIPFS) {
        event.preventDefault()
        event.returnValue =
          'Are you sure you want to leave? All progress will be lost.'
        return event.returnValue
      }
    }

    if (isLoadingToIPFS) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoadingToIPFS])

  useEffect(() => {
    let globalImageIndex = 1
    const fetchBatch = async (batchSize: number, startIndex = 0) => {
      const endIndex = startIndex + batchSize
      const imageUrls = Array.from(
        { length: batchSize },
        (_, index) =>
          `https://picsum.photos/200/300?random=${startIndex + index}`
      )

      const imageResponses = await Promise.all(
        imageUrls.map((url) => fetch(url))
      )
      const imageBlobs = await Promise.all(
        imageResponses.map((response) => response.blob())
      )

      const imageFiles = imageBlobs.map((blob) => {
        // Use the global image index for naming
        const fileName = `ak${globalImageIndex}.jpg`
        globalImageIndex++ // Increment for the next image
        return new File([blob], fileName, {
          type: 'image/jpeg',
        })
      })

      const newPreviewUrls = imageFiles.map((file) => URL.createObjectURL(file))

      setImages((prevImages) => [...prevImages, ...imageFiles])
      setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

      const generatedMetadata = imageFiles.map((file, index: number) => {
        const cutFilaName = file?.name?.split('.')[0]

        const data = {
          name: generateMetadataContent(2)?.name,
          description: generateMetadataContent(5)?.description,
        }

        return new File([JSON.stringify(data)], `${cutFilaName}.json`, {
          type: 'application/json',
        })
      })

      //@ts-ignore
      setMetadatas((prevMetadatas) => [...prevMetadatas, ...generatedMetadata])

      await sleep(1000)
    }

    const totalFiles = LENGTH_OF_MOCK_FILES
    let batchSize = 10

    // for (let startIndex = 0; startIndex < totalFiles; startIndex += batchSize) {
    //   const remainingFiles = totalFiles - startIndex
    //   batchSize = Math.min(batchSize, remainingFiles)
    //
    //   fetchBatch(batchSize, startIndex).catch(console.error)
    // }
  }, [])

  const waitForResume = async () => {
    while (isPaused.current) {
      await sleep(100)
    }
  }

  const onDropImages = useCallback(
    (acceptedFiles: File[]) => {
      setIsLoadingImages(true)

      // Organize files by folders
      const filesByFolder = acceptedFiles.reduce((acc: any, file: any) => {
        // Extract folder name from file path; this depends on your environment
        const folderName = capitalizeFirstLetter(
          file.path?.split('/')?.[1]?.split('/')?.[0]?.replace(' ', '_')
        )
        setCollectionTheme(folderName)
        if (!acc[folderName]) {
          acc[folderName] = []
        }
        acc[folderName].push(file)
        return acc
      }, {})

      // Process files for each folder
      Object.entries(filesByFolder).forEach(
        ([folderName, files], folderIndex) => {
          //@ts-ignore
          const filteredFiles = files.filter((newFile) => {
            return !images.some(
              (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
            )
          })

          const sortedFiles = sortFilesByName(filteredFiles)

          // Generate new filenames based on user initials and serial number
          const updatedFilesWithNewNames = sortedFiles.map((file, index) => {
            const serialNumber = images.length + index + 1 // Assuming images is the current array of files
            const extension = file.name.split('.').pop()
            const newName = `${userInitials}${serialNumber
              .toString()
              .padStart(3, '0')}.${extension}`
            return new File([file], newName, { type: file.type })
          })

          const imageLoadPromises = updatedFilesWithNewNames.map(
            (file, index) => {
              return new Promise((resolve, reject) => {
                const image = new Image()
                image.onload = () => {
                  const resolution = checkImageResolution(
                    image.width,
                    image.height
                  )

                  const cutFileName = file.name.split('.')[0]
                  const data = {
                    name: generateMetadataContent(2)?.name,
                    description: generateMetadataContent(5)?.description,
                    resolution,
                  }
                  const metadataFile = new File(
                    [JSON.stringify(data)],
                    `${cutFileName}.json`,
                    {
                      type: 'application/json',
                    }
                  )
                  resolve({
                    file,
                    metadataFile,
                    previewUrl: URL.createObjectURL(file),
                  })
                }
                image.onerror = reject
                image.src = URL.createObjectURL(file)
              })
            }
          )

          Promise.all(imageLoadPromises)
            .then((results) => {
              const updatedFiles = [...images, ...updatedFilesWithNewNames]
              setImages(updatedFiles)

              //@ts-ignore
              const newPreviewUrls = results.map((result) => result.previewUrl)
              setPreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls])

              //@ts-ignore
              const generatedMetadata = results.map(
                (result: any) => result.metadataFile
              )
              //@ts-ignore
              setMetadatas((prevMetadatas) => [
                ...prevMetadatas,
                ...generatedMetadata,
              ])

              setIsLoadingImages(false)
            })
            .catch((error) => {
              console.error('Error loading one or more images:', error)
              setIsLoadingImages(false)
            })
        }
      )
    },
    [images, userInitials]
  )

  const handleUploadFiles = async () => {
    setIsLoadingToIPFS(true)
    const themeId = (
      await uploadNFT.createCollectionThemeByName(collectionTheme as string)
    )?.data?.collectionTheme?.[0]?.id

    const delayBetweenUploads = 500 // Delay in milliseconds, adjust as needed
    const filesLength = Math.ceil(images?.length) || 0
    let curFile = 0

    for (let index = 0; index < filesLength; index++) {
      if (isCancelled.current) {
        break
      }

      await waitForResume()

      const imageFile = images[index]
      const metadataFile = metadatas[index]
      if (!metadataFile) {
        continue
      }

      try {
        const metadataText: any = await readMetadataFile(metadataFile)
        const metadataJson = JSON.parse(metadataText)

        const formData = new FormData()

        formData.append('name', metadataJson?.name)
        formData.append('description', metadataJson?.description)
        metadataJson?.external_url &&
          formData.append('externalUrl', metadataJson?.external_url)
        metadataJson?.attributes &&
          formData.append('metadataAttributes', metadataJson?.attributes)
        formData.append('file', imageFile)

        const response = await axios.post('/api/storeArtToIpfs', formData)

        let metadataUrl,
          imageUrl = '',
          metadataAttributes = []

        if (response.data?.ipnft) {
          try {
            const ipfsDataByCid: any = await fetch(
              `/api/fetchArtByCid?path=${response.data?.ipnft}`
            )

            const decodedData = await ipfsDataByCid.json()
            const { 'metadata.json': metadataJson } = decodedData

            if (metadataJson && metadataJson['/']) {
              metadataUrl = `${IPFS_GATEWAY}${metadataJson['/']}`
              try {
                const metadataResponse: any = await fetch(metadataUrl)
                const metadata = await metadataResponse.json()
                if (metadata.attributes)
                  metadataAttributes = metadata.attributes
                if (metadata.image)
                  imageUrl = IPFS_GATEWAY + metadata.image.split('://')?.[1]
              } catch (error) {
                console.error('Error fetching metadata:', error)
              }
            }
          } catch (error) {
            console.error('Error fetching decoded data:', error)
          }
        }

        if (response.data?.ipnft) {
          const savedData = {
            userId: authUserId,
            itemId: response?.data?.ipnft,
            name: metadataJson?.name,
            description: metadataJson.description,
            cid: response?.data?.ipnft,
            imageUrl: imageUrl,
            metadataUrl: response?.data?.ipnft + '/metadata.json',
            resolution: metadataJson?.resolution,
            minted: false,
          } as any

          if (themeId) savedData.collectionThemeId = themeId

          // Store in DB
          const res = await uploadNFT.saveUserUploadedArt(savedData)

          if (res.status === 200) {
            dispatch(addCid({ cid: response?.data?.ipnft }))
          }
        }

        if (!response) {
          console.error(`Failed to upload image ${index + 1}`)
        }
      } catch (error) {
        console.error('An error occurred during the upload process:', error)
      }

      setProgress(Math.floor((curFile / filesLength) * 100))

      curFile = curFile + 1

      await sleep(delayBetweenUploads)
    }

    if (isCancelled.current) {
      const currentUploadedCids = store.getState().uploadNFT.uploadedCids // Adjust according to your state structure
      setIsStartClearingUploadedFiles(true)
      if (currentUploadedCids?.length) {
        for (const cid of currentUploadedCids) {
          try {
            await fetch(`api/deleteArtFromNFTStorage?cid=${cid}`)
            await uploadNFT.deleteUserUploadedArt(cid)
          } catch (error) {
            console.error(`Failed to delete CID: ${cid}`, error)
          }

          await sleep(delayBetweenUploads)
        }

        setIsStartClearingUploadedFiles(false)
      }

      cleanUp()
      console.log('Upload cancelled.')
    }

    setProgress(0)
    !isCancelled.current &&
      addToast?.({ title: 'Your arts was uploaded.', status: 'success' })
    setIsLoadingToIPFS(false)
    isPaused.current = false
    isCancelled.current = false
  }

  const onRegenerateMetadata = () => {
    setIsRegeneratingMetadata(true)
    const imageLoadPromises = images.map((file) => {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => {
          const resolution = checkImageResolution(image.width, image.height)

          const cutFileName = file.name.split('.')[0]
          const data = {
            name: generateMetadataContent(2)?.name,
            description: generateMetadataContent(5)?.description,
            resolution,
          }
          const metadataFile = new File(
            [JSON.stringify(data)],
            `${cutFileName}.json`,
            {
              type: 'application/json',
            }
          )
          resolve({
            file,
            metadataFile,
            previewUrl: URL.createObjectURL(file),
          })
        }
        image.onerror = reject
        image.src = URL.createObjectURL(file)
      })
    })

    Promise.all(imageLoadPromises)
      .then((results) => {
        //@ts-ignore
        const generatedMetadata = results.map((result) => result.metadataFile)
        //@ts-ignore
        setMetadatas(generatedMetadata)
      })
      .catch((error) => {
        console.error('Error loading one or more images:', error)
      })
      .finally(() => {
        setTimeout(() => {
          setIsRegeneratingMetadata(false)
        }, 2000)
      })
  }

  const readMetadataFile = async (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event: any) => {
        resolve(event.target.result)
      }
      reader.onerror = (error) => {
        reject(error)
      }
      reader.readAsText(file)
    })
  }

  const handleCloseModal = () => {
    if (isLoadingToIPFS) return
    onClose()
  }

  const handleDeleteFile = (fileIndex: number) => {
    const newImages = images.filter(
      (_: File, index: number) => index !== fileIndex
    )
    setImages(newImages)

    const newMetadata = metadatas.filter(
      (_: File, index: number) => index !== fileIndex
    )
    setMetadatas(newMetadata)

    const newPreviewUrls = previewUrls.filter(
      (_: string, index: number) => index !== fileIndex
    )
    setPreviewUrls(newPreviewUrls)
  }

  function cleanUp() {
    dispatch(clearCids())
  }

  const pauseUpload = () => {
    isPaused.current = true
  }
  const resumeUpload = () => {
    isPaused.current = false
  }
  const cancelUpload = () => {
    isCancelled.current = true
  }

  const imagePreview = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
  }) => {
    const index = rowIndex * 10 + columnIndex // Calculate index based on row and column

    if (index >= images.length) {
      return null
    }

    return (
      <div style={style} className={styles.preview_image_wrapper}>
        <img
          className={styles.preview_image}
          src={previewUrls[index]}
          alt={images.length ? images?.[index]?.name : 'image preview'}
        />
        <div className={styles.overlay}>
          <span className={styles.preview_image_name}>
            {images?.[index]?.name}
          </span>
          <FcFullTrash
            title="Delete file"
            onClick={() => handleDeleteFile(index)}
          />
        </div>
      </div>
    )
  }

  const jsonPreview = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number
    rowIndex: number
    style: CSSProperties
  }) => {
    const index = rowIndex * 10 + columnIndex // Calculate index based on row and column

    if (index >= images.length) {
      return null
    }

    return (
      <div style={style} className={styles.json_preview}>
        <div>{metadatas?.[index]?.name}</div>
        <img
          className={styles.preview_image}
          src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/json_format_icon.png`}
          alt={metadatas?.length ? metadatas?.[index]?.name : 'image preview'}
        />
      </div>
    )
  }

  return (
    <div className={styles.container} role={'dialog'}>
      <div className={styles.overlay} onClick={handleCloseModal}></div>
      <div className={styles.content}>
        {isLoadingToIPFS ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              width: '100%',
            }}
          >
            {!isStartClearingUploadedFiles ? (
              <>
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CustomizedLinearProgressBar
                    progress={normalizeProgress(progress)}
                  />

                  <div style={{ display: 'flex', gap: '5px' }}>
                    {isPaused.current && (
                      <FaPlay
                        title={'Resume uploading'}
                        style={{ cursor: 'pointer', color: '#5B5BD6' }}
                        onClick={resumeUpload}
                      />
                    )}
                    {!isPaused.current && (
                      <FaPauseCircle
                        title={'Pause uploading'}
                        style={{ cursor: 'pointer', color: '#5B5BD6' }}
                        onClick={pauseUpload}
                      />
                    )}
                    <MdCancel
                      title={'Cancel uploading'}
                      style={{ cursor: 'pointer', color: '#5B5BD6' }}
                      onClick={cancelUpload}
                    />
                  </div>
                </div>
                <p className={styles.loader_title}>
                  Your files is uploading to a decentralized storage. Please
                  wait and don't close the window. <br />
                  Approximately time for uploading is:{' '}
                  {estimationTimeOfUploading} minutes.
                </p>
              </>
            ) : (
              <>
                <img
                  className={styles.loader}
                  style={{ width: '100px', height: '100px' }}
                  src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
                  alt="loader"
                />
                <p className={styles.loader_title}>
                  Your files will be deleted from storages in due to safe the
                  space.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {currentStep === 'input-initial' ? (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Input
                  css={{ width: '500px' }}
                  placeholder={
                    'Type your initials. For example: If you are John Doe, type - jd'
                  }
                  value={userInitials}
                  onChange={({ target }) => setUserInitials(target.value)}
                />
                <Button
                  disabled={!userInitials}
                  onClick={() => setCurrentStep('upload-files')}
                >
                  Go uploading
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.images}>
                  <div>
                    <p style={{ color: 'gray' }}>
                      Your initials: {userInitials}
                    </p>
                    <p style={{ color: 'gray' }}>
                      Theme: {collectionTheme?.replace('_', ' ')}
                    </p>
                  </div>
                  <p style={{ fontWeight: 600 }}>Upload the images</p>
                  <Dropzone
                    title={'Drag and drop images or selected in files'}
                    accept={{
                      'image/*': ['.jpeg', '.png', '.jpg'],
                    }}
                    multiple={true}
                    onDrop={onDropImages}
                    isLoading={isLoadingImages}
                  />

                  {previewUrls?.length ? (
                    <GridVirtualList
                      styles={{ gridGap: '10px' }}
                      columnCount={10}
                      columnWidth={100}
                      height={previewUrls?.length < 11 ? 150 : 150}
                      rowCount={Math.ceil(previewUrls?.length / 10)}
                      rowHeight={150}
                      width={1105}
                      gap={10}
                    >
                      {imagePreview}
                    </GridVirtualList>
                  ) : null}
                </div>
                <div className={styles.metadata}>
                  {metadatas?.length ? (
                    <>
                      <p style={{ fontWeight: 600 }}>Your Metadata</p>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '16px',
                        }}
                      >
                        Press to automatically regenerate metadata -
                        <button
                          className={styles.button}
                          style={{ width: 'fit-content' }}
                          onClick={onRegenerateMetadata}
                        >
                          <TfiReload />
                        </button>
                      </div>
                    </>
                  ) : null}

                  <div className={styles.react_window_list_container}>
                    {isRegeneratingMetadata ? (
                      <img
                        className={styles.loader}
                        style={{ width: '100px', height: '100px' }}
                        src={`${process.env.NEXT_PUBLIC_HOST_URL}/loaders/loader_round.svg`}
                        alt="loader"
                      />
                    ) : (
                      <>
                        {metadatas?.length ? (
                          <GridVirtualList
                            styles={{ gridGap: '10px' }}
                            columnCount={10}
                            columnWidth={100}
                            height={metadatas?.length < 11 ? 150 : 150}
                            rowCount={Math.ceil(metadatas?.length / 10)}
                            rowHeight={150}
                            width={1105}
                            gap={10}
                          >
                            {jsonPreview}
                          </GridVirtualList>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
                <button
                  className={styles.button}
                  onClick={handleUploadFiles}
                  type="button"
                >
                  Upload files
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
