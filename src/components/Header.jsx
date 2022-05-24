import { useEthers } from '@usedapp/core'

function Header() {
    const { account, activateBrowserWallet, deactivate } = useEthers()

    return (
        <div className="header">
            {!account && <button onClick={() => activateBrowserWallet()}>Connect</button>}
            {account && <button onClick={() => deactivate()}>Disconnect</button>}
        </div>
    )
}

export default Header