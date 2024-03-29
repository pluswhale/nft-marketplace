import { useEffect, useState } from 'react'
import { uploadNFT } from '../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../redux/selectors/authSelectors'
import dayjs from 'dayjs'
import { Button } from '../primitives'

type Props = {}

export function SavedArts(props: Props) {
  const [savedArts, setSavedArts] = useState<any[]>([])
  const [page, setPage] = useState(1)

  const userId = useSelector(authUserIdSelector, shallowEqual)

  useEffect(() => {
    uploadNFT.getAllSavedArts(userId, page).then((res) => {
      if (res.data.items) {
        setSavedArts((prev) => [...prev, ...res?.data?.items])
      }
    })
  }, [page])

  const handlePaginate = () => {
    setPage((prev) => prev + 1)
  }

  return (
    <div>
      {savedArts &&
        savedArts.map((art, index) => (
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
              <p>Created: {dayjs(art.createdAt).format('YYYY-MM-DD-HH:MM')}</p>
              {art?.resolution ? <p>Resolution: {art?.resolution} </p> : null}
              <p>CID: {art.cid}</p>
            </div>
          </div>
        ))}
      <Button color={'primary'} onClick={handlePaginate}>
        Load more
      </Button>
    </div>
  )
}
