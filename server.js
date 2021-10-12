const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server) // pinasa lang natin sa socket.io para malaman kung anong server ginagamit
const { v4: uuidV4 } = require('uuid')


app.set('view engine', 'ejs')
app.use(express.static('public')) // pasok sa public folder

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

// for specific room
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

// kapag may pumasok
io.on('connection', socket => {
    // ipapasa lang natin yung roomId tsaka userId sa event na join-room
    socket.on('join-room', (roomId, userId) => {
        // pag may bagong pasok
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('disconnect', () => {
            // kapag nagdisconnect like inexit browser o lumipat ng url
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    }) 
})

server.listen(3000)