import React, { PureComponent } from 'react'

class ViewTest extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
           
            data:[1,1,1,0,4]
        }
    }
    handleVideoViewCountDisplay=()=>{
        const count = this.state.data.length;
        const peerClass = `peer-${count}`;
     return peerClass;
      }
    render() {
        return (
            <div className="test_i">
                {
                    this.state.data.map((d,i)=>(
                        <div key={i} className={`dist ${this.handleVideoViewCountDisplay()}`}>

                        </div>
                    ))
                }
               
            </div>
        )
    }
}

export default ViewTest