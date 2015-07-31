(function(exports) {

  var resultsRoot = document.querySelector('.search-results');
  var query = location.search;
  if (!query) {
    resultsRoot.classList.add('hidden');
    return;
  }

  // TODO: include formdb, querystring, and tagalong
  var form = new formdb.Form('#search-form');
  var values = querystring.parse(query.substr(1));
  removeEmptyValues(values);
  console.debug('[search] form values:', values);
  form.setData(values);

  picc.ui.expandAccordions(function() {
    var inputs = this.querySelectorAll('[name]');
    return [].some.call(inputs, function(input) {
      return values[input.name];
    });
  });

  var format = picc.format;

  resultsRoot.classList.add('js-loading');
  picc.API.search(values, function(error, data) {
    resultsRoot.classList.remove('hidden');
    resultsRoot.classList.remove('js-loading');

    if (error) {
      return showError(error);
    }

    console.log('loaded schools:', data);
    resultsRoot.classList.add('js-loaded');

    console.time('[render]');

    console.time('[render] template');
    // render the basic DOM template for each school
    tagalong(resultsRoot, data, {
      results_word: format.plural('total', 'Result'),
      results_total: format.number('total', '0')
    });

    var resultsList = resultsRoot.querySelector('.schools-list');
    tagalong(resultsList, data.results, picc.school.directives);

    console.timeEnd('[render] template');

    console.timeEnd('[render]');
  });

  function showError(error) {
    console.error('error:', error);
    resultsRoot.classList.add('js-error');
    var message = resultsRoot.querySelector('.error-message');
    message.textContent = String(error.responseText || 'There was an unexpected API error.');
  }

  function removeEmptyValues(obj) {
    var empty = function(v) {
      return v === null || v === '';
    };
    for (var key in obj) {
      if (empty(obj[key])) {
        delete obj[key];
      }
    }
    return obj;
  }

})(this);
