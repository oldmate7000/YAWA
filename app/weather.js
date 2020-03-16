const React = require('react');
const ReactDOM = require('react-dom');
// const $ = require('jquery')

import $ from 'jquery'
import {Line} from 'react-chartjs-2'
import 'react-leaflet'
// import 'bootstrap'
import './style.css';

function getData(cityName) { //function purely to fetch the data from the server and pack it into 'weatherDataJson'
    return $.getJSON
    // (window.location.origin + "/getweather", '', (json) => {
        ('https://api.openweathermap.org/data/2.5/forecast?q='+cityName+'&appid=2660e938622fb954aa1131b571b41e53', '', (json) => {
            //lat=-33.9240479&lon=151.1880122
            // console.log(json);
            // console.log("API call successful")
    })
}


function parseData(weatherDataJson, tempUnit) { //grabbing the bits of data we actually want from the api call.
    let forecastProps = {}
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    weatherDataJson.list.forEach((value) => {
        let localDay = weekdays[(new Date(value.dt * 1000)).getDay()]
        if (!forecastProps.hasOwnProperty(localDay)) { //ensuring there's an entry for each day covered
            forecastProps[localDay] = {
                localDayDate:       new Date(Date.parse(value.dt_txt)),
                maxTemp:            value.main.temp_max,
                maxTempTime:        value.dt_txt.slice(-8),
                minTemp:            value.main.temp_min,
                minTempTime:        value.dt_txt.slice(-8),
                maxFeelTemp:        value.main.feels_like,
                maxFeelTempTime:    value.dt_txt.slice(-8),
                minFeelTemp:        value.main.feels_like,
                minFeelTempTime:    value.dt_txt.slice(-8),
                maxRH:              value.main.humidity,
                maxRHTime:          value.dt_txt.slice(-8),
                minRH:              value.main.humidity,
                minRHTime:          value.dt_txt.slice(-8),
            }
        } else if (forecastProps.hasOwnProperty(localDay)) { //filling the day in out output object with max's and mins as we find them. 
            if (forecastProps[localDay].maxTemp < value.main.temp_max) {
                forecastProps[localDay].maxTemp = value.main.temp_max;
                forecastProps[localDay].maxTempTime = value.dt_txt.slice(-8);
            }
            if (forecastProps[localDay].minTemp > value.main.min) {
                forecastProps[localDay].minTemp = value.main.min;
                forecastProps[localDay].minTempTime = value.dt_txt.slice(-8);
            }
            if (forecastProps[localDay].maxFeelTemp < value.main.feels_like) {
                forecastProps[localDay].maxFeelTemp = value.main.feels_like;
                forecastProps[localDay].maxFeelTempTime = value.dt_txt.slice(-8); 
            }
            if (forecastProps[localDay].minFeelTemp > value.main.feels_like) {
                forecastProps[localDay].minFeelTemp = value.main.feels_like;
                forecastProps[localDay].minFeelTempTime = value.dt_txt.slice(-8); 
            }
            if (forecastProps[localDay].maxRH < value.main.humidity) {
                forecastProps[localDay].maxRH = value.main.humidity;
                forecastProps[localDay].maxRHTime = value.dt_txt.slice(-8); 
            }
            if (forecastProps[localDay].minRH > value.main.humidity) {
                forecastProps[localDay].minRH = value.main.humidity;
                forecastProps[localDay].minRHTime = value.dt_txt.slice(-8); 
            }
        }
    })
    // console.log(forecastProps)
    if (tempUnit === 'C') {
        let keys = Object.keys(forecastProps)
        keys.forEach((localDay) => {
            forecastProps[localDay].maxTemp = (forecastProps[localDay].maxTemp-273.15).toFixed(2)
            forecastProps[localDay].minTemp = (forecastProps[localDay].minTemp-273.15).toFixed(2)
            forecastProps[localDay].maxFeelTemp = (forecastProps[localDay].maxFeelTemp-273.15).toFixed(2)
            forecastProps[localDay].minFeelTemp = (forecastProps[localDay].minFeelTemp-273.15).toFixed(2)
        })
    } else if (tempUnit === 'F') {
        let keys = Object.keys(forecastProps)
        keys.forEach((localDay) => {
            forecastProps[localDay].maxTemp = ((forecastProps[localDay].maxTemp-273.15) * 9/5 + 32).toFixed(2)
            forecastProps[localDay].minTemp = ((forecastProps[localDay].minTemp-273.15) * 9/5 + 32).toFixed(2)
            forecastProps[localDay].maxFeelTemp = ((forecastProps[localDay].maxFeelTemp-273.15) * 9/5 + 32).toFixed(2)
            forecastProps[localDay].minFeelTemp = ((forecastProps[localDay].minFeelTemp-273.15) * 9/5 + 32).toFixed(2)
        })
    }
    return forecastProps
}


class WeekTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tabValues: []
        }
    }

    tabulate() {
        let tabArray = [[], []]
        let dayKeys = Object.keys(this.props.weatherData)
        let valueKeys = ['maxTemp', 'minTemp', 'maxFeelTemp', 'minFeelTemp', 'maxRH', 'minRH']
        tabArray[0] = dayKeys
        
        valueKeys.forEach((valueKey) => {
            tabArray[1].push(dayKeys.map((key) =>{
                return this.props.weatherData[key][valueKey]
            }))
        })
        // console.log(tabArray)
        return (tabArray)
    }
    
    render() {
        // console.log(this.props.weatherData)
        let tabArray = this.tabulate()
        let rowHeads = [<th>T<sub>max</sub></th>, <th>T<sub>min</sub></th>, <th>T<sub>maxfeel</sub></th>, <th>T<sub>minfeel</sub></th>, <th>RH<sub>max</sub> (%)</th>, <th>RH<sub>min</sub> (%)</th>]
        return (
            <table className="table table-sm table-bordered table-hover">
                <thead>
                    <tr>
                        <th scope='scope'>Property</th>
                        {tabArray[0].map((day) => {
                            return <th scope='col'>{day}</th>
                        })}
                    </tr>
                </thead>
                <tbody>
                    {tabArray[1].map((dayValues, ind) => {
                        return (
                        <tr scope='row'>
                            {rowHeads[ind]}
                            {dayValues.map((value) => {
                                return <td>{value}</td>
                            })}
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        )
    }
}

class WeatherBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchTerm: this.props.city,
            currentCity: '',
            units: 'C',
            weatherData: {}
        }
        this.weatherUpdate = this.weatherUpdate.bind(this);
        this.searchTermUpdate = this.searchTermUpdate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeSelf = this.removeSelf.bind(this)
    }

    weatherUpdate(cityName, units) {
        let APIData
        getData(cityName).then((json) => {
            // console.log(json)
            APIData = parseData(json, this.state.units)
            // console.log(APIData)
            this.setState(state => ({
                weatherData: APIData,
                currentCity: this.state.searchTerm,
                searchTerm: ""
            }))
            // console.log(this.state.weatherData)
        });
    }

    searchTermUpdate(event) {
        this.setState({
            searchTerm: event.target.value
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        // console.log(event)
        this.weatherUpdate(this.state.searchTerm, this.state.units)
    }

    removeSelf() {
        this.props.deleteCity(this.state.currentCity)
    }

    componentDidMount() {
        this.weatherUpdate(this.state.searchTerm)
    }
    
    render() {
        if (!(Object.keys(this.state.weatherData).length === 0 && this.state.weatherData.constructor === Object)) {
            const data = {
                labels: Object.keys(this.state.weatherData),
                datasets: [
                {
                    label: 'Maximum Temperatures',
                    fill: false,
                    // lineTension: 0.2,
                    // backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: '#E23201',
                    // borderCapStyle: 'butt',
                    borderDash: [],
                    // borderDashOffset: 0,
                    // borderJoinStyle: 'miter',
                    pointBorderColor: '#E23201',
                    pointBackgroundColor: '#E23201',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#E23201',
                    pointHoverBorderColor: '#000000',
                    pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 50,
                    data: Object.keys(this.state.weatherData).map((key) => {
                            return this.state.weatherData[key].maxTemp
                        })
                },
                {
                    label: 'Minimum Temperatures',
                    fill: false,
                    // lineTension: 0.1,
                    // backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    // borderCapStyle: 'butt',
                    borderDash: [],
                    // borderDashOffset: 0.1,
                    // borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: '#000000',
                    pointHoverBorderWidth: 2,
                    // pointRadius: 1,
                    pointHitRadius: 50,
                    data: Object.keys(this.state.weatherData).map((key) => {
                            return this.state.weatherData[key].minTemp
                        })
                }
                ]
            };
            return (
                <div className='container'>
                    <form onSubmit={this.handleSubmit}>
                        <input type='text' value={this.state.searchTerm} onChange={this.searchTermUpdate}  placeholder='city name (eg "Sydney")'></input>
                        <input type='submit' value='Submit'></input>
                    </form>
                    <button onClick={this.removeSelf}>Remove City</button>
                    <h2>Weather for search: "{this.state.currentCity}"</h2>
                    <Line data={data} />
                    <WeekTable weatherData={this.state.weatherData}/>
                </div>
            )
        } else {
            return (
                <div className='container'>
                    <form onSubmit={this.handleSubmit}>
                        <input type='text' value={this.state.searchTerm} onChange={this.searchTermUpdate}  placeholder='city name (eg "Sydney")'></input>
                        <input type='submit' value='Submit'></input>
                    </form>
                    <div>No data yet...</div>
                </div>
            )
        }
        
    }
}

class App extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            units: 'C',
            cities: ['Sydney', 'd', 'hong kong', 'tel aviv']
        }
        this.addCity = this.addCity.bind(this)
        this.deleteCity = this.deleteCity.bind(this)
    }

    addCity() {
        this.setState(state => ({
            cities: [...state.cities, '']
        }))
    }

    deleteCity(city) {
        console.log(city)
        let newArr = this.state.cities.slice(0, this.state.cities.indexOf(city)).concat(this.state.cities.slice(this.state.cities.indexOf(city)+1))
        console.log(newArr)
        this.setState({
            cities: newArr
        })
        
    }

    render() {
        return (
            <div>
                {this.state.cities.map(city => {
                    return <WeatherBox 
                    city={city}
                    deleteCity={this.deleteCity}
                     />
                })}
                <button onClick={this.addCity}>Add Another City</button>
            </div>
            
        )
    }
}



ReactDOM.render(<App />, document.getElementById('app'));