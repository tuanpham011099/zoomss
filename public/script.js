const socket = io('/');
const newPeer = new Peer(undefined, {
    host: "/",
    port: '3001'
});

const videoGrid = document.getElementById("video-contain");

const videoBox = document.createElement("video");

videoBox.muted = true;

const peers = {}


// get permission to access video and audio
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        // stream are the audio and the video



        addVideoStream(videoBox, stream);
        // play "stream" on videoBox element


        newPeer.on("call", call => {
            // answer the call and send the others our stream
            call.answer(stream);


            const newVideo = document.createElement("video");
            call.on("stream", userVideoStream => {
                addVideoStream(newVideo, userVideoStream)
            })
        })


        // after get the stream to played, allow other user to connect to video call
        socket.on("user-connected", userId => {
            newUserConnect(userId, stream);
            // send current stream to other user
        })
    })


socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
    // close video stream after user left
});


newPeer.on('open', id => {
    // id auto create by peerjs
    socket.emit('join-room', ROOM_ID, id);
    // socket will sen room id and user id to server
});

function newUserConnect(userId, stream) {
    const call = newPeer.call(userId, stream);
    // call other user through userId
    // this mean stream will play for all people in room

    const newVideo = document.createElement("video");

    call.on("stream", userVideoStream => {
        // taking stream from other user and play

        addVideoStream(newVideo, userVideoStream);
        // add video of other user to screen
    });

    call.on("close", () => {
        newVideo.remove();
        // delete video element after other disconnect
    })

    // other user send back their stream with an event and we get the event they send

    peers[userId] = call;
    // user link with call


}


function addVideoStream(video, stream) {
    video.srcObject = stream;
    // set the video to play is "stream"
    video.addEventListener('loadedmetadata', (event) => {
        // set event when data loaded the video will play
        video.play();
    });

    videoGrid.append(video);
};