module.exports = (io) => {
  const users = {};
  const socketInRoom = {};
  const meetings = [];
//{ meeting_name:x, initiator:y, members:[]}
  io.on("connection", (socket) => {
    console.log(socket.id, "joined");
   socket.on('create meeting', data=>{
    const avail = meetings.findIndex(mt => {
      return mt.roomId === data.roomId
    })
    console.log(data, '---> current rooms',avail);
    if(avail <= -1){
      meetings.push(data);
      socket.emit("setup meeting", true);
      
    } else{
      socket.emit("setup meeting", false);
    }
     //checking is meeting exists or roomID
      
   })
    socket.on("join room", (roomID) => {
      const availMeeting = meetings.filter((m)=>{
        return m.roomId === roomID
      });
      


      if(availMeeting.length >0){
        meetings.filter((ms)=>{
           if(ms.roomId === roomID){
             
           }
        })
      if (users[roomID]) {
        users[roomID].push(socket.id);
      } else {
        users[roomID] = [socket.id];
      }
     // console.log(" join room, ");
      socketInRoom[socket.id] = roomID;
      const userAlreadyInRoom = users[roomID].filter((id) => id !== socket.id);

      socket.emit("all participants", userAlreadyInRoom);
     // console.log(" join room, all participants sent");
    }else{
      socket.emit('meeting session', false)
    }
    });

    socket.on("sending signal", (payload) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,

      });
    });

    socket.on("returning signal", (payload) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

//handle user ending call
socket.on("end call", payload=>{
  

  const roomID = socketInRoom[socket.id];
  let room = users[roomID];
  if (room) {
      room = room.filter(id => id !== socket.id);
      users[roomID] = room;
  }
  
//sending back remaining users in room
socket.broadcast.emit("user disconnected", socket.id);
console.log(room,'dscnct');
})

socket.on("disconnect", ()=>{
  
  //remove from users
  const roomID = socketInRoom[socket.id];
  let room = users[roomID];
  let index = room? room.findIndex(r=>{ return r === socket.id}): null

  //users.length > 0 ?users.splice(index,1):null
  console.log(index,'index in room', users[roomID],"---> users");

})

  });
};
