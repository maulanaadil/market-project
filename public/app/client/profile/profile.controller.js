app = angular.module('TwikipediaClient')

app.controller('ProfileCtrl', ProfileCtrl);
// ProfileCtrl.$inject = ['ProfileService', 'ScheduleService', 'ActionService', '$http'];
Pace.track();


function ProfileCtrl(ProfileService, ScheduleService, ActionService, $http, $window, $scope, $timeout) {
  var vm = this;
  vm.length = 140;
  vm.username = localStorage.getItem('username');
  var length = 140;
  //var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

  vm.profile = JSON.parse(localStorage.getItem('profile'));

  $scope.imageSuggestion = {
    msg: null,
    img: null
  };

  vm.post = {
    postText: null,
    postImage: null,
    category: null,
    postScore: {
      text: {
        value: null,
        summary: null
      },
      image: {
        value: null,
        summary: null
      }
    }
  }

  $scope.tempFile = null;
  $scope.$watch('tempFile', function(newItem) {
    console.log(newItem);
    if (newItem) {
      value = {
        name: newItem.name,
        size: newItem.size,
        blob: URL.createObjectURL(newItem),
        _file: newItem
      }
      vm.post.postImage = value

      formData = new FormData()
      formData.append('image', newItem)
      $http({
          url: location.origin + '/api/v1/photo',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': undefined
          },
          transformRequest: angular.identity
        })
        .then(imageScore)
        .catch(function(response) {
          // Error Callback
          console.log(response);
        })
    }
  })

  function imageScore(response) {
    var datas = response.data.body;
    console.log(datas);
    temp = []
    if (datas.tags.length > 0) {
      console.log('flag--1');
      $.get('/api/v1/post?q=' + datas.tags[0].name, (data, response) => {
        console.log('flag--2');
        var item = data.value;
        var i = 0
        item.map((val) => {
          if (i < 6) {
            temp.push(val.contentUrl)
            i++
          }
        })
        $timeout(function() {
          console.log('flag--3');
          $scope.imageSuggestion.img = temp
          $scope.imageSuggestion.msg = 'Other people upload the picture like these : '
        })
      });
    } else {
      $timeout(function() {
        console.log('flag--3');
        $scope.imageSuggestion.img = 0
        $scope.imageSuggestion.msg = 'Sorry. There are no sample pictures for you.'
      })
    }
    var score = 0;
    var i = 0;
    let count = 0.0;
    if (datas.categories) {
      if (datas.length > 0) {
        response.data.forEach(function(pics) {
          score = score + datas.categories[0].score;
          i++;
        });

      } else {
        score = datas.categories[0].score;
        i++;
      }

      var final = score / i;
      count = (final * 100).toFixed(1);
    }
    // console.log("count : "+count);
    let result = {
      tags: datas.tags,
      score: {
        value: 0.0,
        summary: ''
      }
    }
    result.score.value = count
    if (count >= 80) {
      result.score.summary = 'Very Good Image'
    } else if ((count < 80) && (count >= 60)) {
      result.score.summary = 'Good Image'
    } else if ((count < 60) && (count >= 40)) {
      result.score.summary = 'Fair Image'
    } else {
      result.score.summary = 'Poor Image'
    }
    vm.post.postScore.image = result.score
  }

  $scope.postScore = function(post) {
    // console.log(post);
    data = {
      text: post
    }
    $http.post(location.origin + '/api/v1/text', data).then(function(response) {
      data = response.data.data
      vm.post.postScore.text.value = data.score;
      vm.post.postScore.text.summary = data.note;
    })
  }

  if (localStorage.getItem('profile') === null) {
    //console.log('GET NULL');
    ProfileService.getUserProfile().then(getProfile);
  }

  if (localStorage.getItem('profile') !== null) {
    //console.log('GET NOT NULL');
    ProfileService.getUserProfile().then(getProfile);
  }

  function getProfile(response) {
    if (localStorage.getItem('profile') !== JSON.stringify(response.data.data)) {
      vm.profile = response.data.data;
      vm.profile.profile_image_url_https = vm.profile.profile_image_url_https.replace('_normal', '');
      localStorage.setItem('profile', JSON.stringify(vm.profile));
    }
  }

  vm.calLength = function(tweet) {
    if (tweet === undefined) {
      vm.length = 140;
    } else {
      vm.length = length - tweet.length;
    }

    btn.classList.toggle('disabled', vm.length < 0);
  };

  vm.sendPost = function(data) {
    console.log(data);
    var date = null;
    var fd = new FormData();
    fd.append('date', date);
    fd.append('image', $scope.tempFile);
    if (data.category === "" || data.category === null) {
      fd.append('blast', false);
      fd.append('post', data.postText);
    } else {
      fd.append('post', '${mention} ' + data.postText);
      fd.append('blast', data.blast);
    }
    fd.append('schedule', data.scheduled);
    fd.append('category', data.category);
    var config = {
      headers: {
        'Content-Type': undefined
      }
    }
    var urlImage = location.origin + '/api/create-post';
    $http.post(urlImage, fd, config).success(function(response) {
      // $uibModalInstance.close()
      ActionService.Succesed('Success send post');
    }).error(function(response) {
      // $uibModalInstance.close()
      ActionService.Failed(response.message);
    });
  }

}
