var data = {
  lat : Number(window.localStorage.getItem('lat')),
  long : Number(window.localStorage.getItem('long')),
};
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    fullscreenControl: false,
    zoomControl: false,
    // center: {lat: -6.8875327, lng: 107.6142446}
    center: {lat: data.lat, lng: data.long}
  });
  $.ajax({
      url: "/api/twitter/search/geotes",
      method: "POST",
      data: data
  }).done(function(data) {
      var user = '';
      console.log(data);
      if(data.data.length < 1){
        // loadata();
        // console.log(data.data.length);
      }else{
        var contentString = '<div style="display: flex;flex-direction: row;justify-content: stretch;border-bottom: 1px solid #979797;margin-bottom: 20px;">'+
        '<div style="margin-right: 10px;">'+
          '<img class="img-responsive" src="/images/nearby/ic-nearby-food-twitter-small.png" alt="" style="width:30px">'+
        '</div>'+

        '<div style="display: flex;flex-direction: column;">'+

          '<div style="display: flex; flex-direction: row; justify-content: space-between;">'+
            '<div style="display: flex;flex-direction: column;position: relative;top: 0;bottom: 0; right: 0; left: 0; text-align: left;">'+
              '<span class="profile-name">asd</span>'+
              '<span class="profile-id">@asdas</span>'+
              "</ hr>"+
            '</div>'+
            '<div class="profile-time" style="position:absolute;margin-left:336px">'+
              '<span> <a ng-model="btnSetMention" ng-click="userNearby.setMention(user.screen_name, $index)" data-toggle="modal" data-target=".modal-{{$index}}"><strong>Mention</strong></a></span>'+
            '</div>'+
          '</div>'+

          '<p class="post-desc" style="font-size:12px">Clasified as asdas Category</br> <a style="color:blue">Distance</a> 12 Km</p>'+

        '</div>'+
        '</div>';
        for (var i = 0; i < data.data.length; i++) {
          if(data.data[i].coordinate != null){
            console.log('Longitude : '+data.data[i].coordinate.coordinates[0]+' Latitude : '+data.data[i].coordinate.coordinates[1]);
            var beachMarker = new google.maps.Marker({
              position: {lat: data.data[i].coordinate.coordinates[1], lng: data.data[i].coordinate.coordinates[0]},
              map: map,
              title: data.data[i].user.screen_name,
              icon: data.data[i].classify
            });
            attachSecretMessage(beachMarker, data.data[i].user,data.data[i].classifyText);
          }else{
            console.log('Longitude : '+data.data[i].place.bounding_box.coordinates[0][0][0]+' Latitude : '+data.data[i].place.bounding_box.coordinates[0][0][1]);
            var beachMarker = new google.maps.Marker({
              position: {lat: data.data[i].place.bounding_box.coordinates[0][0][1], lng: data.data[i].place.bounding_box.coordinates[0][0][0]},
              map: map,
              title: data.data[i].user.screen_name,
              icon: data.data[i].classify
            });
            attachSecretMessage(beachMarker, data.data[i].user,data.data[i].classifyText);
          }
        }
        function attachSecretMessage(marker, msg, classify) {
            console.log(msg);
            var infowindow = new google.maps.InfoWindow({
              content: '<div style="display: flex;flex-direction: row;justify-content: stretch;border-bottom: 1px solid #979797;margin-bottom: 20px;">'+
              '<div style="margin-right: 10px;">'+
                '<img class="img-responsive" src="'+msg.profile_image_url+'" alt="" style="width:70px">'+
              '</div>'+

              '<div style="display: flex;flex-direction: column;">'+

                '<div style="display: flex; flex-direction: row; justify-content: space-between;">'+
                  '<div style="display: flex;flex-direction: column;position: relative;top: 0;bottom: 0; right: 0; left: 0; text-align: left;">'+
                    '<span class="profile-name"><b>'+msg.name+'</b></span>'+
                    '<span class="profile-id">@'+msg.screen_name+'</span>'+
                    "</ hr>"+
                  '</div>'+
                  '<div class="profile-time" style="position:absolute;margin-left:336px">'+
                    '<span> <img src="/images/nearby/ic-twitter.png" style="width:10px"></img></span>'+
                  '</div>'+
                '</div>'+

                '<p class="post-desc" style="font-size:12px;line-height:16px;margin-top:8px"><b>Category</b><br>'+classify+'</p>'+

              '</div>'+
              '</div>'
            });

            marker.addListener('click', function() {
              infowindow.open(marker.get('map'), marker);
            });
          }
      }
  });
};

function loadata() {
  $.ajax({
      url: "/api/twitter/search/geotes",
      method: "POST"
  }).done(function(data) {
      if(data.data.length < 3){
        // loadata();
        console.log(data.data.length);
      }else{
        console.log(data);
        for (var i = 0; i < data.data.length - 1; i++) {
          if(data.data[i].coordinate != null){
            console.log('Longitude : '+data.data[i].coordinate.coordinates[0]+' Latitude : '+data.data[i].coordinate.coordinates[1]);
            var beachMarker = new google.maps.Marker({
              position: {lat: data.data[i].coordinate.coordinates[1], lng: data.data[i].coordinate.coordinates[0]},
              map: map,
              icon: image
            });
          }else{
            console.log('Longitude : '+data.data[i].place.bounding_box.coordinates[0][0][0]+' Latitude : '+data.data[i].place.bounding_box.coordinates[0][0][1]);
            var beachMarker = new google.maps.Marker({
              position: {lat: data.data[i].place.bounding_box.coordinates[0][0][1], lng: data.data[i].place.bounding_box.coordinates[0][0][0]},
              map: map,
              icon: image
            });
          }
        }
      }
  });
}
