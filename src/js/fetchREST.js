import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';
import { DEBOUNCE_DELAY, countryList, logo, worldMap } from './vars';
import { clearWorldMap } from './map';
import { createMarkup } from './markup';

const BASE_URL = 'https://restcountries.com/v3.1/name/';

var countrySearch = '';
var restUrl = '';

const searchParams = new URLSearchParams({
  fields: ['name', 'capital', 'population', 'flags', 'languages', 'cca2'],
});

export var debouncedSearch = debounce(
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

function fetchData(url) {
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}
