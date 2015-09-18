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

.controller('ChatsCtrl', function ($scope, Chats, $http, $state, $window, $interval, $timeout) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

    // $scope.getAllSongs = function() {
    //     $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
    //         .success(function(result) {
    //             console.log(result);
    //             var tempArray = [];
    //             for (i=0; i<result.length; i++) {
    //                 if (!result[i].CrowdPlay.image) {
    //                     result[i].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
    //                 }
    //                 tempArray.push(result[i].CrowdPlay);
    //             }
    //             $scope.songs = tempArray;
    //         })
    //         .error(function(result) {
    //             console.log('ERROR: ');
    //             console.log(error);
    //         });
    // };

    $scope.getAllSongs = function() {
        console.log('localStorage: '); 
        console.log($window.localStorage);
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
            , 5000);
        
    };

	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};

    $scope.upvote = function(someID) {
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
                //$window.location.reload(true);
                //$state.go($state.current, {}, {reload: true});
                //$state.reload();
            })
            .error(function(result) {
                console.log(result);
            });
    };

    $scope.downvote = function(someID) {
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

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicPopup) {
	$scope.chat = Chats.get($stateParams.chatId);
})

.controller('login', function($scope, $stateParams, $state, $http, $window, $ionicPopup) {
    $scope.loginCheck = function(someObject) {
        $state.go('tab.chats');
    }

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
                    $window.localStorage.admin = false;
                    console.log($window.localStorage);
                    $state.go('tab.chats');
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
                    $window.localStorage.admin = true;
                    console.log($window.localStorage);
                    $state.go('tab.dash');
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
})

.controller('AccountCtrl', function($scope, $http, $state, $window, $stateParams, $interval) {
	$scope.settings = {
		enableFriends: true
	};

    /*$scope.initialPull = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
                console.log(result);
                for (i=0; i<result.length; i++) {
                    if (!result[i].CrowdPlay.image) {
                        result[i].CrowdPlay.image = "http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png";
                    }
                    tempArray.push(result[i].CrowdPlay);
                }
                $scope.nowPlaying = tempArray[0];
                var endLength = tempArray.length + 1;
                $scope.queue = tempArray.slice(1, endLength);
                $scope.play($scope.nowPlaying);
                $scope.nowPlayingChange($scope.nowPlaying.songID);
            })
            .error(function(result) {
                console.log(error);
            });
    };*/

    $scope.getAllSongsManip = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
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
                $scope.nowPlayingChange($scope.nowPlaying.songID);
                $scope.play($scope.nowPlaying);
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });
    };

    $scope.initializeQueue = function() {
        $http({method: "GET", url: "http://localhost:3000/api/getAllSongs", params: {'playlistChannel': $window.localStorage.playlistChannel}})
            .success(function(result) {
                console.log(result);
            })
            .error(function(result) {
                console.log('ERROR: ');
                console.log(error);
            });
    };

    $scope.next = function(){
        $scope.soundObj.pause('mySound');
        $scope.nowPlaying = $scope.queue[0];
        var queue = {};
        queue = $scope.queue;
        var endLength = queue.length + 1;
        $scope.queue = queue.slice(1, endLength);
        $scope.nowPlayingChange($scope.nowPlaying.songID);
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

    $scope.nowPlayingChange = function(songID) {
        $http({method: "POST", url: "http://localhost:3000/api/nowPlayingChange", data: {'playlistChannel': $window.localStorage.playlistChannel, 'songID': songID}})
            .success(function(result) {
                console.log(result);
            })
            .error(function(result) {
                console.log(result)
            });
    };

    /*$scope.nowPlayingChange = function(songID) {
        $http({method: "POST", url: "http://localhost:3000/api/nowPlayingChange", params: {'playlistChannel': $window.localStorage.playlistChannel, 'songID': songID}})
            .success(function(result) {
                console.log(result);
            })
            .error(function(result) {
                console.log(result);
            });
    }*/
});
