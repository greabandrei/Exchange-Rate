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
        const URL = this.baseURL + "historical?" + this.#getApiParam() + "&date=" + date + "&base_currency=" + base + "&currencies=" + exchange
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
const showHistoryBtn = document.getElementById("show-history-btn")
const historyContentHTML = document.getElementById("history-content")
const startDate = document.getElementById("start-date-input")
const endDate = document.getElementById("end-date-input")
const chartTitle = document.getElementById("chart-title")
const subTitle = document.getElementById("sub-title")
const chartContent = document.getElementById("chart-content")

// const DOM = {
//     fetchBtn: document.getElementById("fetchBtn"),
//     allCurrencies: document.getElementById("all"),
//     baseCurrencySelect: document.getElementById("base-currency"),
//     exchangeCurrencySelect: document.getElementById("exchange-currency"),
//     exchangeFrom: document.getElementById("from"),
//     exchangeResult: document.getElementById("to"),
//     amount: document.getElementById("amount"),
//     switchBtn: document.getElementById("switch-btn"),
//     rateForOne: document.getElementById("ex-from"),
//     lastUpdate: document.getElementById("text"),
//     exchangeRateCanvas: document.getElementById("exchange-rate-history"),
//     showHistoryBtn: document.getElementById("show-history-btn")
// }

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

let allCurrenciesData;
async function getAllCurrencies() {                      //here we have the live load of currencies list 
    currencies = localStorage.getItem('currencies')
   
    if(!currencies){
        currencies = await currencyAPI.getCurrencies();
        localStorage.setItem('currencies', JSON.stringify(currencies))
    }else{
        currencies = JSON.parse(currencies)
    }
    
    allCurrenciesData = currencies

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

    subTitle.innerHTML = `Convert currencies`

    // localStorage.setItem('test', new Date())
})



baseCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Base currency changed', event.target.value)
    baseCurrency = event.target.value
 
    subTitle.innerText = `Convert ${allCurrenciesData[baseCurrency].name}`
})

exchangeCurrencySelectHTML.addEventListener("change", function(event) {
    console.log('Exchange currency change', event.target.value )
    exchangeCurrency = event.target.value

    // exchangeRateCanvas.remove()
    // chartContent.innerHTML = "<canvas id='exchange-rate-history'> </canvas>"
    // data = [];
    // getCurrencyHistory()
    
    subTitle.innerText = `Convert ${allCurrenciesData[baseCurrency].name} to ${allCurrenciesData[exchangeCurrency].name}`
})



showHistoryBtn.addEventListener("click", function(){
    historyContentHTML.classList.remove("hidden")

    chartTitle.innerHTML = `History of ${allCurrenciesData[baseCurrency].name} to ${allCurrenciesData[exchangeCurrency].name}`
    theChart
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

    if(Number(amount.value) <= 0){
        alert('Amount should be greater than 0')
        return
    }
    if(baseCurrencySelectHTML.selectedIndex === 0){
        alert('Select from wich currency to convert')
        return
    }
    if(exchangeCurrencySelectHTML.selectedIndex === 0){
        alert('alert to wich currency you want to exchange')
        return
    }
    
    convert()
    

    historyContentHTML.classList.add("hidden")
    showHistoryBtn.classList.remove("hidden")

    generateDates()
    getCurrencyHistory()
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


// GENERATE CHART SECTION //
function DateTimeStamp() {
    let start = Date.parse(startDate.value)
    let end = Date.parse(endDate.value)
    return (end / 86400000) - (start / 86400000)
}

let history = [];
let data = [];


function generateDates() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let fullDate = `${year}-0${month}-${day}`;
    
    for(let i = 2; i > 0; i--) {
        history.push(`${year}-0${month}-${day - i}`)
    }
    console.log(history)
    console.log(fullDate)
}

async function getCurrencyHistory(){
    for(let i = 1; i >= 0; i--){
        date = history[i]
        const result = await currencyAPI.getExchangeHistory(date, baseCurrency, exchangeCurrency)
        let total = Object.values(Object.values(result)[0])[0]
        data.unshift(total)
    }

}



// function showChart() {
    //history chart

class NewChart {
    
    constructor() {
        this.labelsData = history,
        this.dataValues= data;
    
    } 

    chart = new Chart(exchangeRateCanvas, {
        type: 'line',
        data: {
            labels: this.labelsData,  // X-axis labels (dates)
            datasets: [{
                label: 'Value',
                data: this.dataValues,  // Y-axis values
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBackgroundColor: 'blue',
                pointBorderColor: 'white',
                tension: 0.3 // Smooth curve
            }]
        },

    })
// }

}
const theChart = new NewChart()
