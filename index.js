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

// EVENT LISTENERS
// document.addEventListener("DOMContentLoaded", async function() {
    //     currencies = await currencyAPI.getCurrencies();
    //     console.log("data: ", currencies)
    
    //     const currencySelectOptions = Object.keys(currencies).map(
//         c => `<option>${c}</option>`
//     );

//     console.log(currencySelectOptions);

//     currencySelectHTML_1.innerHTML = currencySelectOptions.join('');
//     currencySelectHTML_2.innerHTML = currencySelectOptions.join('');
// });

lastRateUpdate()

allCurrencies.addEventListener("click", async function() {
    currencies = await currencyAPI.getCurrencies();
    console.log("data: ", currencies)
    
    const currencySelectOptions = Object.keys(currencies).map(
        c => `<option>${c}</option>`
    );
    currencySelectOptions.unshift(`<option></option>`)
    
    console.log(currencySelectOptions);
    
    baseCurrencySelectHTML.innerHTML = currencySelectOptions.join('');
    exchangeCurrencySelectHTML.innerHTML = currencySelectOptions.join('');    
})

baseCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Base currency changed', event.target.value)
    baseCurrency = event.target.value
})

exchangeCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Exchange currency change', event.target.value )
    exchangeCurrency = event.target.value
})

fetchBtnHTML.addEventListener("click", async function() {

    const exchange = await currencyAPI.getExchangeRate(baseCurrency, exchangeCurrency);
    console.log('data:', exchange)
    result = exchange

    exchangeFrom.innerText = `${Number(amount.value)} ${baseCurrency} =`;
    exchangeResult.innerText = `${exchangeCurrencyRate()} ${exchangeCurrency}`;
    rateForOne.innerText =`1 ${baseCurrency} = ${exchangeCurrencyRateOne()} ${exchangeCurrency}`
})


switchBtn.addEventListener("click", function(){
    switchCurrency()
})


//  ========Helper Functions===========   //

function exchangeCurrencyRate() {
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

