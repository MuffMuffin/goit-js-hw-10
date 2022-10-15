export function wikiDescription(country) {
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

        const listens = wikiFragment.querySelectorAll('.haudio');
        [...listens].forEach(element => {
          element.parentElement.remove();
        });

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
