const React = require('react');
const ReactDOM = require('react-dom');
const shortid = require('shortid');
const countryList = require('iso-3166-country-list');

import $ from 'jquery'
import {Line} from 'react-chartjs-2'
import './weather.css';


function getWeatherData(cityName) { //function purely to fetch the data from the server and pack it into 'weatherDataJson'
    return $.getJSON(window.location.origin + "/getweather?city="+cityName)
}


function parseWeatherData(weatherDataJson, tempUnit) { //grabbing the bits of data we actually want from the api call.
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

function getUserData() {
    return $.getJSON(window.location.origin + "/getuserdata")
}

function getCityFromData(json) {
    let retStr = json.city.name + ", " + countryList.name(json.city.country);
    return retStr;
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
        let rowHeads = [
        <th>T<sub>max</sub></th>, 
        <th>T<sub>min</sub></th>, 
        <th>T<sub>maxfeel</sub></th>, 
        <th>T<sub>minfeel</sub></th>, 
        <th>RH<sub>max</sub> (%)</th>, 
        <th>RH<sub>min</sub> (%)</th>]
        return (
            <div className="week-table table-responsive">
                <table className="table table-sm table-bordered table-hover">
                    <thead>
                        <tr>
                            <th scope='scope'>Property</th>
                            {tabArray[0].map((day) => {
                                return <th key={day} scope='col'>{day}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {tabArray[1].map((dayValues, ind) => {
                            return (
                            <tr key={dayValues} scope='row'>
                                {rowHeads[ind]}
                                {dayValues.map((value, index) => {
                                    return <td key={value.toString() + index}>{value}</td>
                                })}
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
}

class WeatherBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchTerm: this.props.city,
            currentCity: '',
            cityString: "",
            weatherData: {}
        }
        this.weatherUpdate = this.weatherUpdate.bind(this);
        this.searchTermUpdate = this.searchTermUpdate.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeSelf = this.removeSelf.bind(this)
    }

    weatherUpdate(cityName) {
        let APIData
        getWeatherData(cityName).then((json) => {
            // console.log(json)
            APIData = parseWeatherData(json, this.props.units)
            let cityString = getCityFromData(json)
            // console.log(APIData)
            this.setState(state => ({
                weatherData: APIData,
                currentCity: state.searchTerm,
                cityString: cityString,
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
        // this.weatherUpdate(this.state.searchTerm)
        this.props.changeCity(this.state.searchTerm, this.props.index)
    }

    removeSelf() {
        this.props.deleteCity(this.props.index)
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
                <div className='card'>
                    <div>
                        <h2 className='card-title'>Weather this week in {this.state.cityString}</h2>
                        <p className='card-subtitle mb-2 text-muted'>(Search term "{this.state.currentCity}")</p>
                    </div>
                    
                    <div className='canvas-container'>
                        <Line 
                        data={data}
                        // height={}
                        options={{ maintainAspectRatio: false }} />
                    </div>
                    
                    <WeekTable 
                    key={"weekTable"+ this.props.city}
                    weatherData={this.state.weatherData}/>
                    <div>
                        <form className="input-group mb-3" onSubmit={this.handleSubmit}>
                            <input className="form-control" type='text' value={this.state.searchTerm} onChange={this.searchTermUpdate}  placeholder='city name (eg "Sydney")'></input>
                            <div className="input-group-append">
                                <input className="btn btn-primary" type='submit' value='Submit'></input>
                            </div>
                        </form>
                        <button className="remove-button btn btn-danger" onClick={this.removeSelf}>Remove City</button>
                    </div>
                </div>
            )
        } else {
            return (
                <div className='card'>
                    <div>No data yet...</div>
                    <form onSubmit={this.handleSubmit}>
                        <input type='text' value={this.state.searchTerm} onChange={this.searchTermUpdate}  placeholder='city name (eg "Sydney")'></input>
                        <input type='submit' value='Submit'></input>
                    </form>
                    <button className="remove-button btn btn-danger" onClick={this.removeSelf}>Remove City</button>
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
            cities: []
        }
        this.addCity = this.addCity.bind(this)
        this.deleteCity = this.deleteCity.bind(this)
        this.changeCity = this.changeCity.bind(this)
        this.changeUnit = this.changeUnit.bind(this)
        this.logout = this.logout.bind(this)
    }

    addCity() {
        this.setState(state => ({
            cities: [...state.cities, '']
        }))
    }

    logout() {
        $.post('/logout').then((res)=>{
            if(res==='OK'){
                localStorage.clear();
                window.location = '/';
            }
        });
    }

    deleteCity(index) {
        // console.log(index)
        let newArr = this.state.cities.slice(0, index).concat(this.state.cities.slice(index+1))
        // console.log("the new array is " + newArr)
        this.setState({
            cities: newArr
        })
    }

    changeCity(newCity, index) {
        // console.log(this.state.cities.slice(0,index))
        this.setState(state => ({
            cities: state.cities.slice(0,index).concat(newCity).concat(state.cities.slice(index+1))
        }))
    }

    changeUnit(event) {
        // console.log(event.target.value)
        this.setState({
            units: event.target.value
        })
    }
    
    componentDidMount() {
        getUserData().then(json => {
            this.setState({
                units: json.units,
                cities: json.cities
            })
        })
    }

    componentDidUpdate() {
        $.post(window.location.origin + "/updateuserinfo", {
            units: this.state.units,
            cities: this.state.cities
        })
    }

    render() {
        return (
            <div className='pagewrapper'>
                <div className='sidenav'>
                    <form className='sidenav-units'>
                        <label htmlFor='celcius'><input id='celcius' type="radio" name='unit' value='C' checked={this.state.units==='C'} onChange={this.changeUnit} /> Celcius</label>
                        <label htmlFor='farenheit'><input id='farenheit' type="radio" name='unit' value='F' checked={this.state.units==='F'} onChange={this.changeUnit} /> Farenheit</label>
                        <label htmlFor='kelvin'><input id='kelvin' type="radio" name='unit' value='K' checked={this.state.units==='K'} onChange={this.changeUnit} /> Kelvin</label>
                    </form>
                    <button className='btn btn-primary sidenav-button' onClick={this.addCity}>Add Another City</button>
                    <button className='btn btn-danger sidenav-button' onClick={this.logout}>Logout</button>
                </div>
                <div className='container-fluid'>
                    {this.state.cities.map((city, index) => {
                        return <WeatherBox 
                        key={(city==='')?shortid.generate():city+index+this.state.units}
                        index = {index}
                        city={city}
                        units={this.state.units}
                        deleteCity={this.deleteCity}
                        changeCity={this.changeCity}
                        />
                    })}
                </div>
                
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('app'));