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
    cid,
    name,
    description,
    minted,
  } = art
  return (
    <div className={styles.savedArt}>
      <div className={styles.savedArt__content}>
        {imageIpfsUrl ? (
          <img className={styles.savedArt__cover} src={art.imageIpfsUrl} />
        ) : null}
        <p>Name: {name}</p>
        <p>Description: {description}</p>
        <p>Created: {dayjs(createdAt).format('YYYY-MM-DD-HH:MM')}</p>
        {resolution ? <p>Resolution: {resolution} </p> : null}
        {!minted ? <p style={{ color: 'orangered' }}> Not minted yet</p> : null}
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
