import requests
from flask import Flask, render_template, request, jsonify
import json
import dateutil.parser


app = Flask(__name__)
app.static_folder = 'static'

# api_key = 'HKGMSz75AUwxbd6hbpBRYk5cp5r5GIpM'
# api_key = 'OoqJoSHqyZNGoATKMnYK3YWfdTUKIWB1'
api_key = 'izOib0sas1iHtJoPXsiUZz3DYcOl9KIw'
# api_key = 'IKCaPz38UVKyCpkIrshm6DqERLg6AifD'
# api_key = 'qCQKOmVhbQy19Jo7esiUyC1LlcRzc4a4'

weather_codes={}

weather_codes[3002] = ['Strong Wind','strong_wind.svg']
weather_codes[3000] = ['Light Wind','light_wind.svg']
weather_codes[3001] = ['Wind','wind.svg']
weather_codes[4201] = ['Heavy Rain','rain_heavy.svg']

weather_codes[1000] = ['Clear Day','clear_day.svg']
# weather_codes[1000] = ['Clear Night','clear_night.svg']

weather_codes[1001] = ['Cloudy','cloudy.svg']
weather_codes[4000] = ['Drizzle','drizzle.svg']
weather_codes[2100] = ['Light Fog','fog_light.svg']
weather_codes[2000] = ['Fog','fog.svg']
weather_codes[6000] = ['Freezing Drizzle','freezing_drizzle.svg']
weather_codes[6201] = ['Heavy Freezing Rain','freezing_rain_heavy.svg']
weather_codes[6200] = ['Light Freezing Rain','freezing_rain_light.svg']
weather_codes[6001] = ['Freezing Rain','freezing_rain.svg']
weather_codes[5001] = ['Flurries','flurries.svg']
weather_codes[7101] = ['Heavy Ice Pellets','ice_pellets_heavy.svg']
weather_codes[7102] = ['Light Ice Pellets','ice_pellets_light.svg']
weather_codes[7000] = ['Ice Pellets','ice_pellets.svg']

weather_codes[1100] = ['Mostly Clear','mostly_clear_day.svg']
# weather_codes[1100] = ['Mostly Clear','mostly_clear_night.svg']

weather_codes[1102] = ['Mostly Cloudy','mostly_cloudy.svg']

weather_codes[1101] = ['Partly Cloudy','partly_cloudy_day.svg']
# weather_codes[1101] = ['Partly Cloudy','partly_cloud_night.svg']

weather_codes[4200] = ['Light Rain','rain_light.svg']
weather_codes[4001] = ['Rain','rain.svg']

weather_codes[5101] = ['Heavy Snow','snow_heavy.svg']
weather_codes[5100] = ['Light Snow','snow_light.svg']
weather_codes[5000] = ['Snow','snow.svg']
weather_codes[8000] = ['Thunderstorm','tstorm.svg']

@app.route('/', methods=['GET','POST'])
def weather_dashboard():
    return render_template('home.html')

@app.route('/fetch_weather_data_using_current_location', methods=['GET'])
def fetch_weather_data_using_current_location():
    latitude = request.args.get('lat');
    longitude = request.args.get('lon');
    address = request.args.get('address');
    weather_current = get_weather_current(str(latitude),str(longitude))
    weather_forecast = get_weather_forecast(str(latitude),str(longitude))
    hourly_weather = get_hourly_data(str(latitude),str(longitude))
    weather_current = weather_current['data']['timelines'][0]['intervals']
    weather_forecast = weather_forecast['data']['timelines'][0]['intervals']
    weather_forecast_hr = hourly_weather['data']['timelines'][0]['intervals']

    for forecast in weather_forecast:
        forecast['Date'] = dateutil.parser.isoparse(forecast['startTime']).strftime('%A, %d %B %Y')

    data={}
    data['current'] = weather_current
    data['forecast'] = weather_forecast
    data['hourly'] = weather_forecast_hr
    data['address'] = address
    data['weather_codes'] = weather_codes

    return jsonify(data)
    


@app.route('/fetch_weather_data', methods=['GET'])
def fetch_weather_data():
    street = request.args.get('street')
    u_street = street.replace(" ", "+")
    city = request.args.get('city')
    u_city = city.replace(" ", "+")
    state = request.args.get('state')
    address = u_street + '+' + u_city + '+' + state

    geocoding_api = "https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyA69ez0zZevTG9TC3lfhgtXecbmB0JAgG8"
    response = requests.get(geocoding_api)
    response_info = json.loads(response.text)
    latitude = response_info['results'][0]['geometry']['location']['lat']
    longitude = response_info['results'][0]['geometry']['location']['lng']

    weather_current = get_weather_current(str(latitude),str(longitude))
    weather_forecast = get_weather_forecast(str(latitude),str(longitude))
    hourly_weather = get_hourly_data(str(latitude),str(longitude))
    weather_current = weather_current['data']['timelines'][0]['intervals']
    weather_forecast = weather_forecast['data']['timelines'][0]['intervals']
    weather_forecast_hr = hourly_weather['data']['timelines'][0]['intervals']

    for forecast in weather_forecast:
        forecast['Date'] = dateutil.parser.isoparse(forecast['startTime']).strftime('%A, %d %B %Y')

    data={}
    data['current'] = weather_current
    data['forecast'] = weather_forecast
    data['hourly'] = weather_forecast_hr
    data['address'] = street + ' ' + city + ', ' + state + ', ' + 'US'
    data['weather_codes'] = weather_codes

    return jsonify(data)

def get_weather_current(lat,lng):
    api_url = "https://api.tomorrow.io/v4/timelines?location="+lat+","+lng+"&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,visibility,cloudCover&timesteps=current&units=metric&timezone=America/Los_Angeles&apikey="+ api_key
    r = requests.get(api_url)
    return r.json()

def get_weather_forecast(lat,lng):
    api_url = "https://api.tomorrow.io/v4/timelines?location="+lat+","+lng+"&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=1d&units=metric&timezone=America/Los_Angeles&apikey=" + api_key
    r = requests.get(api_url)
    return r.json()

def get_hourly_data(lat,lng):
    api_url = "https://api.tomorrow.io/v4/timelines?location="+lat+","+lng+"&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,visibility,cloudCover&timesteps=1h&units=metric&timezone=America/Los_Angeles&apikey=" + api_key
    r = requests.get(api_url)
    return r.json()

if __name__== '__main__':
    app.run()

