import { shallowEqual, useSelector } from 'react-redux'
import { activeModalSelector } from '../../redux/selectors/modalSelectors'
import { deleteLastModal } from '../../redux/slices/modal'
import { PopupWithOverlay } from '../portals/PopupWithOverlay/PopupWithOverlay'
import SignIn from './SignIn/SignIn'
import { useAppDispatch } from '../../redux/store'

const modalList = [{ id: 1, name: 'sign-in', element: <SignIn /> }]

const ModalContainer = () => {
  const dispatch = useAppDispatch()

  const activeModals = useSelector(activeModalSelector, shallowEqual)

  const handleCloseModal = () => {
    dispatch(deleteLastModal())
  }

  const displayingModals = () => {
    return (
      <PopupWithOverlay
        onClose={handleCloseModal}
        isOpened={Boolean(activeModals[0]?.id)}
      >
        {modalList.find((modal) => modal.id === activeModals?.[0]?.id)
          ?.element || <></>}
      </PopupWithOverlay>
    )
  }

  return <>{displayingModals()}</>
}
export default ModalContainer
