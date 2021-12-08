'use strict'

class NewTab {
    constructor() {
        this.showQuote = true
        this.locationPermissionState = 'unknown'
        this.navigator = navigator || window.navigator


        this.locationMeta = document.getElementById('location_meta')
        this.locationTitle = document.getElementById('location_title')
        this.locationDescription = document.getElementById('location_description')
        this.locationFlag = document.getElementById('location_flag')

        this.casesActive = document.getElementById("active_cases")
        this.casesRecovered = document.getElementById("recovered_cases")
        this.casesDeath = document.getElementById("death_cases")

        this.loaderEl = document.getElementById("loader")
        this.infoEl = document.getElementById("covidInfo")
    }

    initialize() {
        // const showTime = () => {
        //     if (this.showQuote) return clearTimeout(showTime)

        //     const date = new Date()
        //     let h = date.getHours() // 0 - 23
        //     let m = date.getMinutes() // 0 - 59
        //     let s = date.getSeconds() // 0 - 59
        //     let session = 'AM'

        //     if (h === 0) {
        //         h = 12
        //     }

        //     if (h > 12) {
        //         h -= 12
        //         session = 'PM'
        //     }

        //     h = h < 10 ? '0' + h : h
        //     m = m < 10 ? '0' + m : m
        //     s = s < 10 ? '0' + s : s

        //     const time = h + ':' + m + ':' + s
        //     this.quoteContentEl.innerText = time
        //     this.quoteAuthorEl.textContent = session

        //     setTimeout(showTime, 1000)
        // }

        // this.navigator.permissions
        //     .query({ name: 'geolocation' })
        //     .then((result) => {
        //         this.locationPermissionState = result.state // Granted ,prompt, denied
        //         result.onchange = function () {
        //             this.locationPermissionState = result.state
        //         }
        //     })

        // this.updateQuote()
        // this.updateWeatherInfo()
        this.updateCovidInfo()

        document.getElementById("country_select").onchange = (e) => {
            this.loaderEl.classList.toggle("hidden")
            this.infoEl.classList.toggle("hidden")

            this.updateCovidInfo({ countryCode: e.target.value, countryName: e.target.options[e.target.selectedIndex].innerText })
        }

        // this.weatherTextEl.onclick = async () => this.updateWeatherInfo()
        // this.quoteContentEl.onclick = async () =>
        //     this.showQuote && this.updateQuote()

        // this.quoteAuthorEl.onclick = async () => {
        //     this.showQuote = !this.showQuote
        //     showTime()
        //     if (this.showQuote) {
        //         this.updateQuote()
        //     }
        // }
    }


    async requestLocation() {
        let options = {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        }

        return new Promise((resolve, reject) => {
            if (this.locationPermissionState === ('prompt' || 'granted')) {
                this.navigator.geolocation.getCurrentPosition(
                    (_geolocation) => {
                        resolve(_geolocation)
                    },
                    (err) => {
                        reject(err)
                    },
                    options
                )
            } else {
                this.navigator.geolocation.getCurrentPosition(
                    (_geolocation) => {
                        resolve(_geolocation)
                    },
                    (err) => {
                        reject(err)
                    },
                    options
                )
            }
        })
    }



    async updateCovidInfo(query = {}) {
        let country = query.countryName || "",
            country_code = query.countryCode || ""

        if (!country || !country_code) {
            try {


                const geolocation = await this.requestLocation()
                const { latitude: lat, longitude: lon } = geolocation.coords
                const res = await this.reverseGeocode({ lat, lng: lon })
                const data = await res.json()

                country = data.address.country
                country_code = data.address.country_code
                console.log("Geocode Response", data)



                // country: "India"
                // country_code: "in"
                // county: "Hajo"
                // postcode: "781103"
                // state: "Assam"
                // state_district: "Kamrup"
                // town: "Hajo"




            } catch (e) {
                console.log(e)
            } finally {

            }
        }




        let coviddata = {}
        try {
            if (country) {
                let res = await fetch("https://covid19.mathdro.id/api/countries/" + country)
                let data = await res.json()

                if (coviddata.error) {
                    throw new Error(coviddata.error.message)
                } else {

                    this.locationTitle.innerText = country + ' - ' + country_code.toUpperCase()
                    this.locationFlag.src = `https://flagcdn.com/w320/${country_code.toLowerCase()}.png`

                    coviddata = data
                }

            } else {
                let res = await fetch("https://covid19.mathdro.id/api")
                let data = await res.json()

                coviddata = data
                coviddata.global = true
            }
            console.log("Covid Response:", coviddata)

            // {
            //     "confirmed": {
            //       "value": 34648383,
            //       "detail": "https://covid19.mathdro.id/api/countries/India/confirmed"
            //     },
            //     "recovered": {
            //       "value": 0,
            //       "detail": "https://covid19.mathdro.id/api/countries/India/recovered"
            //     },
            //     "deaths": {
            //       "value": 473757,
            //       "detail": "https://covid19.mathdro.id/api/countries/India/deaths"
            //     },
            //     "lastUpdate": "2021-12-07T14:22:26.000Z"
            //   }



            this.casesActive.innerText = coviddata.confirmed.value
            this.casesRecovered.innerText = coviddata.recovered.value
            this.casesDeath.innerText = coviddata.deaths.value

            this.locationMeta.innerText = this.formattedDateDisplay(coviddata.lastUpdate)
            this.locationDescription.innerText = null


        } catch (error) {
            console.log(error)

            this.casesActive.innerText = 'NA'
            this.casesRecovered.innerText = 'NA'
            this.casesDeath.innerText = 'NA'
            this.locationMeta.innerText = null

            this.locationDescription.innerText = "Country '" + country + "' not found in JHU database"

        } finally {
            this.loaderEl.classList.toggle("hidden")
            this.infoEl.classList.toggle("hidden")
        }

    }

    async setWallpaper(isNight) {
        if (!isNight) {
            document.body.style.color = '#000'
            document.body.style.backgroundColor = '#f9f9fa'
        }

        const headers = new Headers()
        headers.append(
            'Authorization',
            '563492ad6f917000010000018673a9bd11414027b4fb707f63b5aa45'
        )
        const wallReq = new Request(
            `https://api.pexels.com/v1/search?query=${isNight ? 'black' : 'minimalist'
            }&per_page=1`,
            { method: 'GET', headers }
        )
        const ress = await fetch(wallReq)
        const wallData = await ress.json()

        console.log('Wall Response', wallData)
        document.body.style.backgroundImage =
            'url(' + wallData.photos[0].src.landscape + ')'
    }

    async reverseGeocode({ lat, lng }) {
        const LOCATIONIQ_KEY = 'pk.c7721d7c1b2c67d62168c0b4a8a3dc9c'
        const LOCATIONIQ_BASE_URL = 'https://us1.locationiq.com/v1'

        const url = `${LOCATIONIQ_BASE_URL}/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`
        return fetch(url)
    }

    formattedDateDisplay(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return (new Date(date)).toLocaleDateString('en-US', options);
    }
}


let t = new NewTab()
t.initialize()

