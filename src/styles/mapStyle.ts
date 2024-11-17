export const cyberpunkMapStyle = {
  version: 8,
  name: 'Cyberpunk',
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}",
  sprite: "mapbox://sprites/mapbox/basic-v8",
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0a0a0f'
      }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#001432',
        'fill-opacity': 0.8
      }
    },
    {
      id: 'landuse',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': '#0f0f1a',
        'fill-opacity': 0.7
      }
    },
    {
      id: 'roads',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      paint: {
        'line-color': '#ff00ff',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 1,
          16, 3
        ],
        'line-opacity': 0.5,
        'line-blur': 1
      }
    }
  ]
};