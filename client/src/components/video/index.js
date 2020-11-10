import React, { Component, useEffect, useRef } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./video.css";
import CallControls from "./call-controls";
import { Copy, MenuIcon } from "../svg/";
const socket = io.connect(process.env.REACT_APP_API_URL);

class VideoCall extends Component {
  constructor(props) {
    super(props);
    this.myVideoRef = React.createRef();
    this.peersRef = React.createRef();
    this.roomIdRef = React.createRef();
    this.sendersRef = React.createRef();
    //to hold stream of peers
    this.userStreamRef = React.createRef();
    this.shareVideoRef = React.createRef();

    this.state = {
      allPeers: [],
      roomID: null,
      videoMode: true,
      audioMode: false,
      meetingSession: true,
      menu: false,
      alerts:[],
    };
  }
  componentDidMount = () => {
    const roomID = this.props.match.params.roomID;
    this.setState({ roomID });
    
    const { videoMode, audioMode,alerts } = this.state;
    socket.on("meeting session", (bool) => {
      if (bool === false) {
          this.setState({ meetingSession: false,audioMode:false,videoMode:false });
         window.location.href ='/';
      }
    });

    navigator.mediaDevices
      .getUserMedia({ video: videoMode, audio: audioMode })
      .then((stream) => {
        this.myVideoRef.current.srcObject = stream;
        //for handling tracks
        this.userStreamRef.current = stream;

        socket.emit("join room", roomID);
        socket.on("all participants", (users) => {
          console.log(stream, " ---> stream");
          //to handle screen sharing
          //1.add my track

          const peers = [];
          this.peersRef.current = [];
          users.forEach((userID) => {
            const peer = this.createPeer(userID, socket.id, stream);
            this.peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push({ peerID: userID, peer });
          });

          this.setState({ allPeers: peers });
        });

        socket.on("user joined", (payload) => {
          console.log(payload, "payload user joined");
          alerts.push(payload);
          const peer = this.addPeer(payload.signal, payload.callerID, stream);
          this.peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          const peerObj = {
            peer,
            peerID: payload.callerID,
          };
          this.setState({ allPeers: [...this.state.allPeers, peerObj] });
          //for screen share

          this.sendersRef.current = [];
        });

        socket.on("receiving returned signal", (payload) => {
          console.log(payload, "receiving returned signal listened for");
          const item = this.peersRef.current.find(
            (p) => p.peerID === payload.id
          );
          console.log(item, " filter item");
          item.peer.signal(payload.signal);
        });

        //handle user disconnected
        socket.on("user disconnected", (id) => {
          console.log(id, "-----------> disconnect");
          //removing disconnected user's stream from list
          const peerObj = this.peersRef.current.find((p) => p.peerID === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = this.peersRef.current.filter((p) => p.peerID !== id);
          this.peersRef.current = peers;
          //setting the state of remaining peers in room
          this.setState({ allPeers: peers });
        });
        
        socket.on("disconnect", () => {
          console.log("disconnect");
        });
      })
      .catch((error) => {
        throw error;
      });
  };
  callUser = (uid) => {};

  shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
      const screenShareTrack = stream.getTracks()[0];
      const myRefInPeers =
        this.peersRef.current.length > 0
          ? this.peersRef.current.filter((p) => p.peerID !== socket.id)
          : null;

      if (myRefInPeers !== null) {
        console.log(myRefInPeers[0], "looking for my track in peersref");
        myRefInPeers[0].peer?.replaceTrack(
          this.userStreamRef.current.getVideoTracks()[0],
          screenShareTrack,
          this.userStreamRef.current
        );
      } else {
      }
      screenShareTrack.onended = function () {
        // this.peersRef.current.find(sender => sender.track.kind === "video").replaceTrack(this.userStream.current.getTracks()[1]);
      };
    });
  };

  createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (signal) => {
      socket.emit("sending signal", { userToSignal, callerID, signal });
    });
    return peer;
  };

  addPeer = (incomingSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerID });
    });
    peer.signal(incomingSignal);
    return peer;
  };
  endCall = () => {
    //disconnect an ongoing call or decline an incoming call
    socket.emit("end call", this.state.roomID);
    //setting video src to null
    this.myVideoRef.current.srcObject = null;
    console.log("disconnect");
    //redirect user
    //this.props.history.push("/")
    window.location.href = "/";
  };
  copyInviteLink = () => {
    //copy room id for sharing
    navigator.clipboard.writeText(`/meeting/${this.state.roomID}`);
  };
  onToggleVideo = (streamMode) => {
    console.log(streamMode);
    if (streamMode.video) {
      this.myVideoRef.current.srcObject.getVideoTracks()[0].stop();
    } else {
      this.streamController(true, this.state.audioMode);
    }
    this.setState({ videoMode: streamMode.video });

    //emit mode of user to others and keep user in meeting by voice call
    socket.emit("audio stream mode");
  };

  onToggleAudio = (streamMode) => {
    if (streamMode.audio) {
      this.myVideoRef.current.srcObject.getTracks()[0].stop();
    } else {
      this.streamController(this.state.videoMode, true);
    }
    this.setState({ audioMode: streamMode.audio });
  };

  streamController = (video, audio) => {
    navigator.mediaDevices
      .getUserMedia({ video, audio })
      .then((stream) => {
        this.myVideoRef.current.srcObject = stream;
      })
      .catch((error) => {
        throw error;
      });
  };
  handleVideoViewCountDisplay = () => {
    const count = this.state.allPeers.length;
    const peerClass = `peer-${count}`;
    return peerClass;
  };
  toggleMenu = () => {
    const { menu } = this.state;
    let toggle = menu === true ? false : true;
    this.setState({ menu: toggle });
  };
  render() {
    console.log(this.peersRef.current, " ping peers ref");
    const { allPeers, meetingSession, menu } = this.state;
    return (
      <React.Fragment>
        {meetingSession !== false ? (
          <div className="container">
            <div className="meetingActionsBox">
              {menu === true ? (
                <div className="meetnHeader">
                  <dl>
                    <dd>Meeting Room</dd>
                    <dd>
                      <span>Created by :</span>
                    </dd>
                    <dd className="invlk8">
                      <input
                        id="roomID"
                        name="roomID"
                        placeholder={this.state.roomID}
                      />
                      <button onClick={this.copyInviteLink}>
                        <Copy />
                      </button>
                    </dd>
                    <dd>
                      <div>
                        {allPeers.length > 0 ? (
                          <button onClick={this.shareScreen}>share</button>
                        ) : null}
                      </div>
                    </dd>
                  </dl>
                </div>
              ) : null}

              <button onClick={this.toggleMenu} className="btnCtrlmenu">
                <MenuIcon />
              </button>
            </div>

            <div className="peersVideo">
              {allPeers.map((user) => (
                <Video peer={user.peer} key={user.peerID} classGroup={`${this.handleVideoViewCountDisplay()}`} />
              ))}
            </div>
            <div className="myVideoContainer">
              <video
                className="myVideo"
                ref={this.myVideoRef}
                playsInline
                autoPlay
                muted
              ></video>
            </div>

            <CallControls
              endCall={this.endCall}
              streamTypeVid={this.onToggleVideo}
              streamTypeAudio={this.onToggleAudio}
            />
            <div className="alertHolder">
                {/* <span id="canAlert" role="button">&times;</span> */}
          
            </div>
           
          </div>
        ) : null}
      </React.Fragment>
    );
  }
}
function Alert(props) {
  const { info, type } = props;
  return (
    <div className="alert">
      <span>{`${info} joined`}</span>
     
    </div>
  );
}
function Video(props) {
  const ref = useRef();
  const { peer, classGroup } = props;
  
  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);
  return (
    <video
      className={`${classGroup}`}
      playsInline
      autoPlay
      ref={ref}
    ></video>
  );
}
export default VideoCall;
