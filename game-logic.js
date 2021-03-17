
var io
var gameSocket
// gamesInSession stores an array of all active socket connections
var gamesInSession = []


const initializeGame = (sio, socket) => {
    /**
     * initializeGame sets up all the socket event listeners. 
     */

    // initialize global variables.
    io = sio 
    gameSocket = socket 

    // pushes this socket to an array which stores all the active sockets.
    gamesInSession.push(gameSocket)

    // Run code when the client disconnects from their socket session. 
    gameSocket.on("disconnect", onDisconnect)

    // Sends new move to the other socket session in the same room. 
    gameSocket.on("new move", newMove)

    // Alerts user in the same room
    gameSocket.on("resign",resignGame)

    // User creates new game room after clicking 'submit' on the frontend
    gameSocket.on("createNewGame", createNewGame)

    // User joins gameRoom after going to a URL with '/game/:gameId' 
    gameSocket.on("playerJoinGame", playerJoinsGame)


}



function playerJoinsGame(idData) {
    /**
     * Joins the given socket to a session with it's gameId
     */

    // A reference to the player's Socket.IO socket object
    var sock = this
    
    // Look up the room ID in the Socket.IO manager object.
    var room = io.sockets.adapter.rooms[idData.gameId]

    // If the room exists...
    if (room === undefined) {
        this.emit('status' , "This game session does not exist." );
        return
    }
    if (room.length <= 2) {
        // attach the socket id to the data object.
        idData.mySocketId = sock.id;

        // Join the room
        sock.join(idData.gameId);

        console.log(room.length)

        if (room.length === 2) {
            io.sockets.in(idData.gameId).emit('start game', idData)
        }

        // Emit an event notifying the clients that the player has joined the room.
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('status' , "There are already 2 people playing in this room." );
    }
}


function createNewGame(gameId) {
    console.log("new game created with id",gameId)
    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    this.emit('createNewGame', {gameId: gameId, mySocketId: this.id});

    // Join the Room and wait for the other player
    this.join(gameId)
}


function newMove(move) {
    /**
     * First, we need to get the room ID in which to send this message. 
     * Next, we actually send this message to everyone except the sender
     * in this room. 
     */
    
    const gameId = move.gameId 
    
    io.to(gameId).emit('opponent move', move);
}

function resignGame(resignInfo){
    io.to(resignInfo.gameId).emit('resign game',resignInfo.playerColor)
}

function onDisconnect() {
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}


exports.initializeGame = initializeGame