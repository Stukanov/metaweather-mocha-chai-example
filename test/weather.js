let config = require('../config/test.json');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let should = chai.should();
let SanFrancisco = {};
let Bucharest = {};
let mlog = require('mocha-logger');
let JSONPath = require('JSONPath');

function assertJSONPath(object,jsonpath){
    let result = JSONPath({json: object, path: jsonpath});
    if(result.length === 0){
        throw new chai.AssertionError('JSON object is expected to match the given JSONPath : ' + jsonpath);
    }

}


describe('Demo tests Set', function () {
    this.timeout(15000);

    /*
    * Task #1
    * Search for San Francisco and verify the title of the first element of the array of cities
    *
    */
    describe('1. Search for San Francisco', () => {
        it('Should be an array with it\'s first element\'s property "title" equal to "San Francisco', (done) => {
            chai.request(config.host)
                .get('/api/location/search/?query=San%20Francisco')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array').that.is.not.empty;
                    res.body[0].should.have.property('title').eql('San Francisco');
                    done();
                });

        });
    });

    /*
    * Task #2
    * Use lat/long of San Francisco to verify that the city name matches its lat/long
    *
    */
    describe('2. Verify the returned lat/long values for San Francisco match the city', () => {
        it('Should be an array with it\'s first element\'s property "title" equal to "San Francisco" ', (done) => {
            chai.request(config.host)
                .get('/api/location/search/?lattlong=37.777119, -122.41964')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array').that.is.not.empty;
                    res.body[0].should.have.property('title').eql('San Francisco');
                    done();
                });
        });
    });

    /*
    * Task #3
    * Printing out the weather
    *
    */
    describe('3. Use San Francisco woeid to get details and print out the current weather state, wind speed and current temperature', () => {
        after(() => {
            mlog.log(SanFrancisco.forecast);
        });
        it('Should be an object with consolidated_weather property, which is an array and is not empty', (done) => {
            chai.request(config.host)
                .get('/api/location/2487956/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('consolidated_weather').which.is.an('array').that.is.not.empty;
                    SanFrancisco.forecast = `
                    Weather forecast for San Francisco for today:
                    Weather state : ${res.body.consolidated_weather[0].weather_state_name}
                    Wind speed : ${res.body.consolidated_weather[0].wind_speed}
                    Current temperature : ${res.body.consolidated_weather[0].the_temp}
                    `;
                    done();
                });
        });
    });

    /*
    * Task number 4
    * Extract the weather for the date of 17-05-2017 at 14:23
    *
    */
    describe('4. Use Bucharest woeid to get details and print out the weather state, wind speed and temperature for the date of 17-05-2017 at 14:23', () => {
        after(() => {
            mlog.log(Bucharest.forecast);
        });
        it('Should be an array with an element that has property "created" which contains "2017-05-17T14:23" ', (done) => {
            chai.request(config.host)
                .get('/api/location/868274/2017/5/17/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array').that.is.not.empty;
                    assertJSONPath(res.body,"$..[?(/2017-05-17T14:23/.test(@.created))]");

                    for (let i in res.body) {
                        if (res.body[i].created.indexOf('2017-05-17T14:23') > -1) {
                            var match = res.body[i];
                        }
                    }

                    Bucharest.forecast = `
                    Weather forecast for Bucharest for the date of 17-05-2017 at 14:23:
                    Weather state : ${match.weather_state_name}
                    Wind speed : ${match.wind_speed}
                    Current temperature : ${match.the_temp}
                    `;
                    done();
                });
        });
    });
});









