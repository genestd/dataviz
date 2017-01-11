import React from 'react'

class Loading extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      progress: "",
      timer: 0
    }
  }

  componentWillMount(){
    let timerId = setInterval( ()=>{
      let dots = this.state.progress
      dots === "..." ? dots="" : dots = dots + "."
      this.setState({
        progress: dots,
        timer: timerId
      })
    }, 250)
  }

  componentWillUnmount(){
    clearInterval( this.state.timer )
  }
  render(){
    return (
      <div>
        <h1 className='title'>Retrieving Data{this.state.progress} </h1>
      </div>
    )
  }
}

export default Loading
