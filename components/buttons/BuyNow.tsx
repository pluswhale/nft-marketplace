import React, {
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  useContext,
} from 'react'
import { SWRResponse } from 'swr'
import {BuyModal, BuyStep, SweepModal} from '@reservoir0x/reservoir-kit-ui'
import { Button } from 'components/primitives'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CSS } from '@stitches/react'
import { useMarketplaceChain } from 'hooks'
import { ReferralContext } from '../../context/ReferralContextProvider'
import { BuyTokenBodyParameters } from '@reservoir0x/reservoir-sdk'
import {useAccount, useConnect} from "wagmi";

type Props = {
  tokenId?: string
  contract?: string
  orderId?: string
  executionMethod?: BuyTokenBodyParameters['executionMethod']
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  buttonChildren?: ReactNode
  mutate?: SWRResponse['mutate']
  openState?: ComponentPropsWithoutRef<typeof BuyModal>['openState']
}

const BuyNow: FC<Props> = ({
  tokenId,
  contract,
  orderId = undefined,
  executionMethod,
  mutate,
  buttonCss,
  buttonProps = {},
  buttonChildren,
  openState,
}) => {
  const { openConnectModal } = useConnectModal()
  const marketplaceChain = useMarketplaceChain()
  const { feesOnTop } = useContext(ReferralContext)

  const { connect, connectors } = useConnect();

  const { isConnected } = useAccount();

  const handleConnectWallet = () => {
    if (!isConnected) {
      // This logic assumes you want to auto-trigger a connection to the first available connector
      const connector = connectors[0];
      if (connector) {
        connect({chainId: 1, connector});
      }
    }
  }




  return (

      // <SweepModal
      //     trigger={
      //       <button>
      //         Sweep
      //       </button>
      //     }
      //     onConnectWallet={handleConnectWallet}
      //     contract={contract}
      //     onSweepComplete={(data) => {
      //       console.log('Sweep Complete', data)
      //     }}
      //     onSweepError={(error, data) => {
      //       console.log('Sweep Error', error, data)
      //     }}
      //     onClose={() => {
      //       console.log('SweepModal Closed')
      //     }}
      // />
    <BuyModal
      trigger={
        <Button css={buttonCss} color="primary" {...buttonProps}>
          {buttonChildren}
        </Button>
      }
      token={`${contract}:${tokenId}`}
      orderId={orderId}
      openState={openState}
      executeBuyOptions={executionMethod ? { executionMethod } : undefined}
      onConnectWallet={handleConnectWallet}
      //CONFIGURABLE: set any fees on top of orders, note that these will only
      // apply to native orders (using the reservoir order book) and not to external orders (opensea, blur etc)
      // Refer to our docs for more info: https://docs.reservoir.tools/reference/sweepmodal-1
      // feesOnTopBps={["0xabc:50"]}
      feesOnTopUsd={feesOnTop}
      chainId={marketplaceChain.id}
      onClose={(data, stepData, currentStep) => {
        if (mutate && currentStep == BuyStep.Complete) mutate()
      }}
      onPointerDownOutside={(e) => {
        const privyLayer = document.getElementById('privy-dialog')

        const clickedInsidePrivyLayer =
          privyLayer && e.target ? privyLayer.contains(e.target as Node) : false

        if (clickedInsidePrivyLayer) {
          e.preventDefault()
        }
      }}
    />


  )
}

export default BuyNow
