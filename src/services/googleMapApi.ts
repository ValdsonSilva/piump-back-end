import axios from 'axios';

export const getGeolocation = async (zipcode: string) => {
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipcode}&key=${apiKey}`;
  
  const response = await axios.get(url);
  const location = response.data.results[0]?.geometry.location;
  
  if (location) {
    return {
      latitude: location.lat,
      longitude: location.lng
    };
  } else {
    throw new Error('Endereço não encontrado.');
  }
};
