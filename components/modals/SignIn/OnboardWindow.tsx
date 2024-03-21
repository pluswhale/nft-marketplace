import React, { useState } from 'react'
import style from './onboard_window.module.scss'
import { useAppDispatch } from '../../../redux/store'
import SignIn from './steps/SignIn'
import Registration from './steps/Registration'
import ConnectWallet from './steps/ConnectWallet'
import { deleteLastModal } from '../../../redux/slices/modal'
import { Steps } from './types'

const OnboardWindow = () => {
  const dispatch = useAppDispatch()

  const [steps, setSteps] = useState<Steps>({
    signIn: true,
    reg: false,
    cw: false,
  })

  const handleCloseModal = () => {
    dispatch(deleteLastModal())
  }

  const onGoSignUp = () => {
    setSteps({ ...steps, reg: true, signIn: false })
  }

  const onGoSignIn = () => {
    setSteps({ ...steps, reg: false, signIn: true })
  }

  const onGoConnectWallet = () => {
    setSteps({ ...steps, reg: false, signIn: false, cw: true })
  }

  const display = () => {
    if (steps.signIn) {
      return <SignIn onGoConnectWallet={onGoConnectWallet} />
    } else if (steps.reg) {
      return <Registration onGoSignIn={onGoSignIn} />
    } else {
      return <ConnectWallet />
    }
  }

  return (
    <div className={style.modal_bg}>
      <div className={style.modal_block}>
        <div className={style.close_ico} onClick={handleCloseModal}>
          <img
            id={style.modal_close_icon}
            className={style.close_modal}
            src={`${process.env.NEXT_PUBLIC_HOST_URL}/icons/close-icon.png`}
            alt="Close icon"
          />
        </div>
        {display()}
        {steps.signIn && (
          <button className={style.modal_sign_up} onClick={onGoSignUp}>
            <span className={style.modal_sign_up_placeholder}>
              If you have not an account please
            </span>{' '}
            Sign Up
          </button>
        )}
      </div>
    </div>
  )
}

export default OnboardWindow
