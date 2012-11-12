
//<![CDATA[
// this variable will collect the html which will eventually be placed in the side_bar 
var side_bar_html = ""; 

var gmarkers = [];
var gicons = [];
var map = null;

var infowindow = new google.maps.InfoWindow({ 
size: new google.maps.Size(150,50)
});

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var markerArray = [];

//the direction end point
var end;
var start;


gicons["red"] = new google.maps.MarkerImage("mapIcons/marker_red.png",
// This marker is 20 pixels wide by 34 pixels tall.
new google.maps.Size(20, 34),
// The origin for this image is 0,0.
new google.maps.Point(0,0),
// The anchor for this image is at 9,34.
new google.maps.Point(9, 34));
// Marker sizes are expressed as a Size of X,Y
// where the origin of the image (0,0) is located
// in the top left of the image.

// Origins, anchor positions and coordinates of the marker
// increase in the X direction to the right and in
// the Y direction down.


var iconImage = new google.maps.MarkerImage('mapIcons/marker_red.png',
// This marker is 20 pixels wide by 34 pixels tall.
new google.maps.Size(20, 34),
// The origin for this image is 0,0.
new google.maps.Point(0,0),
// The anchor for this image is at 9,34.
new google.maps.Point(9, 34));
var iconShadow = new google.maps.MarkerImage('http://www.google.com/mapfiles/shadow50.png',
// The shadow image is larger in the horizontal dimension
// while the position and offset are the same as for the main image.
new google.maps.Size(37, 34),
new google.maps.Point(0,0),
new google.maps.Point(9, 34));
// Shapes define the clickable region of the icon.
// The type defines an HTML &lt;area&gt; element 'poly' which
// traces out a polygon as a series of X,Y points. The final
// coordinate closes the poly by connecting to the first
// coordinate.
var iconShape = {
	coord: [9,0,6,1,4,2,2,4,0,8,0,12,1,14,2,16,5,19,7,23,8,26,9,30,9,34,11,34,11,30,12,26,13,24,14,21,16,18,18,16,20,12,20,8,18,4,16,2,15,1,13,0],
	type: 'poly'
};

function getMarkerImage(iconColor) {
	if ((typeof(iconColor)=="undefined") || (iconColor==null)) { 
		iconColor = "red"; 
	}
	if (!gicons[iconColor]) {
		gicons[iconColor] = new google.maps.MarkerImage("mapIcons/marker_"+ iconColor +".png",
		// This marker is 20 pixels wide by 34 pixels tall.
		new google.maps.Size(20, 34),
		// The origin for this image is 0,0.
		new google.maps.Point(0,0),
		// The anchor for this image is at 6,20.
		new google.maps.Point(9, 34));
	} 
	return gicons[iconColor];
}


function category2color(category) {
	var color = "red";
	switch(category) {
		case "scene": color = "blue";
		break;
		case "restaurent":    color = "green";
		break;
		case "hotel":    color = "yellow";
		break;
		default:   color = "red";
		break;
	}
	return color;
}

gicons["scene"] = getMarkerImage(category2color("scene"));
gicons["restaurent"] = getMarkerImage(category2color("restaurent"));
gicons["hotel"] = getMarkerImage(category2color("hotel"));

// A function to create the marker and set up the event window
function createMarker(latlng,name,html,category) {
	var contentString = html;
	var marker = new google.maps.Marker({
		position: latlng,
		icon: gicons[category],
		shadow: iconShadow,
		map: map,
		title: name,
		zIndex: Math.round(latlng.lat()*-100000)<<5
	});
	// === Store the category and name info as a marker properties ===
	marker.mycategory = category;                                 
	marker.myname = name;
	gmarkers.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
		document.getElementById("end").value = name;
		end = latlng;
		infowindow.setContent(contentString); 
		infowindow.open(map,marker);
	});
}

// == shows all markers of a particular category, and ensures the checkbox is checked ==
function show(category) {
	for (var i=0; i<gmarkers.length; i++) {
		if (gmarkers[i].mycategory == category) {
			gmarkers[i].setVisible(true);
			gmarkers[i].setAnimation(google.maps.Animation.DROP);
		}
	}
	// == check the checkbox ==
	document.getElementById(category+"box").checked = true;
}

// == hides all markers of a particular category, and ensures the checkbox is cleared ==
function hide(category) {
	for (var i=0; i<gmarkers.length; i++) {
		if (gmarkers[i].mycategory == category) {
			gmarkers[i].setVisible(false);
		}
	}
	// == clear the checkbox ==
	document.getElementById(category+"box").checked = false;
	// == close the info window, in case its open on a marker that we just hid
	infowindow.close();
}

// == a checkbox has been clicked ==
function boxclick(box,category) {
	if (box.checked) {
		show(category);
	} 
	else {
		hide(category);
	}
// == rebuild the side bar
//makeSidebar();
}

function myclick(i) {
	google.maps.event.trigger(gmarkers[i],"click");
}


// == rebuilds the sidebar to match the markers currently displayed ==
function makeSidebar() {
var html = "";
	for (var i=0; i<gmarkers.length; i++) {
		if (gmarkers[i].getVisible()) {
			html += '<a href="javascript:myclick(' + i + ')">' + gmarkers[i].myname + '<\/a><br>';
		}
	}
	document.getElementById("side_bar").innerHTML = html;
}

function calcRoute() {
	//At first, clear all old route direction markers and markers' map
	for(var i = 0; i < markerArray.length; i++){
		markerArray[i].setMap(null);
	}

	//var selectedMode = document.getElementById("mode").value;
  var selectedMode = "DRIVING";
	start = document.getElementById('start').value;
  if(end == null){
    end = document.getElementById("end").value;
  }
	var request = {
		origin: start,
		destination: end,
		travelMode: google.maps.TravelMode[selectedMode]
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			showSteps(response);
			jamRoadWarning(response);
		}
	});
  end = null;
  start = null;
}

function showSteps(directionResult){
	var myRoute = directionResult.routes[0].legs[0];
	for(var i = 0; i < myRoute.steps.length; i++){
		var marker = new google.maps.Marker({
			position: myRoute.steps[i].start_point,
			map: map
		});
		attachInstructionText(marker, myRoute.steps[i].instructions);
		markerArray[i] = marker;
	}
}

function attachInstructionText(marker, text){
	google.maps.event.addListener(marker, "click", function(){
		infowindow.setContent(text);
		infowindow.open(map, marker);
	});
}


//jam roads calculations => main part
function jamRoadWarning(directionResult){
  document.getElementById("warning-panel").innerHTML = "";
  var paths = mappingPaths(directionResult);
  /*
  alert(paths.size());
  for(var i = 0; i < paths.size(); i++){
    alert(paths.get(i));
  }
  */
  downloadUrl("xml/trafficinfo.xml", function(doc){
    var xml = xmlParse(doc);
    var jamRoads = xml.documentElement.getElementsByTagName("trafficinfoTab");
    for(var i = 0; i < jamRoads.length; i++){
      //first jam road's point
      var firstLatLngStr;
      for(var j = 0; j < jamRoads[i].childNodes.length; j++){
        if(jamRoads[i].childNodes[j].tagName == "S_Point"){
          if(jamRoads[i].childNodes[j].textContent == undefined)
            firstLatLngStr = jamRoads[i].childNodes[j].firstChild.text;
          else
            firstLatLngStr = jamRoads[i].childNodes[j].textContent;
        }
      }
      var firstLatstr = firstLatLngStr.split(",")[0].split(".")[0] + "." + firstLatLngStr.split(",")[0].split(".")[1].substr(0, 4);
      var firstLngstr = firstLatLngStr.split(",")[1].split(".")[0] + "." + firstLatLngStr.split(",")[1].split(".")[1].substr(0, 4);
      firstLatLngStr = firstLatstr + "," + firstLngstr;
      if(paths.containsValue(firstLatLngStr)){
        //second jam road's point
        var secondLatLngStr;
        for(var j = 0; j < jamRoads[i].childNodes.length; j++){
          if(jamRoads[i].childNodes[j].tagName == "T_Point"){
            if(jamRoads[i].childNodes[j].textContent == undefined)
              secondLatLngStr = jamRoads[i].childNodes[j].firstChild.text;
            else
              secondLatLngStr = jamRoads[i].childNodes[j].textContent;
          }
        }
        var secondLatstr = secondLatLngStr.split(",")[0].split(".")[0] + "." + secondLatLngStr.split(",")[0].split(".")[1].substr(0, 4);
        var secondLngstr = secondLatLngStr.split(",")[1].split(".")[0] + "." + secondLatLngStr.split(",")[1].split(".")[1].substr(0, 4);
        secondLatLngStr = secondLatstr + "," + secondLngstr;
        if(paths.containsValue(secondLatLngStr)){
          var jamRoadName;
          for(var j = 0; j < jamRoads[i].childNodes.length; j++){
            if(jamRoads[i].childNodes[j].tagName == "Rname_org"){
              if(jamRoads[i].childNodes[j].textContent == undefined)
                jamRoadName = jamRoads[i].childNodes[j].firstChild.text;
              else
                jamRoadName = jamRoads[i].childNodes[j].textContent;
            }
          }
          var sugRoadName;
          for(var j = 0; j < jamRoads[i].childNodes.length; j++){
            if(jamRoads[i].childNodes[j].tagName == "Rname_new"){
              if(jamRoads[i].childNodes[j].textContent == undefined)
                sugRoadName = jamRoads[i].childNodes[j].firstChild.text;
              else
                sugRoadName = jamRoads[i].childNodes[j].textContent;
            }
          }
          document.getElementById("warning-panel").innerHTML += "<p><strong>"+jamRoadName+"<\/strong> 壅塞，建議改道 <strong>"+sugRoadName+"<\/strong><\/p>";
        }
      }
    }
  });
}

function mappingPaths(directionResult){
  var map = new HashMap();
  var myRoute = directionResult.routes[0].legs[0];
  var count = 0;
  for(var i = 0; i < myRoute.steps.length; i++){
    for(var j = 0; j < myRoute.steps[i].path.length; j++){
      var latlngstr = myRoute.steps[i].path[j].toString();
      var unsurelatstr = latlngstr.split(",")[0].split("(")[1];
      var latstr = unsurelatstr.split(".")[0] + "." + unsurelatstr.split(".")[1].substr(0, 4);
      var unsurelngstr = latlngstr.split(",")[1].split(")")[0];
      var lngstr = unsurelngstr.split(".")[0] + "." + unsurelngstr.split(".")[1].substr(0, 4);
      map.put(count++, latstr+","+lngstr);
    }
  }
  return map;
}

function getPlace(index){
  switch(index){
    case 0:
      document.getElementById("start").value = "桃園縣政府";
      start = "(24.993417,121.301025)";
      break;
    case 1:
      document.getElementById("start").value = "中壢夜市";
      start = "(24.958894,121.214797)";
      break;
    case 2:
      document.getElementById("start").value = "中壢火車站";
      start = "(24.953651,121.225767)";
      break;
    case 3:
      document.getElementById("start").value = "中央大學";
      start = "(24.967949,121.193231)";
      break;
    case 4:
      document.getElementById("start").value = "中原大學";
      start = "(24.958232,121.240652)";
      break;
    case 5:
      document.getElementById("start").value = "內壢火車站";
      start = "(24.972756,121.258211)";
      break;

  }
}

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();
	var myOptions = {
		zoom: 11,
		center: new google.maps.LatLng(24.962, 121.218),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	google.maps.event.addListener(map, 'click', function() {
		infowindow.close();
	});

  //right click
  var contextMenuOptions={};
  contextMenuOptions.classNames={menu:'context_menu', menuSeparator:'context_menu_separator'};
  
  var menuItems=[];
  menuItems.push({className:'context_menu_item', eventName:'directions_origin_click', id:'directionsOriginItem', label:'設為出發點'});
  menuItems.push({className:'context_menu_item', eventName:'directions_destination_click', id:'directionsDestinationItem', label:'設為目的地'});
  //備用
  //menuItems.push({className:'context_menu_item', eventName:'clear_directions_click', id:'clearDirectionsItem', label:'Clear directions'});
  //menuItems.push({className:'context_menu_item', eventName:'get_directions_click', id:'getDirectionsItem', label:'Get directions'});
  //  a menuItem with no properties will be rendered as a separator
  menuItems.push({});
  menuItems.push({className:'context_menu_item', eventName:'zoom_in_click', label:'在此放大'});
  menuItems.push({className:'context_menu_item', eventName:'zoom_out_click', label:'在此縮小'});
  menuItems.push({});
  menuItems.push({className:'context_menu_item', eventName:'center_map_click', label:'以此為中心點'});
  contextMenuOptions.menuItems=menuItems;
  
  var contextMenu=new ContextMenu(map, contextMenuOptions);
  
  google.maps.event.addListener(map, 'rightclick', function(mouseEvent){
    contextMenu.show(mouseEvent.latLng);
  });

  var markerOptions={};
  markerOptions.icon='http://www.google.com/intl/en_ALL/mapfiles/markerA.png';
  markerOptions.map=null;
  markerOptions.position=new google.maps.LatLng(0, 0);
  markerOptions.title='出發點';
  
  var originMarker=new google.maps.Marker(markerOptions);
  
  markerOptions.icon='http://www.google.com/intl/en_ALL/mapfiles/markerB.png';
  markerOptions.title='目的地';
  var destinationMarker=new google.maps.Marker(markerOptions);

  google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName){
    switch(eventName){
      case 'directions_origin_click':
        originMarker.setPosition(latLng);
        document.getElementById("start").value = latLng;
        if(!originMarker.getMap()){
          originMarker.setMap(map);
        }
        break;
      case 'directions_destination_click':
        destinationMarker.setPosition(latLng);
        document.getElementById("end").value = latLng;
        end = latLng;
        if(!destinationMarker.getMap()){
          destinationMarker.setMap(map);
        }
        break;
      case 'clear_directions_click':
        directionsRenderer.setMap(null);
        //  set CSS styles to defaults
        document.getElementById('clearDirectionsItem').style.display='';
        document.getElementById('directionsDestinationItem').style.display='';
        document.getElementById('directionsOriginItem').style.display='';
        document.getElementById('getDirectionsItem').style.display='';
        break;
      /*  備用
      case 'get_directions_click':
        var directionsRequest={};
        directionsRequest.destination=destinationMarker.getPosition();
        directionsRequest.origin=originMarker.getPosition();
        directionsRequest.travelMode=google.maps.TravelMode.DRIVING;
        
        directionsService.route(directionsRequest, function(result, status){
          if(status===google.maps.DirectionsStatus.OK){
            //  hide the origin and destination markers as the DirectionsRenderer will render Markers itself
            originMarker.setMap(null);
            destinationMarker.setMap(null);
            directionsRenderer.setDirections(result);
            directionsRenderer.setMap(map);
            //  hide all but the 'Clear directions' menu item
            document.getElementById('clearDirectionsItem').style.display='block';
            document.getElementById('directionsDestinationItem').style.display='none';
            document.getElementById('directionsOriginItem').style.display='none';
            document.getElementById('getDirectionsItem').style.display='none';
          } else {
            alert('Sorry, the map was unable to obtain directions.\n\nThe request failed with the message: '+status);
          }
        });
        break;
        */
      case 'zoom_in_click':
        map.setZoom(map.getZoom()+1);
        break;
      case 'zoom_out_click':
        map.setZoom(map.getZoom()-1);
        break;
      case 'center_map_click':
        map.panTo(latLng);
        break;
    }
    if(originMarker.getMap() && destinationMarker.getMap() && document.getElementById('getDirectionsItem').style.display===''){
      //  display the 'Get directions' menu item if it is not visible and both  and destination have been selected
      document.getElementById('getDirectionsItem').style.display='block';
    }
  });

  //--read data--//
  downloadUrl("xml/travelinfo.xml", function(doc) {
    var xml = xmlParse(doc);
    var markers = xml.documentElement.getElementsByTagName("travelinfo");
    for (var i = 0; i < markers.length; i++) {
      var name;
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Name")
          if(markers[i].childNodes[j].textContent == undefined)
            name = markers[i].childNodes[j].firstChild.text;
          else
            name = markers[i].childNodes[j].textContent;
      }
      var latStr; 
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Py")
          if(markers[i].childNodes[j].textContent == undefined)
            latStr = markers[i].childNodes[j].firstChild.text;
          else
            latStr = markers[i].childNodes[j].textContent;
      }
      var lngStr; 
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Px")
          if(markers[i].childNodes[j].textContent == undefined)
            lngStr = markers[i].childNodes[j].firstChild.text;
          else
            lngStr = markers[i].childNodes[j].textContent;
      }
      var lat = parseFloat(latStr);
      var lng = parseFloat(lngStr);
      var point = new google.maps.LatLng(lat, lng);
      var description;
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Toldescribe")
          if(markers[i].childNodes[j].textContent == undefined)
            description = markers[i].childNodes[j].firstChild.text;
          else
            description = markers[i].childNodes[j].textContent;
      }
      var html = "<b>"+name+"<\/b><p>"+description+"<\/p>";
      var category = "scene";
      // create the marker
      var marker = createMarker(point,name,html,category);
    }

    // == show or hide the categories initially ==
    show("scene");
    hide("restaurent");
    hide("hotel");
    // == create the initial sidebar ==
    //makeSidebar();
  });

  downloadUrl("xml/restinfo.xml", function(doc) {
    var xml = xmlParse(doc);
    var markers = xml.documentElement.getElementsByTagName("restinfo");
    for (var i = 0; i < markers.length; i++) {
      var name;
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Name")
          if(markers[i].childNodes[j].textContent == undefined)
            name = markers[i].childNodes[j].firstChild.text;
          else
            name = markers[i].childNodes[j].textContent;
      }
      var latStr; 
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Py")
          if(markers[i].childNodes[j].textContent == undefined)
            latStr = markers[i].childNodes[j].firstChild.text;
          else
            latStr = markers[i].childNodes[j].textContent;
      }
      var lngStr; 
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Px")
          if(markers[i].childNodes[j].textContent == undefined)
            lngStr = markers[i].childNodes[j].firstChild.text;
          else
            lngStr = markers[i].childNodes[j].textContent;
      }
      var lat = parseFloat(latStr);
      var lng = parseFloat(lngStr);
      var point = new google.maps.LatLng(lat, lng);
      var description;
      for (var j = 0; j < markers[i].childNodes.length; j++) {
        if(markers[i].childNodes[j].tagName == "Description")
          if(markers[i].childNodes[j].textContent == undefined)
            description = markers[i].childNodes[j].firstChild.text;
          else
            description = markers[i].childNodes[j].textContent;
      }
      var html = "<b>"+name+"<\/b><p>"+description+"<\/p>";
      var category = "restaurent";
      // create the marker
      var marker = createMarker(point,name,html,category);
    }

    // == show or hide the categories initially ==
    show("scene");
    hide("restaurent");
    hide("hotel");
    // == create the initial sidebar ==
    //makeSidebar();
  });

	downloadUrl("xml/GMapLocation.xml", function(doc) {
		var xml = xmlParse(doc);
		var markers = xml.documentElement.getElementsByTagName("GMapLocation");
		for (var i = 0; i < markers.length; i++) {
			var name;
			for (var j = 0; j < markers[i].childNodes.length; j++) {
				if(markers[i].childNodes[j].tagName == "G_title")
					if(markers[i].childNodes[j].textContent == undefined)
            name = markers[i].childNodes[j].firstChild.text;
          else
            name = markers[i].childNodes[j].textContent;
			}
			var lnglatStr;
			for (var j = 0; j < markers[i].childNodes.length; j++) {
				if(markers[i].childNodes[j].tagName == "G_point")
					if(markers[i].childNodes[j].textContent == undefined)
            lnglatStr = markers[i].childNodes[j].firstChild.text;
          else
            lnglatStr = markers[i].childNodes[j].textContent;
			}
			var lat = parseFloat(lnglatStr.split(",")[1]);
			var lng = parseFloat(lnglatStr.split(",")[0]);
			var point = new google.maps.LatLng(lat, lng);
			var description;
			for (var j = 0; j < markers[i].childNodes.length; j++) {
				if(markers[i].childNodes[j].tagName == "G_pic1_content")
					if(markers[i].childNodes[j].textContent == undefined)
            description = markers[i].childNodes[j].firstChild.text;
          else
            description = markers[i].childNodes[j].textContent;
			}
			var html = "<b>"+name+"<\/b><p>"+description+"<\/p>";
			var category = "hotel";
			// create the marker
			var marker = createMarker(point,name,html,category);
		}

		// == show or hide the categories initially ==
		show("scene");
		hide("restaurent");
		hide("hotel");
		// == create the initial sidebar ==
		//makeSidebar();
	});

	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("direction-panel"));

	var control = document.getElementById("control");
	control.style.display = "block";
	//map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);

}





