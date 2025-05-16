import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleNewUserMessage = (newMessage) => {
    // Add user message
    setMessages(prev => [...prev, { text: newMessage, isUser: true }]);
    setMessage('');
    
    // Get and add bot response
    const response = getChatResponse(newMessage);
    setMessages(prev => [...prev, { text: response, isUser: false }]);
  };

  const getChatResponse = (query) => {
    // Simple chatbot responses based on keywords
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('heart rate')) {
      return "Your average heart rate is 130 BPM based on your recent sessions.";
    } else if (queryLower.includes('speed')) {
      return "Your average speed is 22.5 MPH based on your recent sessions.";
    } else if (queryLower.includes('power')) {
      return "Your average power output is 195 watts based on your recent sessions.";
    } else if (queryLower.includes('cadence')) {
      return "Your average cadence is 65 RPM based on your recent sessions.";
    } else if (queryLower.includes('help')) {
      return "I can help you with:\n- Heart rate analysis\n- Speed performance\n- Power output\n- Cadence metrics\n- Training trends";
    } else {
      return "I'm here to help! What would you like to know about your cycling performance?";
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Box
        position="fixed"
        bottom={20}
        right={20}
        zIndex={1000}
      >
        <IconButton
          onClick={toggleChat}
          size="large"
          sx={{
            background: '#2196f3',
            color: 'white',
            '&:hover': {
              background: '#1976d2',
            },
          }}
        >
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Box>

      {isOpen && (
        <Box
          position="fixed"
          bottom={0}
          right={0}
          width="350px"
          height="600px"
          sx={{
            background: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px 8px 0 0',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="h6">Cycling Coach</Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Ask me about your performance
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '80%',
                    alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                    bgcolor: message.isUser ? '#2196f3' : '#f5f5f5',
                    color: message.isUser ? 'white' : 'inherit',
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: 2,
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    handleNewUserMessage(message);
                  }
                }}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={() => {
                  if (message.trim()) {
                    handleNewUserMessage(message);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatWidget;
