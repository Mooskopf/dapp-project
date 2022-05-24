import { useEffect, useState } from 'react'
import { useEthers, useTokenBalance, useContractFunction, useCall } from '@usedapp/core'
import { constants, utils } from "ethers"
import { formatUnits } from "@ethersproject/units"
import { Contract } from "@ethersproject/contracts"

import FloToken from "./chain-info/contracts/FloToken.json"
import TokenSaver from "./chain-info/contracts/TokenSaver.json"
import networkMapping from "./chain-info/deployments/map.json"

import Header from "./components/Header"

function App() {

  const { account, chainId } = useEthers()

  const { abi } = TokenSaver
  const tokenSaverInterface = new utils.Interface(abi)
  const tokenSaverAddress = chainId ? networkMapping[chainId]["TokenSaver"][0] : constants.AddressZero
  const tokenSaverContract = new Contract(tokenSaverAddress, tokenSaverInterface)

  const abiFlo = FloToken["abi"]
  const floTokenInterface = new utils.Interface(abiFlo)
  const floTokenAddress = chainId ? networkMapping[chainId]["FloToken"][0] : constants.AddressZero
  const floTokenContract = new Contract(floTokenAddress, floTokenInterface)

  const tokenBalance = useTokenBalance(floTokenAddress, account)
  const formattedTokenBalance = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
  const amount = GetBalance()

  const { state: stateFloTokenMint, send: sendFloTokenMint } = useContractFunction(floTokenContract, 'mintClickReward', { transactionName: 'Minting FloToken' })
  const { state: stateApprove, send: sendApprove } = useContractFunction(floTokenContract, 'approve', { transactionName: 'Approve FloToken Transfer' })
  const { state: stateStakeTokens, send: sendStakeTokens } = useContractFunction(tokenSaverContract, 'saveToken', { transactionName: 'Staking FloToken' })
  const { state: stateGetTokens, send: sendGetTokens } = useContractFunction(tokenSaverContract, 'getAllTokens', { transactionName: 'Getting FloToken' })

  const [stakeAmount, setStakeAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  function mineTokens() {
    sendFloTokenMint()
  }

  function stakeTokens(e) {
    e.preventDefault()
    const inputData = e.target.stakeAmount.value
    if (inputData <= 0) {
      alert("Amount must be positive!")
    } else if (inputData >= formattedTokenBalance) {
      alert("Amount is bigger then balance. Please check!")
    } else {
      setStakeAmount(inputData)
      sendApprove(tokenSaverAddress, utils.parseEther(inputData.toString()).toString())
      document.getElementById("form").reset();
    }
  }

  function GetBalance() {
    const { value, error } =
      useCall({
        contract: tokenSaverContract,
        method: "savingBalance",
        args: [account],
      }
      ) ?? {};
    if (error) {
      console.error(error.message)
      return undefined
    }
    return value?.[0] ? parseFloat(formatUnits(value?.[0])) : 0
  }

  function getTokens() {
    sendGetTokens()
  }

  useEffect(() => {
    if (stateApprove.status === "Mining") {
      setIsLoading(true)
    } else if (stateApprove.status === "Success") {
      setIsLoading(false)
      sendStakeTokens(utils.parseEther(stakeAmount.toString()).toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateApprove])

  useEffect(() => {
    if (stateFloTokenMint.status === "Mining") {
      setIsLoading(true)
    } else if (stateFloTokenMint.status === "Success") {
      alert("Succesfully mined 1 FlorinCoin")
      setIsLoading(false)
    }
  }, [stateFloTokenMint])

  useEffect(() => {
    if (stateStakeTokens.status === "Mining") {
      setIsLoading(true)
    } else if (stateStakeTokens.status === "Success") {
      alert("Succesfully staked!")
      setIsLoading(false)
    }
  }, [stateStakeTokens])

  useEffect(() => {
    if (stateGetTokens.status === "Mining") {
      setIsLoading(true)
    } else if (stateGetTokens.status === "Success") {
      alert("Succesfully got back the staked amount")
      setIsLoading(false)
    }
  }, [stateGetTokens])


  return (
    <div className="App">
      <Header />
      <div className="section">
        {isLoading &&
          <div className="lds-roller">
            <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
          </div>
        }
        {!isLoading &&
          <div className="section2">
            <div className="wallet">
              <div className="wallet-top">
                {formattedTokenBalance} FlorinCoins owned
              </div>
              <div>
                {amount} FlorinCoins staked
              </div>
            </div>
            <div className="mine"><button onClick={mineTokens}>Mine 1 Flo Token</button></div>
            <div className="inner-section">
              <div>
                <form onSubmit={stakeTokens.bind(this)} id="form">
                  <input type="number" name="stakeAmount"></input>
                  <button type="submit">Stake Tokens</button>
                </form>
              </div>
              <div><button onClick={getTokens}>Get Tokens</button></div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default App;
