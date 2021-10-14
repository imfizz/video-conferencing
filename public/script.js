const socket = io('/') // root path

const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true // mute lang sarili

const peers = {}

// connect our video, enable lang yung video and audio
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream) // pag may cumonnect sasagutin natin, so mag aappear satin yung new video from user

        // sa pamamagitan neto, lalabas narin sa bagong nagconnect yung mga nakaconnect na user
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    // allow other user to be connected to me
    // ito yung makikinig sa event na user-connected
    socket.on('user-connected', userId => {
        connectedToNewUser(userId, stream) // isesend natin yung video natin sa ibang user para makita nila na oncam tayo
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()  
})


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectedToNewUser(userId, stream){
    const call = myPeer.call(userId, stream) // call a user that we give a certain id
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    // kapag nagleave yung sumali, icoclose yung video nila
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    // pag nagload na yung stream play na yung video
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}