angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $http, $window, $ionicPopup) {
	
    $scope.searchSongs = function(someString) {
		SC.initialize({
			client_id: 'f3b6636c2e427ba511f65603ba7448b7'
		});
        SC.get('/tracks', {q: someString}, function(tracks) {
          console.log(tracks);
          for (i=0; i <tracks.length; i++) {
                if (!tracks[i].artwork_url) {
                    tracks[i].artwork_url="http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                }
            }
          $scope.songs = tracks;
        });
	};

    $scope.getAllSongs = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs"})
            .success(function(result) {
                console.log(result);
                for (i=0; i <result.length; i++) {
                    if (!result[i].artwork_url) {
                        result[i].artwork_url="http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
                }
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });
    };

    $scope.addSong = function(someObject) {
        /*var songObj = {
            playlistChannel: req.body.playlistChannel,
            songID: req.body.songID,
            artist: req.body.artist,
            genre: req.body.genre,
            image: req.body.image,
            songName: req.body.songName,
            type: "song",
            nowPlaying: false,
            voteCount: 1,
            songLength: req.body.songLength,
            songTime: req.body.songTime
        }*/
        var uploadObj = {
        	playlistChannel: window.localStorage['playlistChannel'],
        	songID: someObject.id,
        	genre: someObject.genre,
        	image: someObject.artwork_url,
        	songName: someObject.title,
        	songLength: someObject.duration
        };
        $http({method: "POST", url: "http://localhost:3000/api/addSong", data: uploadObj})
        	.success(function(result) {
        		console.log(result);
			    var alertPopup = $ionicPopup.alert({
			      title: 'Song successfully posted!',
			      template: 'Your song has successfully been posted, get your friends to vote for it to hear it sooner!'
			    });
			    alertPopup.then(function(result) {
			      console.log('Thank you for not eating my delicious ice cream cone');
			    });
        	})
        	.error(function(result) {
        		console.log(result);
        	});
    };
})

.controller('ChatsCtrl', function ($scope, Chats, $http, $state, $window) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

    $scope.getAllSongs = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs"})
            .success(function(result) {
                console.log(result);
                var tempArray = [];
                for (i=0; i<result.length; i++) {
                    if (!result[i].CrowdPlay.image) {
                        result[i].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
                    tempArray.push(result[i].CrowdPlay);
                }
                $scope.songs = tempArray;
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });
    };

	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};

    $scope.upvote = function(someID) {
        $http({method: "POST", url: "http://localhost:3000/api/upvote", data: {'songID': someID}})
            .success(function(result) {
                console.log(result);
                var searchID = $scope.songs;
                for (i=0; i<searchID.length; i++) {
                    if (searchID[i].songID === someID) {
                        $scope.songs[i].voteCount += 1;
                        console.log(searchID[i].songID);
                        console.log($scope.songs[i].voteCount);
                    }
                }
                //$window.location.reload(true);
                //$state.go($state.current, {}, {reload: true});
                //$state.reload();
            })
            .error(function(result) {
                console.log(result);
            });
    };

    $scope.downvote = function(someID) {
        $http({method: "POST", url: "http://localhost:3000/api/downvote", data: {'songID': someID}})
            .success(function(result) {
                console.log(result);
                //$window.location.reload(true);
                var searchID = $scope.songs;
                for (i=0; i<searchID.length; i++) {
                    if (searchID[i].songID === someID) {
                        $scope.songs[i].voteCount -= 1;
                        console.log(searchID[i].songID);
                        console.log($scope.songs[i].voteCount);
                    }
                }
            })
            .error(function(result) {
                console.log(result);
            });
    };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
})

.controller('login', function($scope, $stateParams, $state, $http, $window) {
    $scope.loginCheck = function(someObject) {
        $state.go('tab.dash');
    }

    $scope.joinChannel = function(someString) {
        $state.go('tab.dash');
    }

    $scope.createChannel = function(someString) {
        $state.go('tab.dash');
    }
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		enableFriends: true
	};
});
