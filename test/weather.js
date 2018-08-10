let config = require('../config/test.json');
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let should = chai.should();
let SanFrancisco = {};
let Bucharest = {};
let mlog = require('mocha-logger');

/*
  * Test the /GET route
  */
describe('Tests Set',function(){
    describe('San francisco test suite', () => {
        after(() => {mlog.log(SanFrancisco.forecast);});
        it('Search for San Francisco', (done) => {
            chai.request(config.host)
                .get('/api/location/search/?query=San%20Francisco')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].should.have.property('title').eql('San Francisco');
                    SanFrancisco.latt_long = res.body[0].latt_long;
                    SanFrancisco.woeid = res.body[0].woeid;
                    done();
                });
        });

        it('Verify the returned lat/long values for San Francisco match the city', (done) => {
            chai.request(config.host)
                .get('/api/location/search/?lattlong=' + SanFrancisco.latt_long)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].should.have.property('title').eql('San Francisco');
                    done();
                });
        });

        it('Use San Francisco woeid to get details and print out the current weather state, wind speed and current temperature', (done) => {
            chai.request(config.host)
                .get('/api/location/' + SanFrancisco.woeid + '/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
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

    describe('Bucharest test suite', () => {
        after(() => {mlog.log(Bucharest.forecast);});
        it('Search for Bucharest', (done) => {
            chai.request(config.host)
                .get('/api/location/search/?query=Bucharest')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].should.have.property('title').eql('Bucharest');
                    Bucharest.latt_long = res.body[0].latt_long;
                    Bucharest.woeid = res.body[0].woeid;
                    done();
                });
        });

        it('Use Bucharest woeid to get details and print out the weather state, wind speed and temperature for the date of 17-05-2017 at 14:23', (done) => {
            chai.request(config.host)
                .get('/api/location/' + Bucharest.woeid + '/2017/5/17/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    let time = '2017-05-17T14';
                    for (let i in res.body){
                        if(res.body[i].created.indexOf(time) > -1){
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

