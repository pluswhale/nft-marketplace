import { useEffect, useState } from 'react'
import { uploadNFT } from '../../api/userNFT'
import { shallowEqual, useSelector } from 'react-redux'
import { authUserIdSelector } from '../../redux/selectors/authSelectors'
import dayjs from 'dayjs'
import axios from 'axios'

type Props = {}

export function SavedArts(props: Props) {
  const [savedArts, setSavedArts] = useState<any[]>([])

  const userId = useSelector(authUserIdSelector, shallowEqual)

  useEffect(() => {
    uploadNFT.getAllSavedArts(userId).then((res) => {
      if (res.data.userItems) {
        setSavedArts(res.data.userItems?.reverse() || [])
      }
    })
  }, [])

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
              <p>Created: {dayjs(art.createdAt).format('YYYY-MM-DD-HH:MM')}</p>
              <p>Resolution: {art?.resolution && art?.resolution} </p>
              <p>CID: {art.cid}</p>
            </div>
          </div>
        ))}
    </div>
  )
}
