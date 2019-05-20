import React, { Component, setGlobal } from 'reactn';
const openGeocoder = require('node-open-geocoder');

class ContactsMap extends Component {
  async componentDidMount() {
    const { contacts } = this.global;

    let mymap = window.L.map('mapid').setView([35.3424999, -43.3617923], 3);
    window.L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 3,
        maxZoom: 20,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicG9sbHV0ZXJvZm1pbmRzIiwiYSI6ImNqdndmZmpjMTAwMmM0YnJwYWVvNTByNHMifQ.3d_rOj5-STZFkddQRbyvGQ'
    }).addTo(mymap);

    //First we need to filter by any contacts that have a postal code
    const postalCodes = contacts.filter(a => a.postalCode);
    setGlobal({ filteredContacts: postalCodes });
    for (const contact of postalCodes) {
        openGeocoder()
            .geocode(contact.postalCode)
            .end((err, res) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(res);
                    const coords = {
                        lat: res[0].lat,
                        long: res[0].lon
                    }
                    //Now we need to add them as markers on the map
                    window.L.marker([coords.lat, coords.long]).addTo(mymap).bindPopup(`<span>${contact.name}</span><br/><span><a href=${window.location.origin + "/contacts/" + (contact.contact || contact.id)}>${contact.id || contact.contact}</a></span>`);
                }
            });
    }
  }

  render() {
      return (
        <div style={{marginBottom: "65px"}}>
            <div id="mapid"></div>
        </div>
       );
  }
}

export default ContactsMap;
