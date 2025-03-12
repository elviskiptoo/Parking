import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { ParkingSpace } from '../types';
import { Typography, Box, Button, IconButton, Fab } from '@mui/material';
import StreetviewIcon from '@mui/icons-material/Streetview';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoadingSpinner from './LoadingSpinner';
import Sidebar from './Sidebar';
import CloseIcon from '@mui/icons-material/Close';
import PaymentDialog from './PaymentDialog';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// City coordinates
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'Nairobi': { lat: -1.2921, lng: 36.8219 },
  'Mombasa': { lat: -4.0435, lng: 39.6682 },
  'Kisumu': { lat: -0.1022, lng: 34.7617 },
  'Nakuru': { lat: -0.3031, lng: 36.0800 },
};

// Mock data for parking spaces in different cities
const MOCK_PARKING_SPACES: { [key: string]: ParkingSpace[] } = {
  'Nairobi': [
    {
      id: '1',
      location: { lat: -1.2921, lng: 36.8219 },
      status: 'available',
      pricePerHour: 100,
      spaceNumber: 'A1',
    },
    {
      id: '2',
      location: { lat: -1.2925, lng: 36.8225 },
      status: 'booked',
      pricePerHour: 100,
      spaceNumber: 'A2',
    },
    {
      id: '3',
      location: { lat: -1.2918, lng: 36.8220 },
      status: 'expiring',
      pricePerHour: 100,
      spaceNumber: 'A3',
    },
  ],
  'Mombasa': [
    {
      id: '4',
      location: { lat: -4.0435, lng: 39.6682 },
      status: 'available',
      pricePerHour: 80,
      spaceNumber: 'M1',
    },
  ],
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeId: 'satellite',
  mapTypeControl: false,
  streetViewControl: true,
  clickableIcons: false,
};

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['geometry'],
  });

  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [center, setCenter] = useState(CITY_COORDINATES['Nairobi']);
  const [zoom, setZoom] = useState(15);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [currentStreet, setCurrentStreet] = useState<string | null>(null);
  const [visibleSpaces, setVisibleSpaces] = useState<ParkingSpace[]>([]);
  const [showStreetView, setShowStreetView] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<google.maps.LatLng | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    // Initialize with Nairobi's spaces when component mounts
    setVisibleSpaces(MOCK_PARKING_SPACES['Nairobi'] || []);
  }, []);

  useEffect(() => {
    if (currentCity) {
      setCenter(CITY_COORDINATES[currentCity]);
      setZoom(15);
      setVisibleSpaces(MOCK_PARKING_SPACES[currentCity] || []);
    }
  }, [currentCity]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const clickedLat = e.latLng.lat();
    const clickedLng = e.latLng.lng();

    // Check if clicked near an existing space
    const nearbySpace = visibleSpaces.find(space => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(space.location.lat, space.location.lng),
        e.latLng!
      );
      return distance < 20; // Within 20 meters
    });

    if (nearbySpace) {
      setSelectedSpace(nearbySpace);
    } else {
      // Create a new potential parking space
      const newSpace: ParkingSpace = {
        id: `new-${Date.now()}`,
        location: { lat: clickedLat, lng: clickedLng },
        status: 'available',
        pricePerHour: 100,
        spaceNumber: 'New',
      };
      setSelectedSpace(newSpace);
    }
    setClickedLocation(e.latLng);
  }, [visibleSpaces]);

  const handleBooking = (space: ParkingSpace) => {
    setSelectedSpace(space);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    // Update the space status or perform any other necessary actions
    console.log('Payment completed successfully');
    setSelectedSpace(null);
  };

  const handleCityChange = (city: string | null) => {
    setCurrentCity(city);
    setCurrentStreet(null);
    setSelectedSpace(null);
  };

  const handleStreetChange = (street: string | null) => {
    setCurrentStreet(street);
    if (currentCity && street) {
      // Filter spaces for the selected street (mock implementation)
      const citySpaces = MOCK_PARKING_SPACES[currentCity] || [];
      // In a real implementation, you would filter based on actual street data
      setVisibleSpaces(citySpaces.slice(0, 1));
    } else if (currentCity) {
      // If no street is selected, show all spaces in the city
      setVisibleSpaces(MOCK_PARKING_SPACES[currentCity] || []);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const handleStreetViewClick = useCallback((event: { latLng?: google.maps.LatLng; preventDefault: () => void }) => {
    // Prevent default right-click menu
    event.preventDefault();
    if (!event.latLng) return;
    
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();

    // Create a new parking space at the clicked location
    const newSpace: ParkingSpace = {
      id: `new-${Date.now()}`,
      location: { lat: clickedLat, lng: clickedLng },
      status: 'available',
      pricePerHour: 100,
      spaceNumber: 'New',
    };
    setSelectedSpace(newSpace);
    setClickedLocation(event.latLng);
  }, []);

  useEffect(() => {
    if (mapRef && showStreetView && clickedLocation) {
      const panorama = new google.maps.StreetViewPanorama(mapRef.getDiv(), {
        position: clickedLocation,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        visible: true,
        addressControl: false,
      });

      // Add both left and right click listeners
      panorama.addListener('click', handleStreetViewClick);
      panorama.addListener('rightclick', handleStreetViewClick);

      // Prevent context menu in street view
      const element = mapRef.getDiv();
      element.addEventListener('contextmenu', (e) => e.preventDefault());

      mapRef.setStreetView(panorama);

      return () => {
        google.maps.event.clearListeners(panorama, 'click');
        google.maps.event.clearListeners(panorama, 'rightclick');
        element.removeEventListener('contextmenu', (e) => e.preventDefault());
        if (mapRef) {
          mapRef.setStreetView(null);
        }
      };
    }
  }, [mapRef, showStreetView, clickedLocation, handleStreetViewClick]);

  if (loadError) return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
    >
      <Typography color="error" variant="h5">
        Error loading maps. Please try again later.
      </Typography>
    </Box>
  );
  
  if (!isLoaded) return <LoadingSpinner />;

  return (
    <Box display="flex" height="100vh" width="100vw">
      <Sidebar
        selectedSpace={selectedSpace}
        onCityChange={handleCityChange}
        onStreetChange={handleStreetChange}
        onBookingRequest={handleBooking}
      />
      <Box flexGrow={1} position="relative" height="100%" width="100%">
        {showStreetView && (
          <>
            <Fab
              color="primary"
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
              onClick={() => {
                if (mapRef) {
                  mapRef.setStreetView(null);
                  setShowStreetView(false);
                }
              }}
            >
              <ExitToAppIcon />
            </Fab>
            <Typography
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              Right click anywhere on the street to mark a parking spot
            </Typography>
            {selectedSpace && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 80,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  boxShadow: 3,
                  width: 280,
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">
                    {selectedSpace.id.startsWith('new-') ? 'New Parking Space' : `Space ${selectedSpace.spaceNumber}`}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedSpace(null)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" gutterBottom>
                  Location: {currentStreet || 'Street not selected'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Status: {selectedSpace.status}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Price: KES {selectedSpace.pricePerHour}/hour
                </Typography>
                {selectedSpace.status === 'available' && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleBooking(selectedSpace)}
                  >
                    Book This Spot
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
        <GoogleMap
          id="map"
          mapContainerStyle={mapContainerStyle}
          zoom={zoom}
          center={center}
          options={{
            ...mapOptions,
            streetViewControl: !showStreetView,
          }}
          onClick={handleMapClick}
          onLoad={onMapLoad}
        >
          {visibleSpaces.map((space) => (
            <Marker
              key={space.id}
              position={space.location}
              icon={{
                url: space.status === 'available'
                  ? '//maps.google.com/mapfiles/ms/icons/green-dot.png'
                  : space.status === 'expiring'
                    ? '//maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                    : '//maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
              onClick={() => setSelectedSpace(space)}
            />
          ))}

          {selectedSpace && !showStreetView && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                boxShadow: 3,
                minWidth: 250,
              }}
            >
              <Typography variant="h6">
                {selectedSpace.id.startsWith('new-') ? 'New Parking Space' : `Parking Space ${selectedSpace.spaceNumber}`}
              </Typography>
              <Typography>Location: {currentStreet || 'Street not selected'}</Typography>
              <Typography>Status: {selectedSpace.status}</Typography>
              <Typography>Price: KES {selectedSpace.pricePerHour}/hour</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                {selectedSpace.status === 'available' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleBooking(selectedSpace)}
                  >
                    Book Now
                  </Button>
                )}
                <IconButton
                  color="primary"
                  onClick={() => {
                    if (clickedLocation && mapRef) {
                      mapRef.setStreetView(
                        new google.maps.StreetViewPanorama(mapRef.getDiv(), {
                          position: clickedLocation,
                          pov: { heading: 0, pitch: 0 },
                          zoom: 1,
                          visible: true
                        })
                      );
                      setShowStreetView(true);
                    }
                  }}
                  size="small"
                >
                  <StreetviewIcon />
                </IconButton>
              </Box>
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => setSelectedSpace(null)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
        </GoogleMap>
      </Box>
      {selectedSpace && showPaymentDialog && (
        <PaymentDialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          parkingSpace={selectedSpace}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </Box>
  );
} 