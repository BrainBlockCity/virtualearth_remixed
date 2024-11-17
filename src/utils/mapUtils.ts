export const validateMapboxToken = (token: string | undefined): string => {
  if (!token) {
    throw new Error('Mapbox token is required. Please add VITE_MAPBOX_TOKEN to your .env.local file');
  }
  
  if (!token.startsWith('pk.')) {
    throw new Error('Invalid Mapbox token. Please use a public token that starts with "pk."');
  }

  return token;
};

export const flyToLocation = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  options: {
    zoom?: number;
    pitch?: number;
    bearing?: number;
    duration?: number;
  } = {}
) => {
  const {
    zoom = map.getZoom() + 2,
    pitch = 60,
    bearing = Math.random() * 360,
    duration = 2000
  } = options;

  map.flyTo({
    center: coordinates,
    zoom,
    pitch,
    bearing,
    duration,
    essential: true
  });
};

export const waitForMapStyle = (map: mapboxgl.Map): Promise<void> => {
  return new Promise((resolve) => {
    if (map.isStyleLoaded()) {
      resolve();
    } else {
      map.once('style.load', () => {
        resolve();
      });
    }
  });
};