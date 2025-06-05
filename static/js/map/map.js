loadCSS('map');

function map_open(callback){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var id = 'map'+$('.map').length;
	map_popupHTML(popupBox, id);
	popup.fadeIn('fast',function(){ callback(id) });
}

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
	d.map = L.map(d.id).setView([d.lat, d.lng], d.zoom);
	map_layer(d);
	d.markers = L.layerGroup().addTo(d.map);
	map_events(d);
})}

function map_layer(d){setTimeout(function(){
	if(d.layer == 'none'){ return }
	if(d.layer == 'satellite'){
		return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			noWrap: true,
			maxZoom: 19,
			attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
		}).addTo(d.map);
	}
	return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		noWrap: true,
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(d.map);
}, 200)}

function map_events(d){
	if(typeof d.mapLoad === 'function'){ setTimeout(function(){ d.mapLoad(d) }, 1000) }
	if(typeof d.mapMoveEnd === 'function'){d.map.on('moveend', function(e){
		$('#'+d.id).append(HTML_loader());
		clearTimeout(d.map.wait);
		d.map.wait = setTimeout(function(){ remove_HTML_loader($('#'+d.id)); d.mapMoveEnd(d,e) }, 1200);
	})}
	if(typeof d.mapClick === 'function'){d.map.on('click', function(e){ d.mapClick(d,e) })}
}

function map_selectXY(d, e, elLat, elLng){
	map_removeAllMarkers(d);
	map_addMarker(d, e);
	if(!valEmpty(elLat)){ elLat.val(e.latlng.lat) }
	if(!valEmpty(elLng)){ elLng.val(e.latlng.lng) }
}

// LOCATION

function map_getLocation(l, callback){
	$.get('/crm/php/map/map', {find_location:l}, function(data){
		if(typeof callback === 'function'){ callback(JSON.parse(data)) }
	})
}

// LOAD

function map_loadMarkers(d, m){
	var ne = d.map.getBounds()['_northEast'];
	var sw = d.map.getBounds()['_southWest'];
	$.getJSON('/crm/php/map/map?get_markers=1', {
		module:m.module,
		titleCol:m.title,
		latCol:m.lat,
		lngCol:m.lng,
		colorCol:m.color,
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
			map_generateLoadedMarker(d, m.module, marker)
		});
	})
}
function map_generateLoadedMarker(d, module, marker){
	if(map_findMarker(d, marker.id)){ return }
	d.markerLoad = function(m){
		m.id = marker.id;
		if(!valEmpty(marker.title)){ m.bindPopup(marker.title) }
		$(m.getElement()).css('filter', `hue-rotate(${marker.color}deg)`);
	};
	d.markerClick = function(m,e){
		if(typeof d.markerClickEvent === 'function'){ d.markerClickEvent(module,m,e) }
		else{ map_openReadBox(module,m,e) }
	};
	map_addMarker(d,marker);
}

// BASIC

function map_addMarker(d, e){
	var marker = L.marker(e.latlng);
	d.markers.addLayer(marker);
	marker.on('mouseover', function(){ marker.openPopup() });
	marker.on('mouseout', function(){ marker.closePopup() });
	if(typeof d.markerLoad === 'function'){ d.markerLoad(marker) }
	if(typeof d.markerClick === 'function'){ marker.on('click', function(e){ d.markerClick(marker,e) }) }
}

function map_findMarker(d, id, found = false){
	d.markers.eachLayer(function(m){if(m.id == id){ found = true }});
	return found;
}

function map_removeHiddenMarkers(d){
	var ne = d.map.getBounds()['_northEast'];
	var sw = d.map.getBounds()['_southWest'];
	var latMin = sw.lat;
	var latMax = ne.lat;
	var lngMin = sw.lng;
	var lngMax = ne.lng;
	d.markers.eachLayer(function(m){
		var del = false;
        if(m['_latlng'].lat < latMin || m['_latlng'].lat > latMax){ del = true }
        if(m['_latlng'].lng < lngMin || m['_latlng'].lng > lngMax){ del = true }
        if(del){ d.markers.removeLayer(m) }
    });
}
function map_removeAllMarkers(d){ d.markers.clearLayers() }

// OTHER

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