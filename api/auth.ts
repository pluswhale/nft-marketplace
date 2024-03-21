import { Instance } from './api'

export const authAPI = {
  signIn: (data: LoginData) => Instance.post('login/', data),
  signUp: (data: LoginData) => Instance.post('register/', data),
}

type LoginData = {
  email: string
  password: string
}
