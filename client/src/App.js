import React, { Component } from 'react'
import VideoCall from "./components/video/index";
import Home from "./components/home/";
import {BrowserRouter as Router, Route} from "react-router-dom";
import ViewTest from "./components/video/view.test";

class App extends Component {


  render() {
    return (
      <Router>
        <Route path="/" exact component={Home}/>
        <Route path="/view-test" exact component={ViewTest}/>
        <Route path="/meeting/:roomID" exact component={VideoCall}/>
      </Router>
    )
  }
}

export default App


