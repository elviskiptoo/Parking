import { CircularProgress, Box, Typography } from '@mui/material';

export default function LoadingSpinner() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Loading Map...
      </Typography>
    </Box>
  );
} 