import { Instance } from './api'

export const uploadNFT = {
  saveUserUploadedArt: (data: SaveUserArtData) =>
    Instance.post('store/user-art/', data),
  deleteUserUploadedArt: (cid: string) =>
    Instance.delete(`destroy/user-art/${cid}`),
  getAllSavedArts: (userId: number, page: number) =>
    Instance.get(`/user/${userId}/items?page=${page}&pageSize=5`),
}

export type SaveUserArtData = {
  userId: number
  itemId: string
  name: string
  description: string
  cid: string
  minted: boolean
  resolution: string
}
