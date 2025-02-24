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
        exchangeRate[json.date] = {};
        exchangeRate[json.date][exchange] = json[base.toLowerCase()][exchange.toLowerCase()]
        
        console.log("rate: ", exchangeRate);

        return exchangeRate;
    }

    #urlBuilder(date, baseCurrency) {
        return `https://${date}.currency-api.pages.dev/v1/currencies/${baseCurrency.toLowerCase()}.json`;
    }
}

//  =========== GLOBALS ==============
let currencies = [];
const currencyAPI = new CurrencyAPI();
const currencyMap = {};
let baseCurrency;               // store base currency symbol of currency in order to use it for URL
let exchangeCurrency;           // store the exchange currency symbol in order to use it for URL

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
    day7Btn: document.getElementById("day7-btn"),
    day3Btn: document.getElementById("day3-btn"),
    day1Btn: document.getElementById("day1-btn"),
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

function onShowHistoryClick(){
    DOM.historyContent.classList.remove("hidden")

    getChart(history, data)
    DOM.chartTitle.innerHTML = `History of ${currencyMap[baseCurrency].name} to ${currencyMap[exchangeCurrency].name}`
}

function onTest(text) {
    alert("test -> " + text)
}
//  ========Helper Functions===========   //

async function getAllCurrencies() {                      //here we have the live load of currencies list 
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

// GENERATE CHART SECTION //


let history = [];
let data = [];


function generateDatesDefault() {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let fullDate = `${year}-0${month}-${day}`;
    
    for(let i = 7; i > 0; i--) {
        history.push(`${year}-0${month}-${day - i}`)
    }
    // console.log(history)
    // console.log(fullDate)
}

async function getCurrencyHistoryDefault(){
    for(let i = 6; i >= 0; i--){
        date = history[i]
        const result = await currencyAPI.getExchangeHistory(date, baseCurrency, exchangeCurrency)
        let total = Object.values(Object.values(result)[0])[0]
        data.unshift(total)
    }

}

function generate7DayResult() {
    let newDate = data;
    let newHistory = history;
    
    // history = newHistory;
    // data = newDate;

    chart.destroy();
    // click()
    getChart(newHistory, newDate);
}

DOM.day7Btn.addEventListener("focusin", generate7DayResult)




function generate3DayResult() {
    let newDate = [data[4], data[5], data[6]];
    let newHistory = [history[4], history[5], history[6]]
    
    // history = newHistory;
    // data = newDate;

    chart.destroy();
    // click()
    getChart(newHistory, newDate);

  
}

DOM.day3Btn.addEventListener("focusin", generate3DayResult)

function generate1DayResult() {
    let newDate = [data[6]];
    let newHistory = [history[6]]
    
    // history = newHistory;
    // data = newDate;

    chart.destroy();
    // click()
    getChart(newHistory, newDate);

   
}

DOM.day1Btn.addEventListener("focusin", generate1DayResult)




let chart;
function getChart(history, data) {


    const labelsData = history;
    const dataValues = data;
    
    const theChart = new Chart(DOM.exchangeRateCanvas, {
        type: 'line',
        data: {
            labels: labelsData,  // X-axis labels (dates)
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

    })
    chart = theChart
}
