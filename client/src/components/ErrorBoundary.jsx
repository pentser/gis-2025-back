import React from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('שגיאה בקומפוננטה:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              אופס! משהו השתבש
            </Typography>
            <Typography variant="body1" paragraph>
              אנא נסה לרענן את הדף או לחזור לדף הבית
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.href = '/'}
            >
              חזרה לדף הבית
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 