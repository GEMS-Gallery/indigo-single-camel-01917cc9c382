import React, { useState, useEffect } from 'react';
import { backend } from 'declarations/backend';
import { Container, Typography, Button, TextField, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

const PokerTable = styled('div')(({ theme }) => ({
  width: '80%',
  height: '400px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '200px',
  margin: '2rem auto',
  position: 'relative',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
}));

const PlayerPosition = styled('div')(({ theme }) => ({
  width: '80px',
  height: '80px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 600,
  position: 'absolute',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const CommunityCards = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  gap: '10px',
});

const Card = styled('div')(({ theme }) => ({
  width: '60px',
  height: '90px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '5px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1.5rem',
  fontWeight: 600,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const App: React.FC = () => {
  const [gameState, setGameState] = useState<any>(null);
  const [playerState, setPlayerState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchGameState();
    fetchPlayerState();
    fetchChatMessages();
  }, []);

  const fetchGameState = async () => {
    const state = await backend.getGameState();
    setGameState(state);
  };

  const fetchPlayerState = async () => {
    // Note: In a real application, you would get the player's principal ID here
    const state = await backend.getPlayerState('EXAMPLE_PLAYER_ID');
    setPlayerState(state);
  };

  const fetchChatMessages = async () => {
    const messages = await backend.getChatMessages();
    setChatMessages(messages);
  };

  const handleJoinGame = async () => {
    setLoading(true);
    try {
      await backend.joinGame();
      await fetchPlayerState();
    } catch (error) {
      console.error('Error joining game:', error);
    }
    setLoading(false);
  };

  const handlePlaceBet = async () => {
    setLoading(true);
    try {
      await backend.placeBet(BigInt(betAmount));
      await fetchPlayerState();
      await fetchGameState();
      setBetAmount('');
    } catch (error) {
      console.error('Error placing bet:', error);
    }
    setLoading(false);
  };

  const handleFold = async () => {
    setLoading(true);
    try {
      await backend.fold();
      await fetchPlayerState();
      await fetchGameState();
    } catch (error) {
      console.error('Error folding:', error);
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      try {
        await backend.sendChatMessage(chatMessage);
        setChatMessage('');
        await fetchChatMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Texas Hold'em Poker
      </Typography>
      
      <PokerTable>
        {/* Add player positions and community cards here */}
        <PlayerPosition style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>You</PlayerPosition>
        <PlayerPosition style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }}>Player 2</PlayerPosition>
        <PlayerPosition style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>Player 3</PlayerPosition>
        <PlayerPosition style={{ top: '50%', left: '10px', transform: 'translateY(-50%)' }}>Player 4</PlayerPosition>
        
        <CommunityCards>
          {/* Add community cards here when available in gameState */}
          <Card>?</Card>
          <Card>?</Card>
          <Card>?</Card>
          <Card>?</Card>
          <Card>?</Card>
        </CommunityCards>
      </PokerTable>

      {playerState ? (
        <div>
          <Typography variant="h6">Your Chips: {playerState.chips}</Typography>
          <Typography variant="h6">Current Bet: {playerState.bet}</Typography>
        </div>
      ) : (
        <Button variant="contained" onClick={handleJoinGame} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Join Game'}
        </Button>
      )}

      {playerState && (
        <div>
          <TextField
            label="Bet Amount"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
          <Button variant="contained" onClick={handlePlaceBet} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Place Bet'}
          </Button>
          <Button variant="contained" onClick={handleFold} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Fold'}
          </Button>
        </div>
      )}

      <div>
        <Typography variant="h6">Chat</Typography>
        <div style={{ height: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          {chatMessages.map((msg, index) => (
            <div key={index}>
              <strong>{msg[0]}: </strong>{msg[1]}
            </div>
          ))}
        </div>
        <TextField
          label="Message"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </Container>
  );
};

export default App;
