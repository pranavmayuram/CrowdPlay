angular.module('starter.controllers', [])

.controller('SearchCtrl', function ($scope, $http, $window, $ionicPopup) {

	$scope.noresults = true;
	$scope.noresults2 = false;
	$scope.loading = false;

    $scope.searchSongs = function(someString) {
		if (someString.length === 0) {
			$scope.noresults = true;
			$scope.loading = false;
			return;
		}
		$scope.noresults2 = false;
		$scope.loading = true;
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
		  $scope.loading = false;
          $scope.songs = tracks;
		  console.log("tracks.length: "+tracks.length);
		  if (tracks.length > 0) {
			  $scope.noresults = false;
		  }
		  else {
			  $scope.noresults2 = true;
		  }
        });
	};

    $scope.getAllSongs = function() {
        console.log('localStorage: ');
        console.log($window.localStorage);
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
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
        var uploadObj = {
        	playlistChannel: $window.localStorage.playlistChannel,
        	songID: someObject.id,
        	genre: someObject.genre,
        	image: someObject.artwork_url,
        	songName: someObject.title,
        	songLength: someObject.duration
        };
        $http({method: "POST", url: "http://localhost:3000/api/addSong", data: uploadObj})
        	.success(function(result) {
        		console.log(result);
				if (result.songExists) {
					var existsPopup = $ionicPopup.alert({
				      title: 'Song already added',
				      template: 'This song has already been added, vote for it to have it play quicker!'
				    });
					existsPopup.then(function(result) {
				      $scope.upvote(uploadObj.songID);
				    });
					return;
				}
			    var alertPopup = $ionicPopup.alert({
			      title: 'Song successfully posted!',
			      template: 'Your song has successfully been posted, get your friends to vote for it to hear it sooner!'
			    });
				$window.localStorage[uploadObj.songID] = true;
        	})
        	.error(function(result) {
        		console.log(result);
        	});
    };
})

.controller('VotingCtrl', function ($scope, $http, $state, $window, $interval, $timeout) {

    $scope.getAllSongs = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
                console.log(result);
                var tempArray = [];
                for (i=0; i <result.length; i++) {
                    if (!result[i].artwork_url) {
                        result[i].artwork_url="http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
                    tempArray.push(result[i].CrowdPlay);
                }
                $scope.songs = tempArray;
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });
        $interval(function() {
            $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
                console.log(result);
                var tempArray = [];
                for (i=0; i <result.length; i++) {
                    if (!result[i].artwork_url) {
                        result[i].artwork_url="http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
                    tempArray.push(result[i].CrowdPlay);
                }
                $scope.songs = tempArray;
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });}
            , 3000);

    };

    $scope.upvote = function(someID) {
		console.log(someID + ': ' + $window.localStorage[someID + "_" + $window.localStorage.playlistChannel]);
		if ($window.localStorage[someID + "_" + $window.localStorage.playlistChannel] == null) {
			$window.localStorage[someID + "_" + $window.localStorage.playlistChannel] = true;
		}
		else {
			return;
		}
        $http({method: "POST", url: "http://localhost:3000/api/upvote", data: {'songID': someID, 'playlistChannel': $window.localStorage.playlistChannel}})
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
            })
            .error(function(result) {
                console.log(result);
            });
    };

    $scope.downvote = function(someID) {
		console.log(someID + ': ' + $window.localStorage[someID + "_" + $window.localStorage.playlistChannel]);
		if ($window.localStorage[someID + "_" + $window.localStorage.playlistChannel] == null) {
			$window.localStorage[someID + "_" + $window.localStorage.playlistChannel] = false;
		}
		else {
			return;
		}
        $http({method: "POST", url: "http://localhost:3000/api/downvote", data: {'songID': someID, 'playlistChannel': $window.localStorage.playlistChannel}})
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

.controller('LoginCtrl', function($scope, $stateParams, $state, $http, $window, $ionicPopup) {
    $scope.loginCheck = function() {
		if ($window.localStorage.playlistChannel && $window.localStorage["admin_"+$window.localStorage.playlistChannel]) {
        	if ($window.localStorage["admin_"+$window.localStorage.playlistChannel] == false) {
				$state.go('tab.search');
			}
			else {
				$state.go('tab.voting');
			}
		}
    };

    $scope.joinChannel = function(someString) {
        $http({method: "POST", url: "http://localhost:3000/api/joinChannel", data: {'playlistChannel': someString}})
            .success(function(result) {
                console.log(result);
                if (result.channelDNE) {
                    var alertPopup = $ionicPopup.alert({
                    title: 'Channel Does Not Exist',
                    template: result.channelDNE
                  });
                }
                else {
                    $window.localStorage.playlistChannel = result.playlistChannel;
                    $window.localStorage["admin_" + $window.localStorage.playlistChannel] = false;
                    console.log($window.localStorage);
                    $state.go('tab.voting');
                }
            })
            .error(function(result) {
                console.log(error);
            });
    };

    $scope.createChannel = function(someString) {
        $http({method: "POST", url: "http://localhost:3000/api/createChannel", data: {'playlistChannel': someString}})
            .success(function(result) {
                console.log(result);
                if (result.channelExists) {
                    var alertPopup = $ionicPopup.alert({
                    title: 'Channel Already Exists',
                    template: result.channelExists
                  });
                }
                else {
                    $window.localStorage.playlistChannel = result.playlistChannel;
                    $window.localStorage["admin_" + $window.localStorage.playlistChannel] = true;
                    console.log($window.localStorage);
                    $state.go('tab.search');
                }
            })
            .error(function(result) {
                console.log(error);
            });
    };
})

.controller('chInfoCtrl', function($scope, $http, $state, $window, $stateParams, $interval) {

    $scope.getStats = function() {
        $http({method: "GET", url: "http://localhost:3000/api/statistics", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
                $scope.playlistChannel = $window.localStorage.playlistChannel;
                $scope.numJoins = result.numJoins;
                $scope.songCount = result.songCount;
                console.log(result);
            })
            .error(function(result) {
                console.log(result);
            });
    };

	$scope.logOut = function() {
		$window.localStorage.removeItem('playlistChannel');
		$state.go('login');
	};
})

.controller('NowPlayingCtrl', function($scope, $http, $state, $window, $stateParams, $interval) {

	// GENERAL

	$scope.settings = {
		enableFriends: true
	};

	$scope.admin = $window.localStorage["admin_" + $window.localStorage.playlistChannel];
	console.log('localStorage' + $window.localStorage["admin_" + $window.localStorage.playlistChannel]);

	$scope.adminDecide = function() {
		console.log("in adminDecide");
		if ($scope.admin == "true") {
			console.log("isAdmin");
			$scope.getAllSongsManip();
		}
		else {
			console.log("isNotAdmin");
			$scope.getNowPlaying();
		}
	}

	// NON-ADMIN STUFF

	// function for non-admins to receive the currently playing song (derived from admin)
	$scope.getNowPlaying = function() {
		$http({method: "GET", url: "http://localhost:3000/api/getNowPlaying", params: {'playlistChannel': $window.localStorage.playlistChannel}})
			.success(function(result) {
				$scope.noContent = null;
				if (result.noContent) {
					$scope.noContent = result.noContent;
                    console.log("IN NO CONTENT");
                    console.log(result.noContent);
                    return;
				}
				console.log(result);
				if (!result[0].CrowdPlay.image) {
					result[0].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
				}
				$scope.nowPlaying = result[0].CrowdPlay;
				$scope.nowPlaying.finalMinutes = Math.floor($scope.nowPlaying.songLength / 60);
				$scope.nowPlaying.finalSeconds = $scope.nowPlaying.songLength % 60;
				$scope.nowPlaying.minutes = Math.floor($scope.nowPlaying.progress / 60);
				$scope.nowPlaying.seconds = $scope.nowPlaying.progress % 60;
			})
			.error(function(result) {
				console.log('ERROR: ');
				console.log(error);
			});

		// continually update nowPlaying
		$interval(function() {
			$http({method: "GET", url: "http://localhost:3000/api/getNowPlaying", params: {'playlistChannel': $window.localStorage.playlistChannel}})
				.success(function(result) {
					$scope.noContent = null;
					if (result.noContent) {
						$scope.noContent = result.noContent;
                        console.log("IN NO CONTENT");
                        console.log(result.noContent);
                        return;
					}
					console.log(result);
					if (!result[0].CrowdPlay.image) {
						result[0].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
					}
					$scope.nowPlaying = result[0].CrowdPlay;
					$scope.nowPlaying.minutes = Math.floor($scope.nowPlaying.progress / 60);
					$scope.nowPlaying.seconds = $scope.nowPlaying.progress % 60;
				})
				.error(function(result) {
					console.log('ERROR: ');
					console.log(error);
				});}
			, 1000);
	};

	// ADMIN STUFF

	// function for admin to getAllSongs and play first one, while updating remaining queue
    $scope.getAllSongsManip = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
				$scope.noContent = null;
				if (result.noContent) {
					$scope.noContent = result.noContent;
                    console.log("IN NO CONTENT");
                    console.log(result.noContent);
                    return;
				}
                console.log(result);
                var tempArray = [];
                for (i=0; i<result.length; i++) {
                    if (!result[i].CrowdPlay.image) {
                        result[i].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
					tempArray.push(result[i].CrowdPlay);
                }
				$scope.nowPlaying = tempArray[0];
                var endLength = tempArray.length + 1;
				$scope.queue = tempArray.slice(1, endLength);
                console.log('queue');
                console.log($scope.queue);
                $scope.nowPlayingChange($scope.nowPlaying.songID, null);
                $scope.play($scope.nowPlaying);
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });

			// continually update queue for all new songs that are voted on
			$interval(function() {
	            $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
	            .success(function(result) {
					$scope.noContent = null;
					if (result.noContent) {
						$scope.noContent = result.noContent;
                        console.log("IN NO CONTENT");
                        console.log(result.noContent);
                        return;
					}
					console.log(result);
	                var tempArray = [];
	                for (i=0; i<result.length; i++) {
	                    if (!result[i].CrowdPlay.image) {
	                        result[i].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
	                    }
						tempArray.push(result[i].CrowdPlay);
	                }
					$scope.queue = tempArray;
	                console.log('queue');
	                console.log($scope.queue);
	            })
	            .error(function(result) {
	                console.log('ERROR: ');
	                console.log(error);
	            });}
	            , 3000);

    };

    $scope.next = function(){
		$scope.stopCounter();
        $scope.soundObj.pause('mySound');
		var oldSong = $scope.nowPlaying;
        $scope.nowPlaying = $scope.queue[0];
        var queue = {};
        queue = $scope.queue;
        var endLength = queue.length + 1;
        $scope.queue = queue.slice(1, endLength);
        $scope.nowPlayingChange($scope.nowPlaying.songID, oldSong.songID);
        $scope.play($scope.nowPlaying);
    };

    $scope.play = function(someObject){
        SC.initialize({
            client_id: 'f3b6636c2e427ba511f65603ba7448b7'
        });
        console.log(someObject);
        SC.stream("https://api.soundcloud.com/tracks/" + someObject.songID, function (sound) {
            // Save sound, it holds all the data needed to stop, resume, etc.
            $scope.soundObj = sound;
            $scope.paused = false;
            console.log($scope.soundObj);
            console.log($scope.paused);
            $scope.resetCounter();
            $scope.runCounter(someObject);
            sound.play('mySound', {
                onfinish: function() {
                    $scope.next();
                }
            });
        });
    };

    $scope.runCounter = function(someObject) {
        $scope.stop = $interval(function() {
            $scope.counter++;
            console.log($scope.counter);
            if ($scope.counter >= someObject.songLength/1000) {
                $scope.stopCounter();
                $scope.next();
            }
        }, 1000);
    };

    $scope.stopCounter = function() {
        $interval.cancel($scope.stop);
    };

    $scope.resetCounter = function() {
        $scope.counter = 0;
    };

    $scope.pauseOrResume = function(someString){
        var soundLocal = {};
        if (someString === 'pause') {
            $scope.soundObj.pause('mySound');
            $scope.stopCounter();
        }
        else if (someString === 'resume') {
            console.log($scope.soundObj);
            $scope.soundObj.play('mySound');
            $scope.runCounter($scope.nowPlaying);
        }
    }

    $scope.changePauseVar = function(someBool) {
        $scope.paused = someBool;
        console.log($scope.paused);
    };

    $scope.nowPlayingChange = function(songID, oldID) {
		if ($scope.nowPlayingUpdater) {
			$interval.cancel($scope.nowPlayingUpdater);
		}
        $http({method: "POST", url: "http://localhost:3000/api/nowPlayingChange", data: {'playlistChannel': $window.localStorage.playlistChannel, 'songID': songID, 'oldID': oldID}})
            .success(function(result) {
                console.log(result);
            })
            .error(function(result) {
                console.log(result)
            });
		$scope.nowPlayingUpdater = $interval(function() {
			$http({method: "POST", url: "http://localhost:3000/api/updateNowPlaying", data: {'playlistChannel': $window.localStorage.playlistChannel, 'songID': songID, 'progress': $scope.counter, 'paused': $scope.paused}})
            .success(function(result) {
                console.log(result);
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });}
            , 1000);
    };
});
