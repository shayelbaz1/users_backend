
module.exports = connectSockets

function connectSockets(io) {
    io.on('connection', socket => {
        // Listen to 'chat newMsg' and emit to a specific socket
        socket.on('chat newMsg', msg => {
            // io.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            io.to(socket.myTopic).emit('chat addMsg', msg)
            // io.emit('chat addMsg', msg)
        })

        socket.on('chat joinTopic', topic => {
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic;
        })

        socket.on("typing user", ({ userName, txt }) => {
            io.to(socket.myTopic).emit('show Typing', userName, txt)
        });

        socket.on("party liked", ({ currUser, currParty }) => {
            io.emit('notify liked', { currUser, currParty })
        });

        socket.on("review added", ({ reviews }) => {
            io.emit('notify reviewAdded', { reviews })
        });

        socket.on("party joined", ({ currUser, currParty }) => {
            io.emit('notify joined', { currUser, currParty })
        });
    })
}