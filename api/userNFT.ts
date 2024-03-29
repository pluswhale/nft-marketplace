import { Instance } from './api'

export const uploadNFT = {
  saveUserUploadedArt: (data: SaveUserArtData) =>
    Instance.post('store/user-art/', data),
  deleteUserUploadedArt: (cid: string) =>
    Instance.delete(`destroy/user-art/${cid}`),
  getAllSavedArts: (userId: number) => Instance.get(`/user/${userId}/items`),
}

export type SaveUserArtData = {
  userId: number
  itemId: string
  name: string
  description: string
  cid: string
  minted: boolean
}
