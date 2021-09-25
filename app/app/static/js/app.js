class Map {
  constructor() {
    this.chart = am4core.create("chartdiv", am4maps.MapChart);
    this.chart.geodata = am4geodata_worldLow;

    this.chart.projection = new am4maps.projections.Orthographic();
    this.chart.panBehavior = "rotateLongLat";

    this.chart.padding(20, 20, 20, 20);

    this.chart.seriesContainer.draggable = false;
    this.chart.maxZoomLevel = 1.5;

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
      am4core.color("#FDFEFE");
    this.graticuleSeries.mapLines.template.line.strokeOpacity = 0.08;
    this.graticuleSeries.fitExtent = false;

    this.chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.5;
    this.chart.backgroundSeries.mapPolygons.template.polygon.fill =
      am4core.color("#5DADE2");

    // Create hover state and set alternative fill color
    this.hs = this.polygonTemplate.states.create("hover");
    this.hs.properties.fill = this.chart.colors.getIndex(0).brighten(-0.5);

    //working props
    this.animation;
    this.marker;
    this.imageSeries;
    this.imageSeriesTemplate;
  }

  rotateTo(lon, lat) {
    if (this.animation) this.animation.stop();

    let x_y = this.chart.projection.convert(lat, lon);
    console.log(x_y);

    // this.animation = this.chart.animate(
    //   [
    //     {
    //       property: "deltaLongitude",
    //       to: lon,
    //     },
    //     {
    //       property: "deltaLatitude",
    //       to: lat,
    //     },
    //   ],
    //   2000
    // );
  }

  createMarker() {
    if (this.marker) return this.marker;
    this.imageSeries = this.chart.series.push(new am4maps.MapImageSeries());

    // Create image
    this.imageSeriesTemplate = this.imageSeries.mapImages.template;
    let marker = this.imageSeriesTemplate.createChild(am4core.Image);
    marker.href =
      "https://img.icons8.com/external-vitaliy-gorbachev-lineal-color-vitaly-gorbachev/60/000000/external-space-station-space-vitaliy-gorbachev-lineal-color-vitaly-gorbachev-1.png";
    marker.width = 40;
    marker.height = 40;
    marker.nonScaling = true;
    marker.tooltipText = "{title}";
    marker.horizontalCenter = "middle";
    marker.verticalCenter = "bottom";

    // Set property fields
    this.imageSeriesTemplate.propertyFields.latitude = "latitude";
    this.imageSeriesTemplate.propertyFields.longitude = "longitude";

    return marker;
  }

  placeMarker(lat, lon) {
    if (!this.marker) this.marker = this.createMarker();
    this.imageSeries.data = [
      {
        latitude: lat,
        longitude: lon,
        title: "International Space Station",
      },
    ];
  }
  pingEvent(event = "", data = "") {
    this.chart.seriesContainer.events.dispatchImmediately(event, data);
  }

  respondToPing(event, callback) {
    this.chart.seriesContainer.events.on(event, callback);
  }
}

//calls teh ISS api for data
async function retrive_iss_info() {
  return fetch("http://api.open-notify.org/iss-now.json")
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

am4core.ready(() => {
  am4core.useTheme(am4themes_animated);
  const map = new Map();

  //sets up event to tell the map when to update
  map.respondToPing("update_cords", (cords) => {
    if (!cords) return;
    map.placeMarker(parseFloat(cords.latitude), parseFloat(cords.longitude));
    map.rotateTo(parseFloat(cords.longitude), parseFloat(cords.latitude));
  });

  //calls the iss api every second
  setInterval(async function () {
    let info = await retrive_iss_info();
    map.pingEvent("update_cords", info.iss_position);
  }, 1000);

  // map.rotateTo(100, 0);
  // map.placeMarker(40.73061, -73.935242);
  // map.placeMarker(40.73061, -40.935242);
  // Set projection
  // chart.projection = new am4maps.projections.Orthographic();
  // chart.panBehavior = "rotateLongLat";
  // chart.deltaLatitude = -10;
  // chart.deltaLongitude = 70;
  // chart.padding(20, 20, 20, 20);

  //disable zooms
  // chart.seriesContainer.draggable = false;
  // chart.maxZoomLevel = 1.5;

  // limits vertical rotation
  // chart.adapter.add("deltaLatitude", function (delatLatitude) {
  //   return am4core.math.fitToRange(delatLatitude, -90, 90);
  // });

  // Create map polygon series
  // var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

  // Make map load polygon (like country names) data from GeoJSON
  // polygonSeries.useGeodata = true;

  // plotting places
  // var imageSeries = chart.series.push(new am4maps.MapImageSeries());
  // var mapImage = imageSeries.mapImages.template;
  // var mapMarker = mapImage.createChild(am4core.Sprite);
  // mapMarker.path =
  //   "M4 12 A12 12 0 0 1 28 12 C28 20, 16 32, 16 32 C16 32, 4 20 4 12 M11 12 A5 5 0 0 0 21 12 A5 5 0 0 0 11 12 Z";

  // mapMarker.width = 32;
  // mapMarker.height = 32;
  // mapMarker.scale = 0.7;
  // mapMarker.fill = am4core.color("#F4D03F");
  // mapMarker.fillOpacity = 0.8;
  // mapMarker.horizontalCenter = "middle";
  // mapMarker.verticalCenter = "bottom";

  // var marker = imageSeries.mapImages.create();
  // marker.tooltipText = "ISS";

  // chart.seriesContainer.events.on(
  //   "update_iss_position",
  //   function (iss_postion) {
  //     // if (update_count == 100) {
  //     rotateTo(chart, iss_postion, animation, 2000, can_draw);
  //     // update_count = 0;
  //     // }
  //     // update_count++;

  //     let pos = {
  //       latitude: parseFloat(iss_postion.latitude),
  //       longitude: parseFloat(iss_postion.longitude),
  //     };
  //     marker.latitude = pos.latitude;
  //     marker.longitude = pos.longitude;
  //   }
  // );

  // //calls teh ISS api for data
  // async function retrive_iss_info() {
  //   return fetch("http://api.open-notify.org/iss-now.json")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       return data;
  //     });
  // }

  //calls events to update the map
  // setInterval(async function () {
  //   info = await retrive_iss_info();
  //   chart.seriesContainer.events.dispatchImmediately(
  //     "update_iss_position",
  //     info.iss_position
  //   );
  // }, 500);

  // // Configure series
  // var polygonTemplate = polygonSeries.mapPolygons.template;
  // polygonTemplate.tooltipText = "{name}";
  // polygonTemplate.fill = am4core.color("#47c78a");
  // polygonTemplate.stroke = am4core.color("#454a58");
  // polygonTemplate.strokeWidth = 0.2;

  // var graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
  // graticuleSeries.mapLines.template.line.stroke = am4core.color("#FDFEFE");
  // graticuleSeries.mapLines.template.line.strokeOpacity = 0.08;
  // graticuleSeries.fitExtent = false;

  // chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.5;
  // chart.backgroundSeries.mapPolygons.template.polygon.fill =
  //   am4core.color("#5DADE2");

  // // Create hover state and set alternative fill color
  // var hs = polygonTemplate.states.create("hover");
  // hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);

  //animaltion
  // let animation;
  // setTimeout(function () {
  //   animation = chart.animate(
  //     { property: "deltaLongitude", to: 100000 },
  //     20000000
  //   );
  // }, 500);

  // chart.seriesContainer.events.on("down", function () {
  //   console.log("NOT DRAWABLE");
  //   can_draw = false;
  //   if (animation) {
  //     animation.stop();
  //     // animation.pause();
  //   }
  // });

  // chart.seriesContainer.events.on("up", function () {
  //   console.log("DRAWABLE");
  //   can_draw = true;

  //   if (animation) animation.stop();
  // });

  // chart.seriesContainer.events.on("up", function () {
  //   // animation.resume();
  //   if (animation) {
  //     setTimeout(function () {
  //       animation = chart.animate(
  //         { property: "deltaLongitude", to: 100000 },
  //         20000000
  //       );
  //     }, 500);
  //   }
  // });
});
///###########################################################################################
// alert("HERE");
// am4core.ready(function () {
//   var animation;
//   function rotateTo(delta) {
//     if (animation) {
//       animation.stop();
//     }
//     animation = chart.animate(
//       {
//         property: "deltaLongitude",
//         to: delta,
//       },
//       1000
//     );
//   }
//   // Themes begin
//   // am4core.useTheme(am4themes_dataviz);
//   // am4core.useTheme(am4themes_animated);
//   // Themes end

//   var chart = am4core.create("chartdiv", am4maps.MapChart);

//   // Set map definition
//   chart.geodata = am4geodata_worldLow;

//   // Set projection
//   chart.projection = new am4maps.projections.Orthographic();
//   chart.panBehavior = "rotateLongLat";
//   chart.deltaLatitude = -10;
//   chart.deltaLongitude = 70;
//   chart.padding(20, 20, 20, 20);

//   //disable zooms
//   chart.seriesContainer.draggable = false;
//   chart.maxZoomLevel = 1.5;

//   // chart.minZoomLevel = 4;

//   // chart.homeZoomLevel = 1;
//   // chart.homeGeoPoint = {
//   //   latitude: 40.73061,
//   //   longitude: -73.935242,
//   // };
//   // chart.events.on("ready", function (ev) {
//   //   chart.zoomToMapObject(polygonSeries.getPolygonById("US"));
//   // });

//   // limits vertical rotation
//   chart.adapter.add("deltaLatitude", function (delatLatitude) {
//     return am4core.math.fitToRange(delatLatitude, -90, 90);
//   });

//   // Create map polygon series
//   var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());

//   // Make map load polygon (like country names) data from GeoJSON
//   polygonSeries.useGeodata = true;

//   //plotting places
//   var imageSeries = chart.series.push(new am4maps.MapImageSeries());
//   var mapImage = imageSeries.mapImages.template;
//   var mapMarker = mapImage.createChild(am4core.Sprite);
//   mapMarker.path =
//     "M4 12 A12 12 0 0 1 28 12 C28 20, 16 32, 16 32 C16 32, 4 20 4 12 M11 12 A5 5 0 0 0 21 12 A5 5 0 0 0 11 12 Z";

//   mapMarker.width = 32;
//   mapMarker.height = 32;
//   mapMarker.scale = 0.7;
//   mapMarker.fill = am4core.color("#F4D03F");
//   mapMarker.fillOpacity = 0.8;
//   mapMarker.horizontalCenter = "middle";
//   mapMarker.verticalCenter = "bottom";

//   var marker = imageSeries.mapImages.create();
//   marker.tooltipText = "ISS";

//   chart.seriesContainer.events.on(
//     "update_iss_position",
//     function (iss_postion) {
//       rotateTo(parseInt(iss_postion.longitude) - 30);

//       let pos = {
//         latitude: parseFloat(iss_postion.latitude),
//         longitude: parseFloat(iss_postion.longitude),
//       };
//       marker.latitude = pos.latitude;
//       marker.longitude = pos.longitude;
//     }
//   );

//   //calls teh ISS api for data
//   async function retrive_iss_info() {
//     return fetch("http://api.open-notify.org/iss-now.json")
//       .then((response) => response.json())
//       .then((data) => {
//         return data;
//       });
//   }

//   //calls events to update the map
//   setInterval(async function () {
//     info = await retrive_iss_info();
//     console.log("updating home");
//     // chart.goHome();
//     chart.seriesContainer.events.dispatchImmediately(
//       "update_iss_position",
//       info.iss_position
//     );
//   }, 500);

//   // Configure series
//   var polygonTemplate = polygonSeries.mapPolygons.template;
//   polygonTemplate.tooltipText = "{name}";
//   polygonTemplate.fill = am4core.color("#47c78a");
//   polygonTemplate.stroke = am4core.color("#454a58");
//   polygonTemplate.strokeWidth = 0.2;

//   var graticuleSeries = chart.series.push(new am4maps.GraticuleSeries());
//   graticuleSeries.mapLines.template.line.stroke = am4core.color("#FDFEFE");
//   graticuleSeries.mapLines.template.line.strokeOpacity = 0.08;
//   graticuleSeries.fitExtent = false;

//   chart.backgroundSeries.mapPolygons.template.polygon.fillOpacity = 0.5;
//   chart.backgroundSeries.mapPolygons.template.polygon.fill =
//     am4core.color("#5DADE2");

//   // Create hover state and set alternative fill color
//   var hs = polygonTemplate.states.create("hover");
//   hs.properties.fill = chart.colors.getIndex(0).brighten(-0.5);

//   //animaltion
//   // let animation;
//   // setTimeout(function () {
//   //   animation = chart.animate(
//   //     { property: "deltaLongitude", to: 100000 },
//   //     20000000
//   //   );
//   // }, 500);

//   chart.seriesContainer.events.on("down", function () {
//     if (animation) {
//       // animation.stop();
//       // animation.pause();
//     }
//   });

//   // chart.seriesContainer.events.on("up", function () {
//   //   // animation.resume();
//   //   if (animation) {
//   //     setTimeout(function () {
//   //       animation = chart.animate(
//   //         { property: "deltaLongitude", to: 100000 },
//   //         20000000
//   //       );
//   //     }, 500);
//   //   }
//   // });
// }); // end am4core.ready()
