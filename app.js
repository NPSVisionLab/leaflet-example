var L = require('leaflet');

var popup = L.popup();

L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images';


var myStyle = {
    "color": "#ff7800",
    "opacity": 0.4,
    "weight": 0
};

var map = L.map('map');

map.setView([32.5385291729546, -117.186767353706], 1);

var attribution =  '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
var tiles = 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

var layer = L.tileLayer(tiles, {
    maxZoom: 18,
    attribution: attribution
    });

layer.addTo(map);

// Layer last highighed
var highlight;


// Function to handle a click on a polygon
function onclick(e){
    if (highlight){
        map.removeLayer(highlight);
    }
    var x = e.latlng.lng;
    var y = e.latlng.lat;
    var layerData = leafletPip.pointInLayer([x,y], pickLayer);
    if (!layerData[0]) {
        console.log('nothing picked');
    }else {
	var i;
	var len = layerData.length;
	var fname=[];
	var maxPS=[];
	for (i = 0; i < len; i++) {
            fname[i] = layerData[i].feature.properties.Name;
	    maxPS[i] = layerData[i].feature.properties.MaxPS;
	}
	highlight = new L.geoJson(geoSat, {
	    filter: function(feature, layer) {
	        var i;
                var len = fname.length;
		for (i = 0; i < len; i++) {
		    return feature.properties.Name == fname[i];
		}
	    },
	    style: {color: 'skyblue', fillColor: 'skyblue'}}).addTo(map);
	var popup = '';
	for (i = 0; i < len; i++) {
	    popup += 'Map: ' + fname[i] + '<hr>' + ' MaxPS: ' + maxPS[i] + '<hr>';
	}
        var myPopup = L.popup({
            maxHeight: 300,
            keepInView: true
        }).setContent(popup);
        myPopup.setLatLng(e.latlng);
        myPopup.addTo(map);
        myPopup.openOn(map);
	//map.openPopup(popup, e.latlng);
	map.on('popupclose', function() {
	    map.removeLayer(highlight)
	    highlight = null;
	    });
    }
};

// We need go create a json layer for the map but we don't
// add it to the map since we are drawing the layer via the tiles, 
// but we still need the layer to find the map if it gets selected
var pickLayer = L.geoJson(geoSat);

// Interact with geojson data represented by the tile layer
map.on('click', onclick);

var tileOptions = {
    maxZoom: 20,  // max zoom to preserve detail on
    tolerance: 5, // simplification tolerance (higher means simpler)
    extent: 4096, // tile extent (both width and height)
    buffer: 64,   // tile buffer on each side
    debug: 0,      // logging level (0 to disable, 1 or 2)
    indexMaxZoom: 1,        // max zoom in the initial tile index
    indexMaxPoints: 10000000, // max number of points per tile in the index
};

var tileIndex = geojsonvt(geoSat, tileOptions);

var tileLayer = new L.TileLayer.Canvas();
     
tileLayer.drawTile = function (canvas, tileLoc, zoom) {
    
    var ctx  = canvas.getContext('2d');
    var tileSize = this.options.tileSize;

    ctx.globalCompositeOperation = 'source-over';


    var tile = tileIndex.getTile(zoom, tileLoc.x, tileLoc.y);
    if (!tile) {
	console.log('tile empty');
	return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var features = tile.features;
    var pad = 0;

    ctx.strokeStyle = 'orange';

    for (var i = 0; i < features.length; i++) {
	var feature = features[i],
	type = feature.type;

	ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(255, 120,0,0.4)';
	ctx.beginPath();

	for (var j = 0; j < feature.geometry.length; j++) {
	    var geom = feature.geometry[j];

	    if (type === 1) {
		ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
		continue;
	    }

	    for (var k = 0; k < geom.length; k++) {
		var p = geom[k];
		var extent = 4096;
                       
		var x = p[0] / extent * 256;
		var y = p[1] / extent * 256;
		if (k) ctx.lineTo(x  + pad, y   + pad);
		  else ctx.moveTo(x  + pad, y  + pad);
	    
	    } 
	}

	if (type === 3 || type === 1) ctx.fill('evenodd');
	ctx.stroke();
    }

};


tileLayer.addTo(map);



