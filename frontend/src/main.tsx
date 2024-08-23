import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c7a7b',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#f9fafb',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
