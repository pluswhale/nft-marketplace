import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const hostBackendUrl = 'https://art-fusion-backend-9ace8e5cc199.herokuapp.com/'
const localBackendUrl = 'http://localhost:3001/'

export const LOCAL_MEDIA_URL = 'http://localhost:8000'
export const HOST_MEDIA_URL = 'https://metal.lcs.by'

export const Instance = axios.create({
  baseURL: hostBackendUrl,
  headers: {
    Accept: 'application/json',
    ['Content-Type']: 'application/json',
  },
})
