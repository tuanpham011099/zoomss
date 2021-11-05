const express = require("express");
const { v4: uuidv4 } = require("uuid");


const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`)
});

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});


io.on("connection", socket => {
    socket.on("join-room", (roomId, userId) => {
        // socket listen to 'join-room' event
        socket.join(roomId);
        // connect new user to room with roomid
        socket.broadcast.to(roomId).emit("user-connected", userId);
        // emit an action to the room with roomId without ourself

        socket.on("disconnect", () => {
            socket.broadcast.to(roomId).emit("user-disconnected", userId)
        })
    });
});


server.listen(5000, () => {
    console.log("App is running");
});