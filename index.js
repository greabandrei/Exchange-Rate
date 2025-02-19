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
let baseCurrency;
let exchangeCurrency;
let number;
let result;
let base;
let exchange;

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


fetchBtnHTML.addEventListener("click", async function() {

    const exchange = await currencyAPI.getExchangeRate(baseCurrency, exchangeCurrency);
    console.log('data:', exchange)
    result = exchange

    exchangeResult.innerText = `${exchangeCurrencyRate()} ${exchangeCurrency}`;
    exchangeFrom.innerText = `${Number(amount.value)} ${baseCurrency} =`;
    rateForOne.innerText =`1 ${baseCurrency} = ${exchangeCurrencyRateOne()} ${exchangeCurrency}`
})

baseCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Base currency changed', event.target.value)
    base = event.target.value
    baseCurrency = base
})

exchangeCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Exchange currency change', event.target.value )
    exchange = event.target.value
    exchangeCurrency = exchange
})

switchBtn.addEventListener("click", function(){
    let value1 = baseCurrencySelectHTML.value
    let value2 = exchangeCurrencySelectHTML.value
 
    baseCurrencySelectHTML.value = value2;
    exchangeCurrencySelectHTML.value = value1;
})

function exchangeCurrencyRate() {
    let rate;
    let theAmount = Number(amount.value)
    
    rate = Object.values(result)
    number = rate[0]

    return number * theAmount
}

function exchangeCurrencyRateOne() {
    let rate;

    rate = Object.values(result)
    number = rate[0]

    return number 
}




