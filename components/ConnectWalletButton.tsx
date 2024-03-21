import { ConnectButton } from '@rainbow-me/rainbowkit'
import Box from 'components/primitives/Box'
import Button from 'components/primitives/Button'
import { FC } from 'react'
import { useAppDispatch } from '../redux/store'
import { deleteLastModal } from '../redux/slices/modal'

type Props = {}

export const ConnectWalletButton: FC<Props> = () => {
  const dispatch = useAppDispatch()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        return (
          <Box
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'flex',
            }}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button
                    css={{ flex: 1, justifyContent: 'center' }}
                    corners="rounded"
                    onClick={() => {
                      dispatch(deleteLastModal())
                      openConnectModal()
                    }}
                    type="button"
                  >
                    Connect Wallet
                  </Button>
                )
              }
            })()}
          </Box>
        )
      }}
    </ConnectButton.Custom>
  )
}
