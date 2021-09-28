class Map {
  constructor() {
    //creates the map and loads it.
    this.chart = am4core.create("chartdiv", am4maps.MapChart);
    this.chart.geodata = am4geodata_worldLow;

    this.chart.projection = new am4maps.projections.Orthographic();
    this.chart.panBehavior = "rotateLongLat";

    this.chart.padding(10, 10, 10, 10); // sets the padding of the map, i.e how close to the end of the screen is the map

    this.chart.seriesContainer.draggable = false; // makes it so the map cannot be dragged
    this.chart.maxZoomLevel = 1.7; // sets how much the user can zoom
    // this.chart.minZoomLevel = 1.1; // sets how much the user can zoom out

    this.polygonSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
    this.polygonSeries.useGeodata = true;

    // Configure series
    this.polygonTemplate = this.polygonSeries.mapPolygons.template;
    this.polygonTemplate.tooltipText = "{name}";
    this.polygonTemplate.fill = am4core.color("#47c78a");
    this.polygonTemplate.stroke = am4core.color("#454a58");
    this.polygonTemplate.strokeWidth = 0.2;

    this.graticuleSeries = this.chart.series.push(
      new am4maps.GraticuleSeries()
    );

    this.graticuleSeries.mapLines.template.line.stroke =
      am4core.color("#FDFEFE"); //sets the ccolor for the map line
    this.graticuleSeries.mapLines.template.line.strokeOpacity = 0.08; // sets the opacity for the lines
    this.graticuleSeries.fitExtent = false;

    this.chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.5; //sets the color for the continent
    this.chart.backgroundSeries.mapPolygons.template.polygon.fill =
      am4core.color("#5DADE2");

    // Create hover state and set alternative fill color
    this.hs = this.polygonTemplate.states.create("hover");
    this.hs.properties.fill = this.chart.colors.getIndex(0).brighten(-0.5);

    //set up native events
    this.respondToPing("down", () => {
      this.active = true;
      if (this.animation) this.animation.stop();
    }); // triggers evertime the map is clicked or pressed

    this.respondToPing("up", () => {
      this.active = false;
    }); //trigger everytime the map is realased

    //working props
    this.animation; //keep track of the animation object
    this.marker; //keep track of the iss icon
    this.imageSeries; //marker helper
    this.imageSeriesTemplate; //maker helper

    this.active = false; //keep track of whether or not the map is being pressed
  }

  rotateTo() {
    if (this.animation) this.animation.stop(); // stops an animation if its in the middle of happening
    this.animation = this.chart.animate(
      [
        {
          property: "deltaLongitude",
          to: -this.imageSeries.data[0].longitude,
        },
        {
          property: "deltaLatitude",
          to: -this.imageSeries.data[0].latitude,
        },
      ],
      2000
    ); //changes the latitude and longitude of the map to where the iss icon is
  }

  createMarker() {
    if (this.marker) return this.marker;
    this.imageSeries = this.chart.series.push(new am4maps.MapImageSeries());

    // Create image
    this.imageSeriesTemplate = this.imageSeries.mapImages.template;
    let marker = this.imageSeriesTemplate.createChild(am4core.Image);
    marker.href = "img/iss_icon.png";
    marker.width = 40;
    marker.height = 40;
    marker.nonScaling = true;
    marker.tooltipText = "{title}";
    marker.horizontalCenter = "middle";
    marker.verticalCenter = "bottom";

    // Set property fields
    this.imageSeriesTemplate.propertyFields.latitude = "latitude";
    this.imageSeriesTemplate.propertyFields.longitude = "longitude";

    return marker; //creates a marker and loads it, noticed that it has no lat lon to place the marker, so it will put it at 0,0 (to left corner)
  }

  async placeMarker(lat, lon) {
    if (!this.marker) this.marker = this.createMarker();
    this.imageSeries.data = [
      {
        latitude: lat,
        longitude: lon,
        title: "International Space Station",
      },
    ];
    //places the marker on the map, if the marker is not created, then it creates one, then places it on the 'right' location on the map. Right location meaing the lat and lon passed in
  }

  pingEvent(event = "", data = "") {
    this.chart.seriesContainer.events.dispatchImmediately(event, data); //creates a event on the map, if there is no listener for even, nothing will happen
  }

  respondToPing(event, callback) {
    this.chart.seriesContainer.events.on(event, callback); //sets a listener for an event to the map and a call back defining what happens when the event is trigger. Nothing will happen if the event is not trigger.
  }

  shouldUpdate(update_cords) {
    const center = this.chart._centerGeoPoint;
    const offset_accpted = 20;
    if (
      Math.abs(
        parseInt(update_cords.latitude, 10) - parseInt(center.latitude, 10)
      ) >= offset_accpted
    )
      return true;
    else if (
      Math.abs(
        parseInt(update_cords.longitude, 10) - parseInt(center.longitude, 10)
      ) >= offset_accpted
    )
      return true;

    return false; //looks at the map center and at the iss and decides whether or not to move the map.
  }
} //class for map, notice that each object is created AND placed into view.

//calls teh ISS api for data, parses the information into json, then returns it
async function retrive_iss_info() {
  return fetch("http://api.open-notify.org/iss-now.json")
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

//runs when the map is ready
am4core.ready(() => {
  //sets the animation, makes sure that we can use it.
  am4core.useTheme(am4themes_animated);
  const map = new Map(); // creates and loads the map

  //sets up event to tell the map when to update
  map.respondToPing("update_cords", async (cords) => {
    if (!cords) return; // returns if there are no cordinates
    //updates the location of the icons representing the international space station
    map.placeMarker(parseFloat(cords.latitude), parseFloat(cords.longitude));

    //if the iss is not in view, rotate the map
    if (!map.active && map.shouldUpdate(cords)) {
      map.rotateTo();
    }
  });

  //calls the iss api every 1.5  second
  setInterval(async function () {
    let info = await retrive_iss_info(); //makes a call to teh api
    map.pingEvent("update_cords", info.iss_position); // calls the map to update itself and passes the information
  }, 1500);
});
