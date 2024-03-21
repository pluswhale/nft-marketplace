import { RootState } from '../store'

export const accountsSelector = (state: RootState) => {
  return state.auth.accounts
}

export const isAuthSelector = (state: RootState) => {
  return state.auth.isAuth
}
