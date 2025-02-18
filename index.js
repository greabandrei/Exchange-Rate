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

    async getExchangeRate(baseCurrency, curencies) {
        const URL = this.baseURL + "latest?" + this.#getApiParam() + "&base_currency=" + baseCurrency + "&currencies=" + curencies
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


let currencies = {};

// HTML ELEMENTS
const fetchBtnHTML = document.getElementById("fetchBtn");
const allCurrencies = document.getElementById("all")
const currencySelectHTML_1 = document.getElementById("currency1");
const currencySelectHTML_2 = document.getElementById("currency2");
const exchangeResult = document.getElementById("exchange-result")

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

    console.log(currencySelectOptions);

    currencySelectHTML_1.innerHTML = currencySelectOptions.join('');
    currencySelectHTML_2.innerHTML = currencySelectOptions.join('');    
})


fetchBtnHTML.addEventListener("click", async function() {
    let baseCurrency = currencySelectHTML_1[0]
    let curencies = currencySelectHTML_2[1]
    currencyAPI.getExchangeRate(baseCurrency, curencies)

   console.log(baseCurrency)
   console.log(curencies)
})

