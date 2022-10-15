import './css/styles.css';
import './css/custom.css';
import { inputField, countryInfo } from './js/vars';
import { prepMap } from './js/map';
import { debouncedSearch } from './js/fetchREST';

prepMap();

countryInfo.style.opacity = 0;
inputField.placeholder = 'Enter country name';

inputField.addEventListener('focus', event => {
  event.target.value = '';
});

inputField.addEventListener('input', debouncedSearch);
