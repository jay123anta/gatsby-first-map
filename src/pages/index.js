import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import axios from 'axios';
import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';


const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1;

const IndexPage = () => {
  
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement : map } = {}) {
    if ( !map ) return;

    let response ;

    try
    {
      response= await axios.get('https://corona.lmao.ninja/countries');
    }
    catch(e)
    {
      console.log('Failed to fetch Countries: ${e.message}',e);
      return;
    }

    const { data = [] } = response;

    const hasdata = Array.isArray(data) && data.length>0;

    if (!hasdata) return;

    const geoJson = {
      type: 'FeatureCollection',
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { flag, lat, long: lng } = countryInfo;
        return {
          type: 'Feature',
          properties: {
            ...country,
            flag,
          },
          geometry: {
            type: 'Point',
            coordinates: [ lng, lat ]
          }
        }
      })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
    
        const {
          country,
          updated,
          cases,
          deaths,
          recovered
        } = properties
        
        casesString = `${cases}`;
        
    
        if ( cases > 1000 ) {
          casesString = `${casesString.slice(0, -3)}k+`
        }
    
        if ( updated ) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
    
        const html = `
          <span class= "icon-marker">
          <span><img height="20px" src=${properties.flag} /></span>
            <span class="icon-marker-tooltip">
              <h2>${country}</h2><span><img height="20px" src=${properties.flag} /></span>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            <span> ${casesString} </span>
          </span>`;
    
        return L.marker( latlng, {
          icon: L.divIcon({
            className: 'testicon',
            html
          }),
          riseOnHover: true
        });
      }
    });
    
    geoJsonLayers.addTo(map)
    
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start">
        <h2>This is My First Attempt at Gatsby and Leaflet</h2>
        <p>!!!</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
