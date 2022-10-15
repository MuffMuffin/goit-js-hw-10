import Notiflix from 'notiflix';
import { inputField, logo, countryList, countryInfo, worldMap } from './vars';
import { modifyWorldMap, clearWorldMap, modifyCountryMap } from './map';
import { wikiDescription } from './wiki';

export function createMarkup(data) {
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
        fitText('.country-name-one', 1000, 35, 20);
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
    makeClickable();
  }
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
