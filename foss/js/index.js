"use strict"
/**
 * Api model
 * count: number;
 * name: string; //imie szukanego
 * country: Array<country>
 *
 *     Api country
 *     country_id: string //skrót kraju
 *     probability: number // szansa na pochodzenie
 * **/

const fakePositiveApiData  = {
    count: 2,
    name: 'xyz',
    country: [{country_id: 'PL', probability: 0.012345 },{country_id: 'EN', probability: 0.23125 }]
}
const fakeNegativeApiData  = {
    count: 0,
    name: 'xyz',
    country: []
}

const input = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const holder = document.getElementById('holder');
async function toJSON(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const chunks = [];

    async function read() {
        const {done, value} = await reader.read();

        if (done) {
            return JSON.parse(chunks.join(''));
        }

        const chunk = decoder.decode(value, {stream: true});
        chunks.push(chunk);
        return read();
    }

    return read();
}

async function findName(name) {
    const url = `https://api.nationalize.io/?name=${name}`;
    const options = {
        method: 'GET',

    };
    const response = fetch(url, options);
    return await toJSON((await response).body);
}

function handleListElementResultCreate(data) {
    const ul = document.createElement('ul');

    data.map((countries) => {
        const {country_id, probability} = countries
        const li = document.createElement('li');
        const probabilityToPercent = (probability * 100).toString();
        const parsedNumber = parseFloat(probabilityToPercent).toFixed( 2 )
        li.innerHTML = `<div><p><span class="bold-font">${country_id}:</span>&nbsp;<span>${parsedNumber}%</span></p></div>`;
        ul.appendChild(li)
    });

    return ul;
}
function createResultList(data) {
    const {count, name, country} = data;
    const title = document.createElement('div');

    if(count === 0 ) {
        title.innerHTML = `<p class="spacer-bottom">Brak danych dla imienia <span class="bold-font">${name}</span><p>`
        holder.appendChild(title);
    } else if(count > 0) {
        title.innerHTML = `<p class="spacer-bottom">Dla imienia <span class="bold-font">${name}</span> znalazłem następujące połączenia:<p>`
        holder.appendChild(title);
        holder.appendChild(handleListElementResultCreate(country));
    } else {
        title.innerHTML = `<p><span class="bold-font">Brak danych</span><p>`
        holder.appendChild(title);
    }
}

function handleSearchClick() {
    const inputValue = input.value;
    holder.innerHTML = '';
    if (!inputValue) {
        alert('Najpierw należy wpisać szukaną frazę')
    } else {
        findName(inputValue).then(data => {
            createResultList(fakePositiveApiData);
        }).catch(err => {
            const message = `Error: ${err}`;
            alert(message)
            throw new Error(message)
        });

    }
}

/** action **/
searchButton.addEventListener("click", () => {
    handleSearchClick();
});

input.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchClick();
    }
})

