import React, { useState } from 'react'
import style from './onboard_window.module.scss'
import { useAppDispatch } from '../../../redux/store'
import SignIn from './steps/SignIn'
import SignUp from './steps/SignUp'
import ConnectWallet from './steps/ConnectWallet'
import { deleteLastModal } from '../../../redux/slices/modal'
import { Steps } from './types'

const OnboardWindow = () => {
  const dispatch = useAppDispatch()

  const [steps, setSteps] = useState<Steps>({
    signIn: true,
    signUp: false,
    cw: false,
  })

  const handleCloseModal = () => {
    dispatch(deleteLastModal())
  }

  const handleSetStep = (selectedStep: string) => {
    const updatedSteps = Object.keys(steps).reduce((acc, key) => {
      //@ts-ignore
      acc[key] = key === selectedStep
      return acc
    }, {} as Steps)

    setSteps(updatedSteps)
  }

  const display = () => {
    if (steps.signIn) {
      return <SignIn onGoConnectWallet={handleSetStep} />
    } else if (steps.signUp) {
      return <SignUp onGoSignIn={handleSetStep} />
    } else {
      return <ConnectWallet />
    }
  }

  return (
    <div
      style={steps.cw ? { height: 'unset', paddingBottom: '20px' } : {}}
      className={style.modal_bg}
    >
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
          <button
            className={style.modal_sign_up}
            onClick={() => handleSetStep('signUp')}
          >
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
