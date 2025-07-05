import { useState } from 'react'
import { connectHashPack } from './wallet'
import { mintFighter, getUserFighters, type FighterStats } from './contracts'
import './App.css'

function App() {
  const [account, setAccount] = useState<string>()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [fighters, setFighters] = useState<FighterStats[]>([])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const signer = await connectHashPack()
      const address = await signer.getAccountId()
      setAccount(address.toString())
      
      // Load existing fighters
      const userFighters = await getUserFighters()
      setFighters(userFighters)
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Connection failed: ' + (error as Error).message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleMint = async () => {
    if (!account) return
    
    try {
      setIsMinting(true)
      console.log('Starting mint process...')
      
      const result = await mintFighter()
      console.log('Mint result:', result)
      
      // Refresh fighters list
      const userFighters = await getUserFighters()
      setFighters(userFighters)
      
      alert('Fighter minted successfully!')
    } catch (error) {
      console.error('Minting failed:', error)
      alert('Minting failed: ' + (error as Error).message)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <div>
        <h1>CryptoFight Club</h1>
        <h2>Web3 Dueling Game on Hedera</h2>
      </div>
      
      <div className="card">
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {account 
            ? `✅ Connected: ${account.slice(0, 15)}...` 
            : isConnecting 
              ? 'Connecting...' 
              : 'Connect HashPack'
          }
        </button>
        
        {account && (
          <>
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={handleMint}
                disabled={isMinting}
                style={{ 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isMinting ? 'not-allowed' : 'pointer'
                }}
              >
                {isMinting ? 'Minting...' : '⚔️ Mint Fighter NFT'}
              </button>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3>Your Fighters ({fighters.length})</h3>
              {fighters.length === 0 ? (
                <p>No fighters yet. Mint your first fighter!</p>
              ) : (
                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                  {fighters.map((fighter, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        border: '1px solid #ccc', 
                        padding: '10px', 
                        borderRadius: '5px',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <strong>Fighter #{fighter.tokenId}</strong>
                      <div>💪 STR: {fighter.str}</div>
                      <div>🏃 DEX: {fighter.dex}</div>
                      <div>❤️ HP: {fighter.hp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default App
