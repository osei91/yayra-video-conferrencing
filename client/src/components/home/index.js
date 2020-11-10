import React, { Component } from "react";
import { Link } from "react-router-dom";
import { v1 as uuid } from "uuid";
import io from "socket.io-client";
const socket = io.connect(process.env.REACT_APP_API_URL);

class Home extends Component {
  constructor() {
    super();
    this.state = {
      roomId: uuid(),
      meetingURL: "",
      actions: { initiate: false, join: true },
      initiatorName:"",
      meetingName:"",
      basicAuth: false
    };
  }
componentDidMount=()=>{
  socket.on('setup meeting', bool=>{

   if(bool === true){
     this.props.history.push('/meeting/'+this.state.roomId)
    }
  });

}
  //process from input
  joinMeeting = (e) => {
    e.preventDefault();
    const { meetingURL,roomId } = this.state;
   
    if (meetingURL !== "") {
      this.props.history.push(meetingURL);
      //checkig if meeting exists
      socket.emit('joining room', {meetingURL, roomId});
    }
  };

  createMeeting=(e)=>{
    e.preventDefault();
    const {meetingName, initiatorName,roomId}=this.state;
    if(meetingName !== "" && initiatorName !== ""){
      //this.props.history.push("/meeting/"+meetingName);
      socket.emit("create meeting", {meetingName, roomId,initiatorName},function(){
        console.log('callack retured')
      });
    }
  }
  
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  beginMeetSetup = () => {
    this.setState({ actions: { initiate: true } });
  };

  render() {
    const { actions ,basicAuth} = this.state;
    return (
      <React.Fragment>
       
        
      <div className="homeContainer">
        <div className="hmLinkWrap">
          <section className="formWrap">
            <div className="grphBox">
              <svg></svg>
            </div>
            <div className="meetnFormBox">
              <div>
            
                  <Link
                    to={`#`}
                    className="hmBtns"
                    onClick={this.beginMeetSetup}
                  >
                    Start a Meeting
                  </Link>
               
              </div>

              <form
                className="formForMeetn"
                autoComplete="off"
              >
                {actions.initiate === true ? (
                  <div className="">
                    <input
                      type="text"
                      className="inpCode"
                      name="initiatorName"
                      onChange={this.handleChange}
                      placeholder="Your name"
                    />
                    <input
                      type="text"
                      className="inpCode"
                      name="meetingName"
                      onChange={this.handleChange}
                      placeholder="Enter meeting name"
                    />
                    <input
                      className="subBtn"
                      type="submit"
                      tabIndex={1}
                      value="GET STARTED"
                      onClick={this.createMeeting}
                    />
                  </div>
                ) : null}
                {actions.join === true ? (
                  <div>
                    <input
                      type="text"
                      className="inpCode"
                      name="meetingURL"
                      onChange={this.handleChange}
                      placeholder="Enter meeting url"
                    />
                    <input
                      className="subBtn"
                      type="submit"
                      tabIndex={2}
                      value="JOIN MEETING"
                      onClick={this.joinMeeting}
                    />
                  </div>
                ) : null}
              </form>
            </div>
          </section>
        </div>
      </div>
    
      </React.Fragment>
    );
  }
}

export default Home;
