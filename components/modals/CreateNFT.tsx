import {useCallback, useRef, useState} from 'react';
import styles from './create_nft.module.scss';
import axios from "axios";
import {File, NFTStorage} from "nft.storage";
import Dropzone from "../common/DropZone/DropZone";
import {signIn} from "next-auth/react";
import DriveFiles from "./DriveFiles";

import Mint from "../buttons/Mint";
import UploadFiles from "./UploadFiles";
import {UploadFilesModal} from "./UploadFiles/UploadFilesModal";

// Replace XXXXX with the API key which you got on https://rarible.org
// undefined - is wallet instance. You can pass undefined to ignore wallet connection at this stage

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZCMzA3RjYzMEZFQjIzMTRjNjZiMzc3NEZlYzg1MkU5ODYxOTBkM0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMDQwOTg4MzI3MywibmFtZSI6Im5mdC1tYXJrZXRwbGFjZSJ9.gRw8xMKCCO8mOfHKyWaWFbq2i6MW6S6E-e8ODuSQbRc'
const rarible_key = '3375663b-a2b2-41ff-8c23-f1b7713c0ae4';

// // 1. Configure providers
// const injected = new InjectedWeb3ConnectionProvider({
//     // optional, order of dapps preferred to connect
//     prefer: [DappType.Metamask, DappType.Coinbase],
// })
//
// // 2. Create connector
// const connector = Connector
//     .create(injected)
//
// // 3. Connector ready to use
// connector.connection.subscribe((con: any) => {
//     if (con.status === "connected") {
//         // use connection to create sdk here
//     }
// })
//
// // get list of available options
// const options = await connector.getOptions()
// // connect to first one
// await connector.connect(options[0])
//
// const sdk = createRaribleSdk(undefined, "prod", { apiKey: rarible_key });


const metadataEx = {
    "dna": "5506f78b3857d578242f725691b14c22fc29544f",
    "name": "#1000",
    "description": "Curious Addys' Trading Club",
    "image": "ipfs://QmP9ayW28pbW2V9nYAJEbxv45MTez0pz8S913VbV56nkCg/1000.png",
    "external_url": "https://curiousaddys.com/addy/1000",
    "attributes": [
    {
        "trait_type": "Background",
        "value": "Pastel Blue"
    },
    {
        "trait_type": "Body",
        "value": "Original"
    },
    {
        "trait_type": "Expression",
        "value": "Eyes"
    },
    {
        "trait_type": "Top Tentacle Items",
        "value": "Pink Umbrella"
    },
    {
        "trait_type": "Neck Item",
        "value": "White Ribbon"
    },
    {
        "trait_type": "Head Item",
        "value": "Sleeping Mask"
    },
    {
        "trait_type": "Center Left Tentacle Item",
        "value": "Calculator"
    },
    {
        "trait_type": "Center Right Tentacle Item",
        "value": "Yacht"
    },
    {
        "trait_type": "Mid Left Tentacle Item",
        "value": "ETH"
    },
    {
        "trait_type": "Lore",
        "value": "263"
    }
]

}

const CreateNft = () => {
  const [file, setFile] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<any>(null)
  const [name, setName] = useState<any>('')
  const [urlToImage, setUrlToImage] = useState<any>('')
  const [description, setDescription] = useState<any>('')
  const [externalUrlMetadata, setExternalUrlMetadata] = useState<any>('')
  const [metadataAttributes, setMetadataAttributes] = useState<any>([])
  const [metadata, setMetadata] = useState<any>({})
  const [isLoadingToIPFS, setIsLoadingToIPFS] = useState<boolean>(false)
    const [isModalUploadFilesOpened, setItsModalUploadFilesOpened] = useState<boolean>(false);

  const fileRef = useRef<any>(null)

  const handleClickToFile = () => {
    fileRef.current.click()
  }

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles) {
      setFile(acceptedFiles[0])

      // Create a URL for the file
      const fileUrl = URL.createObjectURL(acceptedFiles[0])
      setPreviewUrl(fileUrl)
    }
  }, [])

  const handleFileChange = (event: any) => {
    setFile(event.target.files[0])
  }

  const handleSignInGoogle = () => {
    signIn('google')
  }

  const handleAddMetadataAttribute = () => {
    const len = metadataAttributes.length
    setMetadataAttributes([
      ...metadataAttributes,
      { id: len + 1, trait_type: '', value: '' },
    ])
  }

  const handleDeleteMetadataAttribute = (attributeId: number) => {
    const filteredAttr = metadataAttributes.filter(
      (attribute: any) => attribute.id !== attributeId
    )
    setMetadataAttributes(filteredAttr)
  }

  const handleEditTraitMetadataAttribute = (
    attributeId: number,
    traitType: string
  ) => {
    const editedAttributes = metadataAttributes.map((attribute: any) => {
      if (attribute.id === attributeId) {
        return { ...attribute, trait_type: traitType }
      } else {
        return attribute
      }
    })
    setMetadataAttributes(editedAttributes)
  }

  const handleEditValueMetadataAttribute = (
    attributeId: number,
    value: string
  ) => {
    const editedAttributes = metadataAttributes.map((attribute: any) => {
      if (attribute.id === attributeId) {
        return { ...attribute, value: value }
      } else {
        return attribute
      }
    })
    setMetadataAttributes(editedAttributes)
  }

  const handleSubmit = async () => {
    try {
      setIsLoadingToIPFS(true)

      if (urlToImage) {
        getImageFromDrive(urlToImage)
          .then((file) => {
            setFile(file)
            const fileUrl = URL.createObjectURL(file)
            setPreviewUrl(fileUrl)
            // Do something with the file object...
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      }

      console.log('file', file)

      const response = await uploadFile(
        file,
        name,
        description,
        externalUrlMetadata,
        metadataAttributes,
        setMetadata
      )

      setIsLoadingToIPFS(false)

      if (response) {
        // const uploadedMetadata = await fetchIPFSJson(response.url);
        const imageUrl = response.data.image.href
        setMetadata((prev: any) => {
          delete prev.image
          return prev
        })
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setIsLoadingToIPFS(false)
  }

  // MODAL LOGIC

    const onOpenUploadFilesModal = () => {
        setItsModalUploadFilesOpened(true);
    }

    const onCloseUploadFilesModal = () => {
        setItsModalUploadFilesOpened(false);
    }

  return (
    <div className={styles.create_nft}>
      {/*<input*/}
      {/*  style={{ display: 'none' }}*/}
      {/*  ref={fileRef}*/}
      {/*  type="file"*/}
      {/*  onChange={handleFileChange}*/}
      {/*  accept={'image/png,jpeg'}*/}
      {/*/>*/}

      <div className={styles.create_nft__container}>
        {/*<div className={styles.create_nft__image_and_metadata}>*/}
        {/*  <div className={styles.create_nft__image_upload}>*/}
        {/*    {isLoadingToIPFS ? (*/}
        {/*      <span className={styles.create_nft__heading}>Loading....</span>*/}
        {/*    ) : (*/}
        {/*      <>*/}
        {/*        {previewUrl && <img src={previewUrl} />}*/}
        {/*        {!urlToImage.length && <Dropzone onDrop={onDrop} />}*/}
        {/*        {!previewUrl && (*/}
        {/*          <>*/}
        {/*            <span className={styles.create_nft__heading}>*/}
        {/*              {urlToImage.length*/}
        {/*                ? 'Link to URL'*/}
        {/*                : 'Or paste an URL to art'}*/}
        {/*            </span>*/}
        {/*            <input*/}
        {/*              className={styles.create_nft__input}*/}
        {/*              type="text"*/}
        {/*              value={urlToImage}*/}
        {/*              onChange={(e) => setUrlToImage(e.target.value)}*/}
        {/*              placeholder="URL to image"*/}
        {/*            />*/}
        {/*          </>*/}
        {/*        )}*/}
        {/*      </>*/}
        {/*    )}*/}
        {/*  </div>*/}

        {/*  <div className={styles.create_nft__metadata}>*/}
        {/*    <span className={styles.create_nft__heading}>Other metadata</span>*/}
        {/*    <input*/}
        {/*      className={styles.create_nft__input}*/}
        {/*      type="text"*/}
        {/*      value={name}*/}
        {/*      onChange={(e) => setName(e.target.value)}*/}
        {/*      placeholder="Name"*/}
        {/*    />*/}
        {/*    <textarea*/}
        {/*      className={styles.create_nft__textarea}*/}
        {/*      value={description}*/}
        {/*      onChange={(e) => setDescription(e.target.value)}*/}
        {/*      placeholder="Description"*/}
        {/*    ></textarea>*/}
        {/*    <input*/}
        {/*      className={styles.create_nft__input}*/}
        {/*      type="text"*/}
        {/*      value={externalUrlMetadata}*/}
        {/*      onChange={(e) => setExternalUrlMetadata(e.target.value)}*/}
        {/*      placeholder="External URL"*/}
        {/*    />*/}
        {/*    <span className={styles.create_nft__heading}>Attributes</span>*/}
        {/*    <div className={styles.create_nft__metadata_attributes}>*/}
        {/*      {metadataAttributes &&*/}
        {/*        metadataAttributes.map((attribute: any) => {*/}
        {/*          return (*/}
        {/*            <div className={styles.create_nft__metadata_attribute}>*/}
        {/*              <input*/}
        {/*                className={styles.create_nft__input}*/}
        {/*                type="text"*/}
        {/*                value={attribute.trait_type}*/}
        {/*                onChange={(e) =>*/}
        {/*                  handleEditTraitMetadataAttribute(*/}
        {/*                    attribute.id,*/}
        {/*                    e.target.value*/}
        {/*                  )*/}
        {/*                }*/}
        {/*                placeholder="trait type"*/}
        {/*              />*/}
        {/*              <input*/}
        {/*                className={styles.create_nft__input}*/}
        {/*                type="text"*/}
        {/*                value={attribute.value}*/}
        {/*                onChange={(e) =>*/}
        {/*                  handleEditValueMetadataAttribute(*/}
        {/*                    attribute.id,*/}
        {/*                    e.target.value*/}
        {/*                  )*/}
        {/*                }*/}
        {/*                placeholder="value"*/}
        {/*              />*/}
        {/*              <button*/}
        {/*                onClick={() =>*/}
        {/*                  handleDeleteMetadataAttribute(attribute.id)*/}
        {/*                }*/}
        {/*                className={styles.create_nft__metadata_attribute_btn}*/}
        {/*              >*/}
        {/*                🗑️*/}
        {/*              </button>*/}
        {/*            </div>*/}
        {/*          )*/}
        {/*        })}*/}
        {/*      <button*/}
        {/*        onClick={handleAddMetadataAttribute}*/}
        {/*        className={styles.create_nft__button}*/}
        {/*      >*/}
        {/*        +*/}
        {/*      </button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*<button*/}
        {/*  className={styles.create_nft__button}*/}
        {/*  onClick={handleSubmit}*/}
        {/*  type="button"*/}
        {/*>*/}
        {/*  Upload art*/}
        {/*</button>*/}
        {/*<button*/}
        {/*  style={{ marginTop: '20px' }}*/}
        {/*  className={styles.create_nft__button}*/}
        {/*  onClick={handleSignInGoogle}*/}
        {/*  type="button"*/}
        {/*>*/}
        {/*  Sign in google*/}
        {/*</button>*/}

        <button
          style={{ marginTop: '20px' }}
          className={styles.create_nft__button}
          onClick={onOpenUploadFilesModal}
          type="button"
        >
          Upload Files
        </button>

          {isModalUploadFilesOpened && <UploadFilesModal onClose={onCloseUploadFilesModal}/> }

        {/*<DriveFiles/>*/}

        {/*<UploadFiles url={'/api/uploadImages'}/>*/}
        {/*<UploadFiles url={'/api/uploadMetadata'}/>*/}
      </div>

      {/*<button onClick={createCollection}>Create Collection</button>*/}
    </div>
  )
}

export default CreateNft

export const config = {
  api: {
    bodyParser: false,
  },
}

async function uploadFile(
  file: File,
  name: string,
  description: string,
  externalUrl: string,
  metadataAttributes: any,
  setMetadata: any
) {
  const client = new NFTStorage({ token })

  // Preparing the file for upload
  const nftStorageFile = new File([file], file.name, { type: file.type })

  const nft = {
    image: nftStorageFile,
    name,
    description,
    external_url: externalUrl,
    attributes: metadataAttributes,
  }

  setMetadata(nft)

  // Ensure you await the store function
  return await client.store(nft)
}

async function mintLazyNFT(mintNftJson: any) {

    try {
        const response = await axios.post('https://api.rarible.org/v0.1/items/lazy/mint', mintNftJson, {
            headers: {
                accept: 'application/json',
                'X-API-KEY': process.env.RARIBLE_API_KEY || rarible_key
            }
        });

        console.log('Minted NFT:', response.data);
    } catch (error) {
        console.error('Error minting NFT:', error);
    }
}


async function fetchIPFSJson(ipfsUrl: string): Promise<any> {
    // Convert the IPFS URL to an HTTP URL by replacing the protocol and using a public gateway
    const httpUrl = ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');

    console.log('httpUrl', httpUrl);

    try {
        const response = await axios.get(httpUrl);
        if (!response) {
            throw new Error(`Failed to fetch data from IPFS: ${response}`);
        }
        return response;
    } catch (error) {
        console.error("Error fetching IPFS data:", error);
        throw error;
    }
}

async function createCollection() {
    // const { address, tx } = await sdk.nft.createCollection({
    //     blockchain: Blockchain.ETHEREUM,
    //     type: "ERC721",
    //     name: "Test Collection",
    //     symbol: "RARI",
    //     baseURI: "https://ipfs.rarible.com",
    //     contractURI: "https://ipfs.rarible.com",
    //     isPublic: true,
    // });

    // return {
    //     address,
    //     tx,
    // }
}

//[
//             {
//                 "trait_type": "Background",
//                 "value": "Pastel Blue"
//             },
//             {
//                 "trait_type": "Body",
//                 "value": "Original"
//             },
//             {
//                 "trait_type": "Expression",
//                 "value": "Eyes"
//             },
//             {
//                 "trait_type": "Top Tentacle Items",
//                 "value": "Pink Umbrella"
//             },
//             {
//                 "trait_type": "Neck Item",
//                 "value": "White Ribbon"
//             },
//             {
//                 "trait_type": "Head Item",
//                 "value": "Sleeping Mask"
//             },
//             {
//                 "trait_type": "Center Left Tentacle Item",
//                 "value": "Calculator"
//             },
//             {
//                 "trait_type": "Center Right Tentacle Item",
//                 "value": "Yacht"
//             },
//             {
//                 "trait_type": "Mid Left Tentacle Item",
//                 "value": "ETH"
//             },
//             {
//                 "trait_type": "Lore",
//                 "value": "263"
//             }
//         ]


async function getImageFromDrive(driveUrl: string): Promise<File> {
    try {
        // Fetch the image data as a Blob
        const response = await axios.get(driveUrl, {
            responseType: 'blob',
        });

        // Create a file from the Blob
        return new File([response.data], 'filename.png', {
            type: 'image/png',
        });
    } catch (error) {
        console.error('Error fetching image from Google Drive:', error);
        throw error;
    }
}

// const jsonForMintNft = {
//     item: {
//
//         image: imageUrl,
//         description,
//         name,
//         "external_url": "https://curiousaddys.com/addy/1000",
//         "attributes": [
//             {
//                 "trait_type": "Background",
//                 "value": "Pastel Blue"
//             },
//             {
//                 "trait_type": "Body",
//                 "value": "Original"
//             },
//             {
//                 "trait_type": "Expression",
//                 "value": "Eyes"
//             },
//             {
//                 "trait_type": "Top Tentacle Items",
//                 "value": "Pink Umbrella"
//             },
//             {
//                 "trait_type": "Neck Item",
//                 "value": "White Ribbon"
//             },
//             {
//                 "trait_type": "Head Item",
//                 "value": "Sleeping Mask"
//             },
//             {
//                 "trait_type": "Center Left Tentacle Item",
//                 "value": "Calculator"
//             },
//             {
//                 "trait_type": "Center Right Tentacle Item",
//                 "value": "Yacht"
//             },
//             {
//                 "trait_type": "Mid Left Tentacle Item",
//                 "value": "ETH"
//             },
//             {
//                 "trait_type": "Lore",
//                 "value": "263"
//             }
//         ]
//     }
// }

// await mintLazyNFT(jsonForMintNft);