let app = angular.module('TwikipediaClient')

app.controller('CreateDialogCtrl', CreateDialogCtrl)
app.controller('ModalInstanceCtrl', ModalInstanceCtrl)
app.controller('AdModal', AdModal)

function CreateDialogCtrl($scope, $uibModal, $document, $location) {
  let vm = this

  vm.open = function () {
    let modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '../../app/client/create-post/modal-menu.html',
      backdrop: true,
      controller: 'AdModal',
      controllerAs: '$ctrl'
    })
  }
}

function AdModal($window, $location, $scope, $uibModal, $uibModalInstance, $http, SearchUserService, ActionService) {
  let vm = this;
  vm.openAds = function () {
    $uibModalInstance.close();
    $location.path("/create-ads");

  }
  vm.openOrganic = function () {
    $uibModalInstance.close();
    let modalInstance = $uibModal.open({
      animation: true,
      templateUrl: '../../app/client/create-post/create-post.html',
      backdrop: true,
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl'
    })

  }
  vm.cancel = function (result) {
    $uibModalInstance.dismiss('cancel')
  }
}

function gcd_two_numbers(x, y) {
  if ((typeof x !== 'number') || (typeof y !== 'number'))
    return false;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}

function wordInString(s, word) {
  return new RegExp('\\b' + word + '\\b', 'i').test(s);
}

function ModalInstanceCtrl($window, $scope, $uibModal, $uibModalInstance, $http, SearchUserService, ActionService, PostBlastService) {
  let vm = this;

  vm.post = {
    postText: '',
    time: '',
    blast: true,
    scheduled: false,
    category: '',
    postImages: [],
    postScore: {
      text: {
        value: 0.0,
        summary: ''
      },
      image: {
        value: null,
        summary: ''
      }
    }
  }

  $scope.file_temp = null

  $scope.$watch('file_temp', function (item) {
    if (item) {
      value = {
        name: item.name,
        size: item.size,
        blob: URL.createObjectURL(item),
        file: item
      }

      vm.post.postImages.pop()
      vm.post.postImages.push(value)

      console.log(vm.post.postImages);
      formData = new FormData()
      formData.append('image', item)
      $http({
        url: location.origin + '/api/v1/photo',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      }).then(function (response) {
        var datas = response.data.body;
        var score = 0;
        var i = 0;
        let count = 0.0;

        // Color Scoring
        var dominantColorScore = 0;
        if ((datas.color.dominantColorBackground === "White")) {
          dominantColorScore = 100;
        }
        console.log("COLOR SCORE " + dominantColorScore);

        // Image type scoring
        var imageTypeScore = 0;
        if (datas.metadata.format === "Jpeg" || datas.metadata.format === "Jpg") {
          imageTypeScore = 100;
        }
        console.log("IMAGE TYPE SCORE " + imageTypeScore);

        // Image dimension scoring
        var imageDimensionScore = 0;
        var height = datas.metadata.height;
        var width = datas.metadata.width;
        var gcd = gcd_two_numbers(height, width);
        var ratioHeight = height / gcd;
        var ratioWidth = width / gcd;
        if (ratioWidth == 2 && ratioHeight == 1) {
          imageDimensionScore = 100;
        }
        console.log("IMAGE DIMENSION SCORE " + imageDimensionScore);

        // Keywords scoring
        var tweet = vm.post.postText;
        var category = "";
        data = {
          text: tweet
        };
        $http.post(location.origin + '/api/v1/translate', data).then(function (response) {
          data = response.data.body;
          var translatedText = vm.post.postText;
          data[0].translations.forEach(function (text) {
            console.log("TRANSLATE " + text.text);
            translatedText = text.text;
          });
          console.log("TRANSLATE " + JSON.stringify(translatedText));

          data = {
            text: translatedText
          };
          $http.post(location.origin + '/api/v1/azure/classification', data).then(function (response) {
            var keywordsScore = 0;
            data = response.data.data;
            category = data.label;
            var dict = [];
            if (category === "Travel") {
              dict = ["travel", "travelling", "luggage", "sea", "sunset"];
            } else if (category === "Sports") {
              dict = ["sport", "football", "jogging", "running"];
            } else if (category === "Fashion") {
              dict = ["fashion", "beautiful", "dress", "shirt", "jacket", "pants", "t-shirt"];
            } else if (category === "Foods") {
              dict = ["food", "delicious", "diet", "culinary", "restaurant"];
            }

            for (i = 0; i < datas.description.tags.length; i++) {
              console.log("TAG " + datas.description.tags[i]);
              if (dict.includes(datas.description.tags[i])) {
                keywordsScore = 100;
                break;
              }
            }
            console.log("KEYWORD SCORE " + keywordsScore);

            let result = {
              value: 0.0,
              summary: ''
            };

            var finalScore = (dominantColorScore * 0.2) + (imageTypeScore * 0.2) + (imageDimensionScore * 0.2) + (keywordsScore * 0.4);
            result.value = finalScore;
            if (finalScore >= 80) {
              result.summary = 'Very Good Image';
            } else if ((finalScore < 80) && (finalScore >= 60)) {
              result.summary = 'Good Image';
            } else if ((finalScore < 60) && (finalScore >= 40)) {
              result.summary = 'Fair Image';
            } else {
              result.summary = 'Poor Image';
            }

            vm.post.postScore.image = result;
          }).catch(function (response) {
            // Error Callback
            let result = {
              value: 0.0,
              summary: ''
            };
            result.value = 0;
            result.summary = 'Poor Image';
            vm.post.postScore.image = result;
            console.log(response);
          });
        }).catch(function (response) {
          // Error Callback
          let result = {
            value: 0.0,
            summary: ''
          };
          result.value = 0;
          result.summary = 'Poor Image';
          vm.post.postScore.image = result;
          console.log(response);
        });

        // if (datas.categories) {
        //   if (datas.length > 0) {
        //     data.forEach(function (pics) {
        //       score = score + datas.categories[0].score;
        //       i++;
        //     });
        //   } else {
        //     score = datas.categories[0].score;
        //     i++;
        //   }

        //   var final = score / i;
        //   count = (final * 100).toFixed(1);
        // }

        // console.log(vm.post.postScore);
      }).catch(function (response) {
        // Error Callback
        let result = {
          value: 0.0,
          summary: ''
        };
        result.value = 0;
        result.summary = 'Poor Image';
        vm.post.postScore.image = result;
        console.log(response);
      });
    }
  })
  // $scope.$watch('file_temp', function(item) {
  //   if (item) {
  //     console.log(item.length);
  //     console.log(item);
  //     let value;
  //     if (item.length > 1) {
  //       Object.keys(item).forEach(function(i) {
  //         value = {
  //           name: item[i].name,
  //           size: item[i].size,
  //           blob: URL.createObjectURL(item[i])
  //         }
  //
  //         vm.post.postImages.push(value)
  //       })
  //     } else {
  //       console.log('The File is not array');
  //       value = {
  //         name: item.name,
  //         size: item.size,
  //         blob: URL.createObjectURL(item)
  //       }
  //
  //       vm.post.postImages.push(value)
  //     }
  //     console.log(vm.post.postImages);
  //   }
  // })

  vm.bestTime = [];
  vm.bestOftheBestTime = "";
  vm.listPost = [];

  $http.get(location.origin + '/api/audience-schedule')
    .then(setBestTime)

  vm.profileInfo = {
    profilePicture: localStorage.getItem('picture'),
    profileId: localStorage.getItem('username')
  }

  $scope.postScore = function (post) {
    // console.log(post);
    data = {
      text: post
    }
    $http.post(location.origin + '/api/v1/text', data).then(function (response) {
      data = response.data.body;
      console.log(data);

      // Sentiment scoring
      var sentimentScore = 0;
      sentimentScore = (data.documents[0].score * 100).toFixed(1);
      console.log("SENTIMENT SCORE " + sentimentScore);

      // Typo scoring
      var typoScore = 100;
      data = {
        text: post
      };
      $http.post(location.origin + '/api/v1/typo', data).then(function (response) {
        data = response.data.body;
        var typoCount = data.count;
        typoScore = typoScore - (typoCount * 10);
        if (typoScore < 0)
          typoScore = 0;
        console.log("TYPO SCORE " + typoScore);

        // Promotional phrase scoring
        var promotionalPhraseScore = 0;
        var dict = ["find out", "see why", "start now", "guaranteed", "your money back", "unsubscribe at any time", "no obligation", "no purchase necessary", "cancel at any time", "premium", "discount", "first month free", "results", "growth", "effective", "start now", "ends soon", "real results", "download now", "act now", "special", "discover", "you deserve", "earned", "improve your", "custom", "secure", "efficient", "quality", "safe", "new", "affordable", "best"];
        for (i = 0; i < dict.length; i++) {
          if (wordInString(post, dict[i])) {
            promotionalPhraseScore = 100;
            break;
          }
        }
        console.log("PROMOTIONAL PHRASE SCORE " + promotionalPhraseScore);

        let result = {
          value: 0.0,
          summary: ''
        };

        var finalScore = (sentimentScore * 0.25) + (typoScore * 0.25) + (promotionalPhraseScore * 0.5);
        result.value = finalScore;
        if (finalScore >= 80) {
          result.summary = 'Very Good Post';
        } else if ((finalScore < 80) && (finalScore >= 60)) {
          result.summary = 'Good Post';
        } else if ((finalScore < 60) && (finalScore >= 40)) {
          result.summary = 'Fair Post';
        } else {
          result.summary = 'Poor Post';
        }

        vm.post.postScore.text.value = result.value;
        vm.post.postScore.text.summary = result.summary;
      }).catch(function (response) {
        // Error Callback
        vm.post.postScore.text.value = 0;
        vm.post.postScore.text.summary = 'Poor Post';
        console.log(response);
      });
    }).catch(function (response) {
      // Error Callback
      vm.post.postScore.text.value = 0;
      vm.post.postScore.text.summary = 'Poor Post';
      console.log(response);
    });
  }

  let length = 140
  vm.length = length
  vm.callLength = function (post) {
    if (post == undefined) {
      vm.length = length
    } else {
      vm.length = length - post.length
    }

  }

  vm.setScheduledOff = function () {
    vm.post.scheduled = false;
  }
  vm.addFormatMention = function () {
    dummy = document.querySelector('textarea[ng-model="$ctrl.post.postText"]')
    dummy.value += '${mention}'
    // console.log(dummy.value);
    vm.callLength(dummy.value)
  }
  vm.sendPost = function (data) {
    console.log(data);
    var date = new Date(document.querySelector('#date-schedule').value);
    var fd = new FormData();
    fd.append('date', date);
    // fd.append('image', data.postImages[0].item);
    fd.append('image', $scope.file_temp);
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
    $http.post(urlImage, fd, config).success(function (response) {
      $uibModalInstance.close()
      ActionService.Succesed('Success send post');
    }).error(function (response) {
      $uibModalInstance.close()
      ActionService.Failed(response.message);
    });
  }
  // See Tweet
  vm.seePost = function () {
    let post = '${mention} ' + $('textarea[ng-model="$ctrl.post.postText"]').val()
    if (vm.followers === undefined) {
      ActionService.Failed('Select Category First')
    } else if (vm.followers.length === 0) {
      ActionService.Failed('User not found')
    } else {
      vm.listPost = []
      vm.followers.map(function (user) {
        vm.listPost.push({
          to: '@' + user.userDetail.screenName,
          tweet: post.replace(/\${mention}/g, '@' + user.userDetail.screenName),
          id: user.userDetail.userId,
          image: user.userDetail.image
        })
      })

      window.listPost = vm.listPost
    }
  }

  vm.blasPost = function (listPost) {
    // PostBlastService.blastTweet(listPost)
    //   .success(function(response) {
    //     ActionService.Succesed(response.message);
    //     // document.getElementById('twit').innerHTML = '';
    //     vm.listPost = [];
    //   });
    // console.log('Input : '+listPost);
    // console.log('Data : '+vm.listPost);
  }

  vm.sendAds = function (data) {
    console.log("klik klik");
    $uibModalInstance.close();
    ActionService.Succesed('Success Send Twitter Ads');
  }

  vm.ok = function (result) {
    $uibModalInstance.close()
  }
  vm.cancel = function (result) {
    $uibModalInstance.dismiss('cancel')
  }


  // GET CATEGORY
  SearchUserService.getAllCategory()
    .then(getCategory);

  function getCategory(response) {
    vm.categories = response.data.data;
  }

  // GET ALL FOLLOWERS BY CATEGORY
  vm.getFollowerCategory = getFollowerCategory;

  function getFollowerCategory() {
    vm.selectedCategory = document.querySelector('#selectedCategory').value;
    // console.log(vm.selectedCategory);
    console.log("BEST TIME " + vm.bestTime);
    vm.bestTime.map(e => {
      console.log(vm.selectedCategory);
      if (e.cluster_name === 'Persona ' + vm.selectedCategory) {
        vm.bestOftheBestTime = e.active_time;
        console.log("BEST TIME " + vm.bestOftheBestTime);
        vm.post.time = e.active_time;
      }
    })

    PostBlastService.getUserFollowersByCategory(vm.selectedCategory)
      .then(getUserCategory);
  }

  function getUserCategory(response) {
    // console.log(response);
    if (vm.listPost !== undefined) {
      vm.listPost.splice(0, vm.listPost.length);
    }
    vm.followers = response.data.followers;

    vm.seePost()
  }


  function setBestTime(response) {
    data = response.data.results

    vm.bestTime = data
    console.log("BTP " + data);
    // var bestTime = [];
    // for (prop in data) {
    //   bestTime.push(data[prop]);
    // }

    // let temp = {
    //   time: '',
    //   best: ''
    // }
    // temp.time = parseDataTime(data)
    // temp.best = findBestTime(temp.time, data)

    // // console.log(temp);
    // vm.bestTime = temp.best
    // // vm.post.time = temp.best
  }

  // function parseDataTime(rawDataTime) {
  //   var bestTime = []
  //   for (prop in rawDataTime) {
  //     bestTime.push(rawDataTime[prop]);
  //   }
  //   return bestTime
  // }

  // function findBestTime(data, rawDataTime) {
  //   var suggestTime = Math.max.apply(null, data);
  //   let best
  //   for (prop in rawDataTime) {
  //     if (rawDataTime[prop] === suggestTime) {
  //       if (prop === 't0to3') {
  //         best = '02:00';
  //       }
  //       if (prop === 't3to6') {
  //         best = '05:00';
  //       }
  //       if (prop === 't6to9') {
  //         best = '08:00';
  //       }
  //       if (prop === 't9to12') {
  //         best = '10:00';
  //       }
  //       if (prop === 't12to15') {
  //         best = '14:00';
  //       }
  //       if (prop === 't15to18') {
  //         best = '15:00';
  //       }
  //       if (prop === 't18to21') {
  //         best = '19:00';
  //       }
  //       if (prop === 't21to24') {
  //         best = '21:00';
  //       }
  //     }
  //   }
  //   return best
  // }
}