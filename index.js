// API

class CurrencyAPI {

    constructor(apiKey) {
        this.baseURL = "https://api.freecurrencyapi.com/v1/"
        this.apiKey = apiKey;
    }

    #getApiParam() {
        return `apikey=${this.apiKey}`
    }

    async getCurrencies() {
        const URL = this.baseURL + "currencies?" + this.#getApiParam()
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getCurrencies failed!");
        }

        const json = await result.json();

        console.log(result, json);
        return json.data;
    }

    async getExchangeRate(base, exchange) {
        const URL = this.baseURL + "latest?" + this.#getApiParam() + "&base_currency=" + base + "&currencies=" + exchange
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getExchangeRate failed!");
        }

        const json = await result.json();

        console.log(result,json);
        return json.data
    }

    async getExchangeHistory(date, base, exchange) {
        const URL = this.baseURL + "historical?" + this.#getApiParam() + "date=" + date + "&base_currency=" + base + "&currencies=" + exchange
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getExchangeHistory failed!");
        }

        const json = await result.json();
        console.log(result, json)

        return json.data
    }
}

const currencyAPI = new CurrencyAPI("fca_live_5hi73jOEMH0Rl5vURCXZLxKZlUIzKlGSGwcrBp0C");


//GLOBALS
let currencies = {};
let baseCurrency;               // store base currency symbol of currency in order to use it for URL
let exchangeCurrency;           // store the exchange currency symbol in order to use it for URL
let currencyRate;               // store the currency ratio by base currency (1 euro = /1.2 usd/)
let result;                     // using Object.values(result) we get an array that contains the value of currency rate


// HTML ELEMENTS
const fetchBtnHTML = document.getElementById("fetchBtn");
const allCurrencies = document.getElementById("all")
const baseCurrencySelectHTML = document.getElementById("base-currency");
const exchangeCurrencySelectHTML = document.getElementById("exchange-currency");
const exchangeFrom = document.getElementById("from");
const exchangeResult = document.getElementById("to");
const amount = document.getElementById("amount");
const switchBtn = document.getElementById("switch-btn")
const rateForOne = document.getElementById("ex-from")
const lastUpdate = document.getElementById("text")
const exchangeRateCanvas = document.getElementById("exchange-rate-history")
const showChart = document.getElementById("show-chart")

// EVENT LISTENERS

// allCurrencies.addEventListener("click", async function() {
//     currencies = await currencyAPI.getCurrencies();
//     console.log("data: ", currencies)

//     const currencySelectOptions = Object.keys(currencies).map(
//         c => `<option>${c}</option>`
//     );
//     currencySelectOptions.unshift(`<option></option>`)

//     console.log(currencySelectOptions);

//     baseCurrencySelectHTML.innerHTML = currencySelectOptions.join('');
//     exchangeCurrencySelectHTML.innerHTML = currencySelectOptions.join('');    
// })

async function getAllCurrencies() {                      //here we have the live load of currencies list 
    currencies = localStorage.getItem('currencies')
   
    if(!currencies){
        currencies = await currencyAPI.getCurrencies();
        localStorage.setItem('currencies', JSON.stringify(currencies))
    }else{
        currencies = JSON.parse(currencies)
    }
    
    const currencySelectOptions = Object.keys(currencies).map(
        c => `<option>${c}</option>`
    );
    currencySelectOptions.unshift(`<option></option>`)
    
    baseCurrencySelectHTML.innerHTML = currencySelectOptions.join('');
    exchangeCurrencySelectHTML.innerHTML = currencySelectOptions.join('');    
}



document.addEventListener("DOMContentLoaded", function(){
    getAllCurrencies()
    lastRateUpdate()
 
    // localStorage.setItem('test', new Date())
})

showChart.addEventListener("click", function(){
    //history chart
    const labels = ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05"];
    const dataValues = [4.97, 5.12, 4.85, 5.30, 5.05];

    new Chart(exchangeRateCanvas, {
        type: 'line',
        data: {
            labels: labels,  // X-axis labels (dates)
            datasets: [{
                label: 'Value',
                data: dataValues,  // Y-axis values
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'blue',
                pointBorderColor: 'white',
                tension: 0.3 // Smooth curve
            }]
        },      
    });
})


baseCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Base currency changed', event.target.value)
    baseCurrency = event.target.value
})

exchangeCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Exchange currency change', event.target.value )
    exchangeCurrency = event.target.value
})




async function convert(){
    const exchange = await currencyAPI.getExchangeRate(baseCurrency, exchangeCurrency);
    console.log('data:', exchange)
    result = exchange
    
    exchangeFrom.innerText = `${Number(amount.value)} ${baseCurrency} =`;
    exchangeResult.innerText = `${calculateExchangeCurrencyRate()} ${exchangeCurrency}`;
    rateForOne.innerText =`1 ${baseCurrency} = ${exchangeCurrencyRateOne()} ${exchangeCurrency}`
}

fetchBtnHTML.addEventListener("click", function(){
    let count=0
    if(Number(amount.value) <= 0){
        alert('Amount should be greater than 0')
        count++
    }
    if(baseCurrencySelectHTML.selectedIndex === 0){
        alert('Select from wich currency to convert')
        count++
    }
    if(exchangeCurrencySelectHTML.selectedIndex === 0){
        alert('alert to wich currency you want to exchange')
        count++
    }
    if(count === 0){
        convert()
    }
})

switchBtn.addEventListener("click", function(){
    switchCurrency()
    convert()
})



//  ========Helper Functions===========   //

function calculateExchangeCurrencyRate() {
    let rate;
    let theAmount = Number(amount.value)
    
    rate = Object.values(result)
    currencyRate = rate[0]

    return currencyRate * theAmount
}

function exchangeCurrencyRateOne() {
    let rate;

    rate = Object.values(result)
    number = rate[0]

    return number 
}

function lastRateUpdate(){
    const date = new Date();
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    let day = date.getDate() - 1;
    let month = months[date.getMonth()];
    let year = date.getFullYear();

    let fullDate = `Last exchange rate update ${month} ${day} ${year}`

    return lastUpdate.innerHTML = fullDate;
}

function switchCurrency() {
    let selected1 = document.getElementById("base-currency");
    let selected2 = document.getElementById("exchange-currency");

    let baseIdx = selected1.selectedIndex;
    let exchangeIdx = selected2.selectedIndex;

    selected1.selectedIndex = exchangeIdx;
    selected2.selectedIndex = baseIdx;

    baseCurrency = baseCurrencySelectHTML.value;
    exchangeCurrency = exchangeCurrencySelectHTML.value;

}

