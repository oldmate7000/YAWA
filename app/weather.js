const React = require('react');
const ReactDOM = require('react-dom');

import './style.css';

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            longitude: 0.0,
            latitude: 0.0,
            day1: new Date()
        }
    }
    render() {
        return (
            <div>
                PENIS
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));