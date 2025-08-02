/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Paper, IconButton, TextField, Typography } from '@mui/material';
import { Send as SendIcon, Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const API_BASE_URL = 'https://chatbot.faishion.ai';

const WidgetContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const ChatButton = styled(IconButton)`
  background-color: #1976d2;
  color: white;
  &:hover {
    background-color: #1565c0;
  }
`;

const ChatWindow = styled(Paper)`
  position: fixed;
  top: 0px;
  left: 0px;
  width: 350px;
  height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background-color: #1976d2;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: ${(props) => (props.isUser ? '#1976d2' : '#f0f0f0')};
  color: ${(props) => (props.isUser ? 'white' : 'black')};
  align-self: ${(props) => (props.isUser ? 'flex-end' : 'flex-start')};
  word-wrap: break-word;
`;

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
`;

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        setIsServerAvailable(response.data.status === 'healthy');
      } catch (error) {
        console.error('Server health check failed:', error);
        setIsServerAvailable(false);
      }
    };

    checkServerHealth();

    const interval = setInterval(checkServerHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !isServerAvailable) return;

    const userMessage: Message = {
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log(
        `Attempting to connect to backend at ${API_BASE_URL}/faishion-chatbot`
      );
      const requestData = {
        question: userMessage.content,
        chat_history: messages.map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      };
      console.log('Request data:', requestData);

      const response = await axios.post(
        `${API_BASE_URL}/faishion-chatbot`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      const botMessage: Message = {
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsServerAvailable(true);
    } catch (error: any) {
      console.error('Full error object:', error);

      let errorContent = 'Sorry, I encountered an error. Please try again.';

      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        errorContent = `Error: ${error.response.data.error || error.response.statusText
          }`;
        if (error.response.data.traceback) {
          console.error('Error traceback:', error.response.data.traceback);
        }
      } else if (error.request) {
        console.error('No response received. Request details:', error.request);
        errorContent = `Error: Cannot connect to the server. Please make sure the backend is running at ${API_BASE_URL}`;
        setIsServerAvailable(false);
      } else {
        console.error('Error setting up request:', error.message);
        errorContent = `Error: ${error.message}`;
      }

      const errorMessage: Message = {
        type: 'bot',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <WidgetContainer>
      {!isOpen ? (
        <ChatButton
          onClick={() => setIsOpen(true)}
          size='large'
          aria-label='Open chat'
          sx={{
            backgroundColor: isServerAvailable ? '#1976d2' : '#d32f2f',
            '&:hover': {
              backgroundColor: isServerAvailable ? '#1565c0' : '#c62828',
            },
          }}
        >
          <ChatIcon />
        </ChatButton>
      ) : (
        <ChatWindow>
          <ChatHeader>
            <Typography variant='h6'>
              fAIshion Support
              {!isServerAvailable && (
                <Typography
                  component='span'
                  sx={{
                    fontSize: '0.8em',
                    marginLeft: 1,
                    color: '#ffcdd2',
                  }}
                >
                  (Offline)
                </Typography>
              )}
            </Typography>
          </ChatHeader>
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageBubble key={index} isUser={message.type === 'user'}>
                {message.content}
              </MessageBubble>
            ))}
            {isLoading && (
              <MessageBubble isUser={false}>
                <Typography>Typing...</Typography>
              </MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          <InputContainer>
            <TextField
              fullWidth
              variant='outlined'
              placeholder={
                isServerAvailable ? 'Type your message...' : 'Server is offline'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              size='small'
              disabled={isLoading || !isServerAvailable}
            />
            <IconButton
              color='primary'
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim() || !isServerAvailable}
            >
              <SendIcon />
            </IconButton>
          </InputContainer>
        </ChatWindow>
      )}
    </WidgetContainer>
  );
};

export default ChatWidget;
