import dayjs from 'dayjs'
import { FC, ReactElement } from 'react'
import styles from './savedArtCard.module.scss'
import { Button } from '../../primitives'

type Props = {
  art: {
    serialNumber: number
    cid: string
    description: string
    name: string
    createdAt: string
    themeName: string | null
    imageUrl: string
    resolution?: string
    imageIpfsUrl?: string
    minted: boolean
  }
  onDelete: (cid: string) => void
}

export const SavedArtCard: FC<Props> = ({ art, onDelete }): ReactElement => {
  const {
    serialNumber,
    resolution,
    createdAt,
    imageIpfsUrl,
    imageUrl,
    cid,
    name,
    description,
    minted,
    themeName,
  } = art || {}

  return (
    <div className={styles.savedArt}>
      <div className={styles.savedArt__content}>
        {imageUrl ? (
          <img
            className={styles.savedArt__cover}
            src={'https://ipfs.io/ipfs/' + imageUrl}
          />
        ) : null}
        <p className={styles.savedArt__text}>Name: {name}</p>
        <p className={styles.savedArt__text}>Description: {description}</p>
        <p className={styles.savedArt__text}>
          Created: {dayjs(createdAt).format('YYYY-MM-DD-HH:mm:ss')}
        </p>
        {resolution ? (
          <p className={styles.savedArt__text}>Resolution: {resolution} </p>
        ) : null}
        {!minted ? <p style={{ color: 'orangered' }}> Not minted yet</p> : null}
        {themeName ? <p>Theme: {themeName}</p> : null}
        <div className={styles.savedArt__action_btns}>
          <Button
            disabled
            css={{ height: '42px', width: '250px', textAlign: 'center' }}
            color={'primary'}
          >
            Mint(Coming soon..)
          </Button>
          <Button
            onClick={() => onDelete(cid)}
            css={{
              height: '42px',
              width: '250px',
              textAlign: 'center',
            }}
            color={'secondary'}
          >
            Delete from storage
          </Button>
        </div>
      </div>
    </div>
  )
}
