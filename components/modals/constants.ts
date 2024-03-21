import { Modal } from '../../redux/slices/types'

export const modals = {
  signIn: {
    id: 1,
    name: 'sign-in',
    isCloseByClickOutside: true,
    isOverlay: true,
  },
} as { [key: string]: Modal }
