import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ParkingSpace } from '../types';
import { Waves } from './ui/waves-background';

interface SidebarProps {
  selectedSpace: ParkingSpace | null;
  onCityChange: (city: string | null) => void;
  onStreetChange: (street: string | null) => void;
  onBookingRequest: (space: ParkingSpace) => void;
}

export default function Sidebar({
  selectedSpace,
  onCityChange,
  onStreetChange,
  onBookingRequest,
}: SidebarProps) {
  return (
    <Box
      sx={{
        width: 300,
        height: '100vh',
        position: 'relative',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Waves
        lineColor="rgba(25, 118, 210, 0.08)"
        backgroundColor="rgba(255, 255, 255, 0.95)"
        waveSpeedX={0.3}
        waveSpeedY={0.2}
        waveAmpX={90}
        waveAmpY={40}
        friction={0.99}
        tension={0.02}
        maxCursorMove={150}
        xGap={24}
        yGap={24}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          overflow: 'auto',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Parking Lot Booker
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Select City</InputLabel>
          <Select
            label="Select City"
            onChange={(e) => onCityChange(e.target.value as string)}
            defaultValue=""
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Nairobi">Nairobi</MenuItem>
            <MenuItem value="Mombasa">Mombasa</MenuItem>
            <MenuItem value="Kisumu">Kisumu</MenuItem>
            <MenuItem value="Nakuru">Nakuru</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Select Street</InputLabel>
          <Select
            label="Select Street"
            onChange={(e) => onStreetChange(e.target.value as string)}
            defaultValue=""
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Street 1">Street 1</MenuItem>
            <MenuItem value="Street 2">Street 2</MenuItem>
            <MenuItem value="Street 3">Street 3</MenuItem>
          </Select>
        </FormControl>

        {selectedSpace && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Selected Space Details
            </Typography>
            <Typography>
              Space Number: {selectedSpace.spaceNumber}
            </Typography>
            <Typography>
              Status: {selectedSpace.status}
            </Typography>
            <Typography gutterBottom>
              Price: KES {selectedSpace.pricePerHour}/hour
            </Typography>
            {selectedSpace.status === 'available' && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onBookingRequest(selectedSpace)}
                sx={{ mt: 2 }}
              >
                Book Now
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
} 