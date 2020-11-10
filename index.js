const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const SocketHandler = require("./Socket/index")
const server = require("http").createServer(app)
const io = require("socket.io")(server);

SocketHandler(io)

app.use(cors())
app.use(bodyParser.json())
if (process.env.NODE_ENV === "production") {
    //set static folder
    app.use(express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
  }
const PORT = process.env.PORT || 8000;

server.listen(PORT,()=>{
    console.log(`SERVER LIVE ON PORT ${PORT}`)
})