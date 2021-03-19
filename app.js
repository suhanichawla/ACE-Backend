require('dotenv').config();
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
const http = require('http')
const socketio = require('socket.io')
const gameLogic = require('./game-logic')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/api/get-speech-token', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = { 
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
            res.send({ token: tokenResponse.data, region: speechRegion });
        } catch (err) {
            res.status(401).send('There was an error authorizing your speech key.');
        }
    }
});

app.get('/',(req,res)=>{
    res.send("Test route working. Server is deployed")
})

io.on('connection', client => {
    gameLogic.initializeGame(io, client)
})

server.listen(process.env.PORT || 8000,()=>{
    console.log("listening on port 8000")
})