import './css/styles.css';
import './css/custom.css';
// import './js/map';
import './js/renderMarkup';
import './js/getCountry';

import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';

// ---------------------------------------------------------------------------

google.charts.load('current', {
  packages: ['geochart'],
});
google.charts.setOnLoadCallback(drawAll);

var region = 'UA';
var countryDataArray = [['Country', 'Color']];
var mapColors = [];

function drawAll() {
  drawWorldMap();
  drawCountryMap();
}

function drawWorldMap() {
  var data = google.visualization.arrayToDataTable(countryDataArray);

  var options = {
    domain: 'UA',
    enableRegionInteractivity: 'false',
    legend: 'null',
    colorAxis: {
      colors: mapColors,
    },
    backgroundColor: 'transparent',
    datalessRegionColor: '#ccc',
    defaultColor: '#ccc',
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById('world-map')
  );
  chart.draw(data, options);
}

function drawCountryMap() {
  var data = google.visualization.arrayToDataTable([['Country'], [region]]);

  var options = {
    displayMode: 'regions',
    resolution: 'countries',
    domain: 'UA',
    region: region,
    enableRegionInteractivity: 'false',
    legend: 'null',
    backgroundColor: 'transparent',
    datalessRegionColor: 'transparent',
    defaultColor: '#ccc',
  };

  var chart = new google.visualization.GeoChart(
    document.getElementById('country-map')
  );

  chart.draw(data, options);
}

function modifyWorldMap(countries) {
  let counter = 1;
  let countryBlock = [];
  mapColors = [];
  countryDataArray = [['Country', 'Color']];

  countries.forEach(({ short }) => {
    const colorArray = [
      '#9e0142',
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
      '#5e4fa2',
    ];
    mapColors.push(colorArray[counter - 1]);
    countryBlock = [short, counter];
    countryDataArray.push(countryBlock);

    counter += 1;
  });
  drawWorldMap();
}

function clearWorldMap() {
  countryDataArray = [['Country', 'Color']];
  drawWorldMap();
}

function modifyCountryMap(short) {
  region = short;
  drawCountryMap();
}

// ---------------------------------------------------------------------------

function wikiDescription(country) {
  const wiki_url =
    'https://en.wikipedia.org/w/api.php?' +
    new URLSearchParams({
      origin: '*',
      action: 'parse',
      page: country,
      section: '0',
      format: 'json',
    });

  const wikiSummary = document.querySelector('#wiki-summary');
  wikiSummary.innerHTML = 'Fetching summary. Please wait. '.repeat(30);

  fetch(wiki_url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .then(data => {
      try {
        var wikiText = data.parse.text['*'];
      } catch (error) {
        throw new Error(data.error.code);
      }

      let isRedirect = wikiText.indexOf('redirectText');
      if (isRedirect >= 0) {
        throw new Error('Got redirected!');
      }

      let beforeTable = wikiText.indexOf('<table class="infobox');

      if (beforeTable !== -1) {
        wikiText = wikiText.substring(beforeTable);
        let afterTable = wikiText.indexOf('</table>');
        wikiText = wikiText.substring(afterTable + 8);
      }

      let textBegin = wikiText.indexOf('<p>');
      let textEnd = wikiText.lastIndexOf('</p>');
      wikiText = wikiText.substring(textBegin, textEnd + 4);

      try {
        var wikiFragment = document.createDocumentFragment();
        var div = document.createElement('div');
        div.innerHTML = wikiText;
        while (div.firstChild) wikiFragment.appendChild(div.firstChild);

        const divs = wikiFragment.querySelectorAll('div');
        [...divs].forEach(element => {
          element.remove();
        });

        const sups = wikiFragment.querySelectorAll('sup');
        [...sups].forEach(element => {
          element.remove();
        });

        const smalls = wikiFragment.querySelectorAll('small');
        [...smalls].forEach(element => {
          element.remove();
        });

        const links = wikiFragment.querySelectorAll('a');
        [...links].forEach(element => {
          let content = element.textContent;
          let span = document.createElement('span');
          span.textContent = content;
          element.after(span);
          element.remove();
        });

        // const listens = wikiFragment.querySelectorAll('.nowrap');
        // [...listens].forEach(element => {
        //   element.remove();
        // });

        wikiSummary.innerHTML = '';
        wikiSummary.appendChild(wikiFragment);
        wikiSummary.insertAdjacentHTML(
          'beforeend',
          `<a href="https://en.wikipedia.org/wiki/${country}" class="wiki-link"
          ><span class="link-text">Continue reading on Wikipedia</span></a
        >`
        );
      } catch (error) {
        throw new Error(error);
      }
    })
    .catch(error => {
      wikiSummary.innerHTML =
        'Unable to fetch. See console for more details. '.repeat(30);
      console.error('Wiki API Error: ' + error);
    });
}

// ---------------------------------------------------------------------------

const DEBOUNCE_DELAY = 300;

const BASE_URL = 'https://restcountries.com/v3.1/name/';

let countrySearch = '';
let restUrl = '';

const searchParams = new URLSearchParams({
  fields: ['name', 'capital', 'population', 'flags', 'languages', 'cca2'],
});

const inputField = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');

const worldMap = document.querySelector('#world-map');
const countryInfo = document.querySelector('.info-container');

countryInfo.style.opacity = 0;

const logo = document.querySelector('.logo');

inputField.placeholder = 'Enter country name';

var debouncedSearch = debounce(
  event => {
    countrySearch = event.target.value.toLowerCase().trim();
    restUrl = `${BASE_URL}${countrySearch}?${searchParams.toString()}`;
    if (countrySearch !== '') {
      fetchData(restUrl)
        .then(data => {
          createMarkup(data);
        })
        .catch(error => {
          console.error(error);
          Notiflix.Notify.failure(`Oops, there is no country with that name.`);
        });
    } else {
      countryList.innerHTML = ``;
      logo.style.opacity = 1;
      clearWorldMap();
      if (countryInfo.style.opacity == 1) {
        countryInfo.style.opacity = 0;
        worldMap.style.opacity = 1;
      }
    }
  },
  DEBOUNCE_DELAY,
  {
    leading: false,
    trailing: true,
  }
);

inputField.addEventListener('focus', event => {
  event.target.value = '';
});

inputField.addEventListener('input', debouncedSearch);

function fetchData(url) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}

function createMarkup(data) {
  const countries = countryRepack(data);
  if (countries.length > 10) {
    Notiflix.Notify.info(
      'Too many matches found. Please enter a more specific name.'
    );
    return;
  }

  countryList.innerHTML = ``;
  logo.style.opacity = 0;
  countryInfo.style.opacity = 0;
  worldMap.style.opacity = 1;
  clearWorldMap();

  if (countries.length === 1) {
    countryInfo.style.opacity = 1;
    worldMap.style.opacity = 0;
    countries.forEach(
      ({ name, flag, capital, population, languages, short, wiki }) => {
        countryList.insertAdjacentHTML(
          'beforeend',
          `<li class="country-card-one">
        <div class="country-title-one">
          <img
            src="${flag}"
            alt="${wiki} Flag"
            class="country-flag-one"
          />
          <h2 class="country-name-one">${name}</h2>
        </div>
        <div class="detail-container">
        <p class="country-detail">
          Capital: <span class="country-subdetail">${capital}</span>
        </p>
        <p class="country-detail">
          Population: <span class="country-subdetail">${population}</span>
        </p>
        <p class="country-detail">
          Languages: <span class="country-subdetail">${languages.join(
            ', '
          )}</span>
        </p>
        </div>
      </li>`
        );
        fitText('.country-name-one', 600, 35, 20);
        modifyCountryMap(short);
        wikiDescription(wiki);
      }
    );
  } else {
    countries.forEach(({ name, flag, wiki }) => {
      countryList.insertAdjacentHTML(
        'beforeend',
        `<li class="country-card clickable">
        <div class="country-title">
          <img
            src="${flag}"
            alt="${wiki} Flag"
            class="country-flag"
          />
          <h2 class="country-name">${name}</h2>
        </div>
      </li>`
      );
      fitText('.country-name', 550, 18, 12);
    });
    const countryCard = countryList.querySelectorAll('.country-card');
    const colorArray = [
      '#9e0142',
      '#d53e4f',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#e6f598',
      '#abdda4',
      '#66c2a5',
      '#3288bd',
      '#5e4fa2',
    ];
    [...countryCard].forEach((element, index) => {
      element.style.background = `linear-gradient(to bottom, ${colorArray[index]}, transparent 8% 100%)`;
    });
  }
  makeClickable();
  modifyWorldMap(countries);
}

function countryRepack(countryArray) {
  const countries = [];
  const country = {
    name: '',
    capital: '',
    population: '',
    languages: '',
    flag: '',
    short: '',
    wiki: '',
  };
  countryArray.forEach(
    ({ name, capital, population, flags, languages, cca2 }) => {
      country.name = name.official;
      country.capital = capital[0];
      country.population = population.toLocaleString();
      country.languages = Object.values(languages);
      country.flag = flags.svg;
      country.short = cca2;
      country.wiki = name.common;
      countries.push(structuredClone(country));
    }
  );
  return countries;
}

function fitText(element, coeficient, max, min) {
  const countryNames = document.querySelectorAll(element);
  [...countryNames].forEach(name => {
    let size = Math.ceil(coeficient / name.textContent.length);
    if (size > max) {
      size = max;
    } else if (size < min) {
      size = min;
    }
    name.style.fontSize = `${size}px`;
  });
}

function makeClickable() {
  const cards = countryList.querySelectorAll('.clickable');

  const clickable = event => {
    let name = event.currentTarget.querySelector('.country-name').textContent;
    inputField.value = name;
    inputField.dispatchEvent(new Event('input'));
  };

  [...cards].forEach(element => {
    element.addEventListener('click', clickable);
  });
}
