// API

function Currency(key, name, symbol) {
    return {
        key,
        name,
        symbol
    }
}
class CurrencyAPI {
    async getCurrencies() {
        const URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getCurrencies failed!");
        }

        const json = await result.json();

        console.log(result, json);

        return json;
    }

    async getExchangeRate(base, exchange) {
        const URL = this.#urlBuilder('latest', base);
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getExchangeRate failed!");
        }

        const json = await result.json();

        console.log(result,json);

        const exchangeRate = {}
        exchangeRate[exchange] = json[base.toLowerCase()][exchange.toLowerCase()]
        
        console.log("rate: ", exchangeRate);

        return exchangeRate;
    }

    async getExchangeHistory(date, base, exchange) {
        console.log("INFO: getExchangeHistory ", date, base, exchange)
        const URL = this.#urlBuilder(date, base);
        const result = await fetch(URL);

        if(!result.ok) {
            throw new Error("Fetch getExchangeHistory failed!");
        }

        const json = await result.json();
        console.log(result, json)

        const exchangeRate = {}
        exchangeRate[json.date] = json[base.toLowerCase()][exchange.toLowerCase()]
        
        console.log("rate: ", exchangeRate);

        return exchangeRate;
    }

    async getExchangeHistoryRange(startDate, endDate, base, exchange) {
        console.log('getExchangeHistoryRange', startDate, endDate, base, exchange);
        currencyHistory = {};
        let fetchDates = []
        let currentDay = new Date(startDate);
        while (currentDay.getTime() < endDate.getTime()) {
            fetchDates.push(currentDay.toISOString().split('T')[0])
            currentDay = new Date(currentDay.getTime() + DAY_IN_MS + 3600);
        }
        console.log('getExchangeHistoryRange', fetchDates);
        const parallelCalls = fetchDates.map(date => this.getExchangeHistory(date, base, exchange));
        console.log('parallelCalls', parallelCalls)
        const result = await Promise.all(parallelCalls);

        const resultMap = {}
        result.forEach(r => Object.assign(resultMap, r));

        console.log('getExchangeHistoryRange', resultMap);
        return resultMap;
    }
    
    #urlBuilder(date, baseCurrency) {
        return `https://${date}.currency-api.pages.dev/v1/currencies/${baseCurrency.toLowerCase()}.json`;
    }
}

//  =========== GLOBALS ==============
const DAY_IN_MS = 24 * 3600 * 1000;
let currencies = [];
const currencyAPI = new CurrencyAPI();
const currencyMap = {};
let baseCurrency;               // store base currency symbol of currency in order to use it for URL
let exchangeCurrency;           // store the exchange currency symbol in order to use it for URL
let startHistoryDate;
let historyNrOfDays = 90;
let currencyHistory = {};

let days = [];
let dataSet = [];
let chart;

//  ============== HTML ELEMENTS ==============
const DOM = {
    convertBtn: document.getElementById("convertBtn"),
    allCurrencies: document.getElementById("all"),
    baseCurrencySelect: document.getElementById("base-currency"),
    exchangeCurrencySelect: document.getElementById("exchange-currency"),
    exchangeFrom: document.getElementById("from"),
    exchangeResult: document.getElementById("to"),
    amount: document.getElementById("amount"),
    switchBtn: document.getElementById("switch-btn"),
    rateForOne: document.getElementById("ex-from"),
    lastUpdate: document.getElementById("text"),
    exchangeRateCanvas: document.getElementById("exchange-rate-history"),
    showHistoryBtn: document.getElementById("show-history-btn"),
    historyContent: document.getElementById("history-content"),
    subTitle: document.getElementById("sub-title"),
    startDate: document.getElementById("start-date-input"),
    endDate: document.getElementById("end-date-input"),
    chartTitle: document.getElementById("chart-title"),
    subTitle: document.getElementById("sub-title"),
    chartContent: document.getElementById("chart-content"),
}

// ====== EVENT LISTENERS =======

document.addEventListener("DOMContentLoaded", onDocumentLoaded);
DOM.convertBtn.addEventListener("click", onConvertClick)
DOM.baseCurrencySelect.addEventListener("change", onBaseCurrencyChange)
DOM.exchangeCurrencySelect.addEventListener("change", onExchangeCurrencyChange)
DOM.switchBtn.addEventListener("click", onSwitchClick)
DOM.showHistoryBtn.addEventListener("click", onShowHistoryClick)


//  ======== EVENTS ============

function onDocumentLoaded() {
    getAllCurrencies()
    lastRateUpdate()
    calculateStartHistoryDate()
}

function onConvertClick(){
    if(Number(amount.value) <= 0){
        alert('Amount should be greater than 0')
        return
    }
    if(DOM.baseCurrencySelect.selectedIndex === 0){
        alert('Select from wich currency to convert')
        return
    }
    if(DOM.exchangeCurrencySelect.selectedIndex === 0){
        alert('alert to wich currency you want to exchange')
        return
    }
    
    convert()
}

function onBaseCurrencyChange(event) {
    console.log('Base currency changed', event.target.value)
    baseCurrency = event.target.value
    updateConvertTitle();
}

function onExchangeCurrencyChange(event) {
    console.log('Exchange currency change', event.target.value )
    exchangeCurrency = event.target.value
    updateConvertTitle();
}

function onSwitchClick(){
    const temp = DOM.baseCurrencySelect.value;
    DOM.baseCurrencySelect.value = DOM.exchangeCurrencySelect.value;
    DOM.exchangeCurrencySelect.value = temp;

    baseCurrency = DOM.baseCurrencySelect.value;
    exchangeCurrency = DOM.exchangeCurrencySelect.value;

    convert()
}

async function onShowHistoryClick(){
    DOM.historyContent.classList.remove("hidden")
    DOM.chartTitle.innerHTML = `History of ${currencyMap[baseCurrency].name} to ${currencyMap[exchangeCurrency].name}`
    
    await fetchCurrencyHistory(currencyMap[baseCurrency].key, currencyMap[exchangeCurrency].key);
    displayChart();
}

function onHistoryDaysClick(nrOfDays) {
    historyNrOfDays = nrOfDays;
    calculateStartHistoryDate();
    resetChart();
}

// function onTest(text) {
//     alert("test -> " + text)
// }
//  ========Helper Functions===========   //

async function getAllCurrencies() {                     
    currencies = localStorage.getItem('currencies')
   
    if(!currencies){
        result = await currencyAPI.getCurrencies();
        currencies = Object.keys(result).map(c => Currency(c, result[c], c.toUpperCase()))
        localStorage.setItem('currencies', JSON.stringify(currencies))
    }else{
        currencies = JSON.parse(currencies)
    }

    // Convert currency list to map for faster currency retrieval
    currencies.forEach(element => {
        currencyMap[element.key] = element;
    });

    const currencySelectOptions = currencies.map(
        c => `<option value=${c.key}>${c.symbol}</option>`
    );
    currencySelectOptions.unshift(`<option></option>`)
    
    DOM.baseCurrencySelect.innerHTML = currencySelectOptions.join('');
    DOM.exchangeCurrencySelect.innerHTML = currencySelectOptions.join('');    
}

function updateConvertTitle() {
    let text = "Convert currencies";
    if (baseCurrency && exchangeCurrency) {
        text = `Convert from ${currencyMap[baseCurrency].name} to ${currencyMap[exchangeCurrency].name}`
    }
    DOM.subTitle.innerText = text;
}

async function convert(){
    resetHTMLFields();

    const exchange = await currencyAPI.getExchangeRate(baseCurrency, exchangeCurrency);
    
    chart?.destroy();
    DOM.exchangeFrom.innerText = `${Number(amount.value)} ${currencyMap[baseCurrency].symbol} =`;
    DOM.exchangeResult.innerText = `${exchange[exchangeCurrency] * Number(amount.value)} ${currencyMap[exchangeCurrency].symbol}`;
    DOM.rateForOne.innerText =`1 ${baseCurrency} = ${exchange[exchangeCurrency]} ${currencyMap[exchangeCurrency].symbol}`
    DOM.historyContent.classList.add("hidden")
    DOM.showHistoryBtn.classList.remove("hidden")
}

function lastRateUpdate(){
    const date = new Date();
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    let day = date.getDate() - 1;
    let month = months[date.getMonth()];
    let year = date.getFullYear();
    
    let fullDate = `Last exchange rate update ${month} ${day} ${year}`
    
    return DOM.lastUpdate.innerHTML = fullDate;
}

function resetHTMLFields() {
    DOM.historyContent.classList.add("hidden")
    DOM.showHistoryBtn.classList.add("hidden")
    DOM.exchangeFrom.innerText = ''
    DOM.exchangeResult.innerText = ''
    DOM.rateForOne.innerText = '';
}

function calculateStartHistoryDate() {
    const today = new Date();
    const lastDay = new Date(today.getTime() - DAY_IN_MS);
    startHistoryDate = new Date(lastDay - (historyNrOfDays * DAY_IN_MS))
}

async function fetchCurrencyHistory(base, exchange) {
    console.log('fetchCurrencyHistory', base, exchange)
    currencyHistory = await currencyAPI.getExchangeHistoryRange(startHistoryDate, new Date(), base, exchange)
    console.log('fetchCurrencyHistory', currencyHistory)
}

function getChartData() {
    const historyStartDate = startHistoryDate.toISOString().split('T')[0];
    const labels = Object.keys(currencyHistory).filter(cDate => cDate >= historyStartDate);
    let data = [];
    labels.forEach(date => {
        data.push(currencyHistory[date]);
    });

    console.log('getChartData', historyStartDate, labels, data)

    return [labels, data];
}

function displayChart() {
    const [labels, data] = getChartData();

    chart = new Chart(DOM.exchangeRateCanvas, {
        type: 'line',
        data: {
            labels,  // X-axis labels (dates)
            datasets: [{
                label: 'Value',
                data,  // Y-axis values
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
}

function resetChart() {
    const [labels, data] = getChartData();
    chart.data.labels = labels;
    chart.data.datasets.data = data;
    chart.update();
}


