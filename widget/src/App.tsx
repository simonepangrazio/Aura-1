import { useState } from 'react';

function App() {
  const [connected, setConnected] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 300, height: 400, backgroundColor: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 16, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, paddingBottom: 16, borderBottom: '1px solid #eaeaea' }}>AI Assistant</h3>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {connected ? (
            <p>Avatar Streaming...</p>
        ) : (
            <p>Ready to help!</p>
        )}
      </div>
      <button 
        onClick={() => setConnected(!connected)}
        style={{ padding: '10px 16px', backgroundColor: connected ? '#ef4444' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        {connected ? 'Disconnect' : 'Connect Avatar'}
      </button>
    </div>
  );
}

export default App;
