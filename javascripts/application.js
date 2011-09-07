var tw = [];
var vizzuality_mad = new google.maps.LatLng(40.42238718089105,-3.6995601654052734);
var vizzuality_ny = new google.maps.LatLng(40.7203421,-74.0079781);
var map;
var directionsService = new google.maps.DirectionsService();
var MY_MAPTYPE_ID = 'vizzuality';
var bounds;
var vizz_icon;
var userLatLng;

var polyline,vizz_marker,user_marker;


$(document).ready( function() {
	
	//Hack for a into a tags
	$('p.contact').click(function(ev){
		ev.preventDefault();
		ev.stopPropagation();
		window.location.href = 'mailto:contact@vizzuality.com';
	});

	//Scroll in the image of the projects
	$('div.image').jScrollPane({showArrows:true, scrollbarWidth:8, reinitialiseOnImageLoad:true});
	
	// Let's expand home projects list
	$('div.module div.more_projects a').click(function(ev){
	  ev.preventDefault();
	  var total = (($('ul.important li').size() - 12) / 3);
	  var height_var = ((total % 3) > 0)?Math.floor(total+1):total;
	  var new_height = 1000 + (250*height_var);
	  $('ul.important').animate({height:new_height+'px'},300,function(){
	    $('div.module div.more_projects a').fadeOut('fast');
	    $('div.module div.more_projects').animate({height:0,paddingBottom:0,paddingTop:'10px'},300).css({'border':'none'});
	  });
	});
	
	//Text-shadow IE7
	$('div.header h1').textShadow({color:"#44631E",xoffset:"-6px",yoffset: "40px",opacity: '5'});
	$('div.header h2').textShadow({color:"#44631E",xoffset:"0",yoffset: "1px",opacity: '5'});

	//Calculate green background position
	var distance = $('div.info').offset();
	
	
	$('span.left_side, span.right_side').css('background-position','0 '+ (distance.top+100-640) +'px');
	var logo_position = $('a.logo').offset();
	$('span.line').css('top',logo_position.top+90+'px');
	
	//MAP OPERATIONS
			
	var stylez = [{featureType: "all",elementType: "all",stylers: [{ saturation: -99 },{ lightness: -80 }]}];

	var mapOptions = {
	 	zoom: 11,
	 	center: vizzuality_mad,
	 	mapTypeControlOptions: {
	  	mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'vizzuality']
	 	},
		draggable: false,
		streetViewControl: false,
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById("map"),mapOptions);
	bounds = new google.maps.LatLngBounds();

	vizz_icon = new google.maps.MarkerImage('/images/common/vizz_marker.png',
	      new google.maps.Size(30, 26),
	      new google.maps.Point(0,0),
	      new google.maps.Point(17, 31));



	
	var styledMapOptions = {name: "Vizzuality"}
	var jayzMapType = new google.maps.StyledMapType(stylez, styledMapOptions);

	map.mapTypes.set('vizzuality', jayzMapType);
	map.setMapTypeId('vizzuality');	
	google.setOnLoadCallback(getGeolocation);
	
	
	if ($('#blog_news').length > 0) {
		$.getJSON("http://blog.vizzuality.com/api/read/json?type=text&filter=text&callback=?", 
		  function(blog_posts) {
				$('ul#blog_news li').each(function(index,element){
					$(element).find('h5').text(blog_posts.posts[index]["regular-title"]);
					$(element).find('p.ago').text(blog_posts.posts[index]["date"].substr(0,blog_posts.posts[index]["date"].length-8));
					$(element).find('p.info').html(blog_posts.posts[index]["regular-body"].substr(0,200)+'...<a href="'+ blog_posts.posts[index]["url"] +'">Read more</a>');
				});
				$('div.rss').css('opacity','0');
				$('div.rss').css('display','block');
				$('div.rss').animate({opacity:1},2000);
			}
		);
	}
	

	$('a.office').click(function(ev){
		ev.stopPropagation();
		ev.preventDefault();
		if (userLatLng!=null) {
			if ($(this).text()=='MADRID') {
				showRoad(userLatLng,{position:vizzuality_mad,office:'Madrid'});
			} else {
				showRoad(userLatLng,{position:vizzuality_ny,office:'New York'});
			}
		}
	});
});


	
	
	function getGeolocation(){
		if (google.loader.ClientLocation) {
			userLatLng = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
			showRoad(userLatLng,calculateNearOffice(userLatLng));
	  } else {
			bounds.extend(vizzuality_mad);
			bounds.extend(vizzuality_ny);
			map.fitBounds(bounds);
			
			vizz_marker = new google.maps.Marker({
			    position: vizzuality_mad,
					icon: vizz_icon,
			    map: map
			});
			user_marker = new google.maps.Marker({
			    position: vizzuality_ny,
			    icon: vizz_icon,
			    map: map
			});
			 
			window.onresize = function(event) {
			   map.setCenter(bounds.getCenter());
			}      
	  }
	}
	
	
	function calculateNearOffice(user_latlng) {
		if (distHaversine(user_latlng,vizzuality_ny)<distHaversine(user_latlng,vizzuality_mad)) {
			return {position:vizzuality_ny,office:'New York'};
		} else {
			return {position:vizzuality_mad,office:'Madrid'};
		}
	}



	function calcRoute(origin,destination,kind) {
	  var start = origin;
	  var end = destination.position;

	  var request = {
	      origin:origin, 
	      destination:end,
	      travelMode: (kind=="driving")? google.maps.DirectionsTravelMode.DRIVING : google.maps.DirectionsTravelMode.WALKING
	  };
	  directionsService.route(request, function(response, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
		
				vizz_marker = new google.maps.Marker({
		        position: end,
		        icon: vizz_icon,
		        map: map
		    });
				user_marker = new google.maps.Marker({
		        position: origin, 
		        map: map
		    });
				var steps = response.routes[0].legs[0].steps;             
				createColorPoly(steps);	      
				$('p.duration').html('Come and meet us at '+destination.office+' office, it only takes <strong>' + response.routes[0].legs[0].duration.text + '</strong> ' + kind);
			}
	  });
	}
	
	
	
	function createColorPoly(steps){    
    var path = Array();
     for(var step = 0; step < steps.length; step++){
         for(var stepP = 0; stepP < steps[step].path.length; stepP++){
              path.push(steps[step].path[stepP]);
         }
  	  }
    var poly_options = {'strokeWeight':'6','strokeColor':'#070707'} ;
    polyline = new google.maps.Polyline(poly_options);
    polyline.setPath(path);
    polyline.setMap(map);
	}
	
	
	
	
	rad = function(x) {return x*Math.PI/180;}

	distHaversine = function(p1, p2) {
	  var R = 6371; // earth's mean radius in km
	  var dLat  = rad(p2.lat() - p1.lat());
	  var dLong = rad(p2.lng() - p1.lng());

	  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	  var d = R * c;

	  return d.toFixed(3);
	}
	
	
	function showRoad(initialLocation,destination) {
		resetMap();
		
		bounds.extend(initialLocation);
		bounds.extend(destination.position);
		
		var distance = distHaversine(initialLocation,destination.position); //kilometers
		
		if (distance<0.05) {
	    vizz_marker = new google.maps.Marker({
	        position: destination.position, 
	        map: map,
	        icon: vizz_icon
	    });
			map.setCenter(destination.position);
		} else if (distance>=0.05 && distance<0.5) {
			calcRoute(initialLocation,destination,"walking");
		} else if (distance>=0.5 && distance<800) {
			calcRoute(initialLocation,destination,"driving");
		} else if (distance>=800) {
			var distance = distHaversine(initialLocation,destination.position); //kilometers
			var hours = Math.ceil(distance/700);
			vizz_marker = new google.maps.Marker({
			      position: destination.position,
			      icon: vizz_icon,
			      map: map
			 });
			user_marker = new google.maps.Marker({
			      position: initialLocation, 
			      map: map
			 });
			var geodesic_line = [destination.position,initialLocation];
		  polyline = new google.maps.Polyline({
		    path: geodesic_line,
		    strokeColor: '#090909',
		    strokeOpacity: 0.7,
		    strokeWeight: 7.0,
				geodesic: true,
				map: map
		  });
			$('p.duration').html('Come and meet us at '+destination.office+' office, we are only <strong>' + hours + ((hours==1)?' hour':' hours') +' </strong> away by plane');
		}
		map.fitBounds(bounds);
		window.onresize = function(event) {
		   map.setCenter(bounds.getCenter());
		}
	}
	
	
	function resetMap(){
		bounds = new google.maps.LatLngBounds();
		if (vizz_marker != null) vizz_marker.setMap(null);
		if (user_marker != null) user_marker.setMap(null);
		if (polyline != null) polyline.setMap(null);
		$('p.duration').html('');
	}
	





	/*OTHER VIZZUALITY WEB STUFF*/

	function opacity(id, opacStart, opacEnd, millisec) {
		var speed = Math.round(millisec / 100);
		var timer = 0;
		if(opacStart > opacEnd) {
			for(i = opacStart; i >= opacEnd; i--) {
				setTimeout("changeOpac(" + i + ",'" + id + "')",(timer * speed));
				timer++;
			}
		} else if(opacStart < opacEnd) {
			for(i = opacStart; i <= opacEnd; i++)
				{
				setTimeout("changeOpac(" + i + ",'" + id + "')",(timer * speed));
				timer++;
			}
		}
	}



	function changeOpac(opacity, id) {
		var object = document.getElementById(id).style; 
		object.opacity = (opacity / 100);
		object.MozOpacity = (opacity / 100);
		object.KhtmlOpacity = (opacity / 100);
		object.filter = "alpha(opacity=" + opacity + ")";
	}



	function shiftOpacity(id, millisec) {
		if(document.getElementById(id).style.opacity == 0) {
			opacity(id, 0, 100, millisec);
		} else {
			opacity(id, 100, 0, millisec);
		}
	}



	function blendimage(divid, imageid, imagefile, millisec, alt, total, workn, linkn) {
		var speed = Math.round(millisec / 100);
		var timer = 0;
		document.getElementById(divid).style.backgroundImage = "url(" + document.getElementById(imageid).src + ")";
		document.getElementById(divid).style.backgroundRepeat = "no-repeat";		
		changeOpac(0, imageid);
		document.getElementById(imageid).src = imagefile;
		for(i = 0; i <= 100; i++) {
			setTimeout("changeOpac(" + i + ",'" + imageid + "')",(timer * speed));
			timer++;
		}
		substr = imageid.substring(10,11);
		for (i=1; i<=total; i++) {
			link = "workLink" + workn + i;
			document.getElementById(link).className = "";
		}
		document.getElementById("workLink"+workn+linkn).className = "current";
	}
	
	

	function currentOpac(id, opacEnd, millisec) {
		var currentOpac = 100;
		if(document.getElementById(id).style.opacity < 100) {
			currentOpac = document.getElementById(id).style.opacity * 100;
		}
		opacity(id, currentOpac, opacEnd, millisec)
	}


