import { RootState } from '../store'

export const authUserIdSelector = (state: RootState) => {
  return state.auth?.authData?.id
}

export const isAuthSelector = (state: RootState) => {
  return state.auth.isAuth
}
