import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  Fade,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  Lock, 
  Email, 
  Person, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#f8fafc',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 50,
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default function AuthPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password_hash: loginPassword,
          remember_me: rememberMe
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      setSnackbarMessage('Login successful!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerName,
          email: registerEmail,
          password_hash: registerPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      setSnackbarMessage('Registration successful!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setIsLogin(true);
    } catch (error) {
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
        {/* Left side - image */}
        {!isMobile && (
          <Grid 
            item 
            md={6} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: 'white',
              p: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("https://images.unsplash.com/photo-1516546453174-5e1098a4b4af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.2
            }} />
            
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                {isLogin ? 'New Here?' : 'Welcome!'}
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: 400 }}>
                {isLogin ? 'Join us and discover a world of possibilities' : 'We are thrilled to have you on board'}
              </Typography>
              
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Button>
            </div>
            
          </Grid>
        )}

        {/* Right side - Form */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'background.default',
            p: 4
          }}
        >
          <Paper 
            elevation={10} 
            sx={{ 
              p: 4, 
              width: '100%', 
              maxWidth: 450,
              borderRadius: 4,
              background: 'linear-gradient(to bottom, #ffffff, #f8fafc)'
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Typography>
            
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
              {isLogin ? 'Sign in to continue your journey' : 'Join us to get started today'}
            </Typography>
            
            {/* Toggle buttons - Pill style */}
            <Box sx={{ 
              display: 'flex', 
              bgcolor: 'grey.100', 
              borderRadius: 50, 
              p: 1, 
              mb: 4,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Button
                fullWidth
                variant={isLogin ? "contained" : "text"}
                onClick={() => setIsLogin(true)}
                sx={{ 
                  borderRadius: 50,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: isLogin ? 2 : 'none'
                }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant={!isLogin ? "contained" : "text"}
                onClick={() => setIsLogin(false)}
                sx={{ 
                  borderRadius: 50,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: !isLogin ? 2 : 'none'
                }}
              >
                Register
              </Button>
            </Box>
            
            {/* Forms */}
            <Fade in={isLogin} timeout={500}>
              <div>
                {isLogin && (
                  <form onSubmit={handleLoginSubmit}>
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      margin="normal"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Email sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Lock sx={{ color: 'action.active', mr: 1, my: 0.5 }} />,
                        endAdornment: showPassword ? 
                          <VisibilityOff onClick={togglePasswordVisibility} sx={{ color: 'action.active', cursor: 'pointer' }} /> : 
                          <Visibility onClick={togglePasswordVisibility} sx={{ color: 'action.active', cursor: 'pointer' }} />
                      }}
                    />
                    
                    {/* Remember Me checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Remember me"
                      sx={{ mt: 1 }}
                    />
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      sx={{ 
                        mt: 2, 
                        mb: 2,
                        py: 1.5,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(45deg, #6366f1, #818cf8)'
                      }} 
                      type="submit"
                    >
                      Sign In
                    </Button>
                  </form>
                )}
              </div>
            </Fade>
            
            <Fade in={!isLogin} timeout={500}>
              <div>
                {!isLogin && (
                  <form onSubmit={handleRegisterSubmit}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      margin="normal"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Person sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      margin="normal"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Email sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Lock sx={{ color: 'action.active', mr: 1, my: 0.5 }} />,
                        endAdornment: showPassword ? 
                          <VisibilityOff onClick={togglePasswordVisibility} sx={{ color: 'action.active', cursor: 'pointer' }} /> : 
                          <Visibility onClick={togglePasswordVisibility} sx={{ color: 'action.active', cursor: 'pointer' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      variant="outlined"
                      margin="normal"
                      type={showPassword ? 'text' : 'password'}
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <Lock sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      sx={{ 
                        mt: 3, 
                        mb: 2,
                        py: 1.5,
                        fontSize: '1.1rem',
                        background: 'linear-gradient(45deg, #ec4899, #f472b6)'
                      }} 
                      type="submit"
                    >
                      Create Account
                    </Button>
                  </form>
                )}
              </div>
            </Fade>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}