loadCSS('map');

function map_open(callback){loadJS(`map/slovar/${slovar()}`, function(){
	var popup = createPOPUPbox().css('z-index',997);
	var popupBox = popup.find('.popupBox');
	var id = 'map'+$('.map').length;
	map_popupHTML(popupBox, id);
	popup.fadeIn('fast',function(){ callback(id) });
})}

function map_popupHTML(popupBox, id, html = ''){
	html += '<div class="map" id="'+id+'"></div>';
	html += '<button class="button button100 buttonBlue" onclick="removePOPUPbox()">'+slovar('Close')+'</button>'
	popupBox.html(html);
	popupBox.css('padding',0);
	popupBox.find('.buttonBlue').css('margin',0);
}

function map_create(d){loadJS('map/leaflet', function(){
	if(valEmpty(d.lat)){ d.lat = 46.06 }
	if(valEmpty(d.lng)){ d.lng = 15.01 }
	if(valEmpty(d.zoom)){ d.zoom = 8 }

	let mapLayer = map_layer();

	d.map = L.map(d.id, {
		center: [d.lat, d.lng],
		zoom: d.zoom,
		layers: [mapLayer[0]]
	});

	d.layerControl = L.control.layers({
		[slovar('Classic_view')]: mapLayer[0],
		[slovar('Satellite_image')]: mapLayer[1]
	}).addTo(d.map);

	d.markers = L.layerGroup().addTo(d.map);
	map_events(d);
})}

function map_layer(){
	return [
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			noWrap: true,
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}),
		L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			noWrap: true,
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		})
	];
}

function map_events(d){
	if(typeof d.mapLoad === 'function'){ setTimeout(function(){ d.mapLoad(d) }, 1000) }
	if(typeof d.mapMoveEnd === 'function'){d.map.on('moveend', function(e){
		$('#'+d.id).append(HTML_loader());
		clearTimeout(d.map.wait);
		d.map.wait = setTimeout(function(){ remove_HTML_loader($('#'+d.id)); d.mapMoveEnd(d,e) }, 1200);
	})}
	if(typeof d.mapClick === 'function'){d.map.on('click', function(e){ d.mapClick(d,e) })}
}

// LOCATION

function map_getLocation(l, callback){
	$.get('/crm/php/map/map', {find_location:l}, function(data){
		if(typeof callback === 'function'){ callback(JSON.parse(data)) }
	})
}

// MARKERS

function map_loadMarkers(d, m){
	var ne = d.map.getBounds()['_northEast'];
	var sw = d.map.getBounds()['_southWest'];
	$.getJSON('/crm/php/map/map?get_markers=1', {
		module:m.module,
		titleCol:m.title,
		latCol:m.lat,
		lngCol:m.lng,
		iconCol: m.icon,
		colorCol:m.color,
		groupCol:m.group,
		join:m.join,
		filter:m.filter,
		latMin:sw.lat,
		latMax:ne.lat,
		lngMin:sw.lng,
		lngMax:ne.lng
	}, function(markers){
		map_removeHiddenMarkers(d);
		if(!markers){ return }
		markers.forEach(marker => {
			map_generateLoadedMarker(d, m.module, marker);
		});
	})
}

function map_generateLoadedMarker(d, module, marker){
	if(map_findMarker(d, marker.id)){ return }
	d.markerLoad = function(m){
		m.id = marker.id;
		if(!valEmpty(marker.title)){
			m.title = marker.title;
			m.bindPopup(marker.title);
		}
		$(m.getElement()).css('filter', `hue-rotate(${marker.color}deg)`);
	};
	d.markerClick = function(m,e){
		if(typeof d.markerClickEvent === 'function'){ d.markerClickEvent(module,m,e) }
		else{ map_openReadBox(module,m,e) }
	};
	map_addMarker(d,marker);
}

function map_addMarker(d, m){
	if (!d.groups) d.groups = {};

	var marker = L.marker(m.latlng, map_markerIcon(m));

	if (m.group) {
		let groupLayer = map_getOrCreateGroupLayer(d, m.group);
		groupLayer.addLayer(marker);
	} else {
		d.markers.addLayer(marker);
	}

	marker.on('mouseover', function(){ marker.openPopup() });
	marker.on('mouseout', function(){ marker.closePopup() });
	if(typeof d.markerLoad === 'function'){ d.markerLoad(marker) }
	if(typeof d.markerClick === 'function'){
		marker.on('click', function(e){
			map_goThruMarkers(d, function(mar){ mar.setOpacity(1) });
			marker.setOpacity(0.5);
			d.markerClick(marker,e);
		})
	}

	marker.on('add', () => {
		$(marker.getElement()).css('filter', `hue-rotate(${m.color}deg)`);
	});
}

function map_markerIcon(m){
	if (m.icon) {
		return {
			icon: L.icon({
				iconUrl: m.icon,
				iconSize: [25, 41],
				iconAnchor: [16, 32],
				popupAnchor: [-2, -25]
			})
		};
	}
	return {};
}

function map_findMarker(d, id){
	let found = false;

	map_goThruMarkers(d, function(m){
		if(m.id == id){ found = true }
	})

	return found;
}

function map_removeHiddenMarkers(d){
	var ne = d.map.getBounds()['_northEast'];
	var sw = d.map.getBounds()['_southWest'];
	var latMin = sw.lat;
	var latMax = ne.lat;
	var lngMin = sw.lng;
	var lngMax = ne.lng;

	map_goThruMarkers(d, function(m, g){
		var lat = m.getLatLng().lat;
		var lng = m.getLatLng().lng;
		if(lat < latMin || lat > latMax || lng < lngMin || lng > lngMax){
			g.removeLayer(m);
		}
	})
}
function map_removeAllMarkers(d){ map_goThruMarkers(d, function(m, g){ g.removeLayer(m) }) }

function map_goThruMarkers(d, callback){
	d.markers.eachLayer(function(m){ callback(m, d.markers) });
	if (d.groups) {
		for (let group of Object.values(d.groups)) {
			group.eachLayer(function(m){ callback(m, group) });
		}
	}
}

// GROUPS

function map_getOrCreateGroupLayer(d, groupName) {
	if (!d.groups[groupName]) {
		const groupLayer = L.layerGroup().addTo(d.map);
		d.groups[groupName] = groupLayer;
		d.layerControl.addOverlay(groupLayer, groupName);
	}
	return d.groups[groupName];
}

// EVENTS

function map_selectXY(d, e, elLat, elLng){
	map_removeAllMarkers(d);
	map_addMarker(d, e);
	if(!valEmpty(elLat)){ elLat.val(e.latlng.lat) }
	if(!valEmpty(elLng)){ elLng.val(e.latlng.lng) }
}

function map_openReadBox(module, d, e){
	loadJS('main/read-box-mini',function(){
		$('#Main').append('<div id="mapTemp"></div>');
		$('#mapTemp').css({
			'position':'fixed',
			'left':e.containerPoint.x,
			'top':e.containerPoint.y + 100
		});
		open_readBoxMini($('#mapTemp'),'row',module,d.id);
		setTimeout(function(){ $('#mapTemp').remove() }, 500)
	})
}