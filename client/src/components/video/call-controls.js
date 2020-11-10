import React, { Component } from "react";
import { EndCallIcon,AudioCall,VideoCall } from "../svg/";
class CallControls extends Component {
  state = {turnVideoOff: false,turnAudioOff:false};
  toggleVid=()=>{
      const {streamTypeVid}=this.props;
      let toggle = this.state.turnVideoOff===false? true: false
      this.setState({turnVideoOff: toggle})
    return streamTypeVid({video:toggle})
  }
  toggleAudio=()=>{
    const {streamTypeAudio}=this.props;
      let toggle = this.state.turnAudioOff===false? true: false
      this.setState({turnAudioOff: toggle})
    return streamTypeAudio({audio:toggle})
  }
  render() {
    return (
      <div className="ctrlsWrapper">
        <ul className="listForbtns">
          <li>
            <button className="ctrlBtn endCallBtn" onClick={this.props.endCall}>
              <EndCallIcon />
            </button>
            <button className="ctrlBtn vidtoggleBtn" onClick={this.toggleVid}>
                {
                    this.state.turnVideoOff === true?
                    <div className="toggleVid"></div>
                    : null
                }
            
              <VideoCall />
              
            </button>
             <button className="ctrlBtn" onClick={this.toggleAudio}>
                <AudioCall/>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default CallControls;
