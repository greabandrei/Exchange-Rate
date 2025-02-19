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

// HTML ELEMENTS
const fetchBtnHTML = document.getElementById("fetchBtn");
const allCurrencies = document.getElementById("all")
const baseCurrencySelectHTML = document.getElementById("base-currency");
const exchangeCurrencySelectHTML = document.getElementById("exchange-currency");
const exchangeFrom = document.getElementById("from");
const exchangeResult = document.getElementById("to");
const amount = document.getElementById("amount");

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

let result;

fetchBtnHTML.addEventListener("click", async function() {
    // const selected1 = document.getElementById("currency1")
    // const index1 = selected1.selectedIndex
    // console.log(index1)

    // let baseCurrency = selected1[index1]
    // console.log(baseCurrency)

    // const selected2 = document.getElementById("currency2")
    // const index2 = selected2.selectedIndex
    // console.log(index2)

    // let curencies = selected2[index2]
    // console.log(curencies) 

   const exchange = await currencyAPI.getExchangeRate(baseCurrency, exchangeCurrency);
    console.log('data:', exchange)
    result = exchange

    exchangeResult.innerText = `${exchangeCurrencyRate()} ${exchangeCurrency}`
    exchangeFrom.innerText = `${Number(amount.value)} ${baseCurrency} =`
})

baseCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Base currency changed', event.target.value)
    baseCurrency = event.target.value
    console.log(baseCurrency)
})

exchangeCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Exchange currency change', event.target.value )
    exchangeCurrency = event.target.value
})

let number;

function exchangeCurrencyRate() {
    let rate;
    let theAmount = Number(amount.value)
    
    rate = Object.values(result)
    number = rate[0]

    return number * theAmount

}




