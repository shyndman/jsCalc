(function() {
  var tosser = window.tosser = {},
      unknownUnits = [
        'em', 'ex', 'ch', 'rem',
        'vh', 'vw', 'vmin', 'vmax'
      ],
      knownUnits = {
        'mm': 96 / 25.4,
        'cm': 96 / 2.54,
        'in': 96,
        'pt': 4 / 3
      },
      measurementHtml = buildMeasurementHtml(),
      replacementPattern = buildReplacementPattern();

  /**
   * options:
   *     container: Element
   *     containerUnits: Object<string, number>
   *     vertical: boolean (default: false)
   */
  tosser.evaluate = function(expression, options) {
    var units = options.containerUnits ||
                tosser.resolveContainerUnits(options.container);

    return eval(
      expression
        .trim()
        .replace(/^calc/, '')
        .replace(replacementPattern, function(m, v, _, unit) {
          var value = parseFloat(v);
          switch (unit) {
            case 'px':
              return value;
            case '%':
              return value * units[options.vertical ? 'v%' : 'h%'];
            default:
              return value * (units[unit] || knownUnits[unit]);
          }
        }));
  };

  /**
   *
   */
  tosser.resolveContainerUnits = function(container) {
    var el = document.createElement('div');
    el.id = 'text-resize-control';
    el.position = 'absolute';
    el.style.visibility = 'hidden';
    el.innerHTML = measurementHtml;
    container.insertBefore(el, container.firstChild);

    var units = unknownUnits.reduce(function(acc, unit) {
      acc[unit] = container.querySelector('.tosser--' + unit).clientWidth;
      return acc;
    }, {});

    var percentEl = container.querySelector('.tosser--percent');
    units['h%'] = percentEl.clientWidth / 100;
    units['v%'] = percentEl.clientHeight / 100;

    container.removeChild(el);

    return units;
  }

  /**
   *
   */
  function buildMeasurementHtml() {
    var measurers = unknownUnits.map(function(unit) {
      return '<div class="tosser--' + unit + '" style="width:1' + unit + '"></div>';
    });
    measurers.push('<div class="tosser--percent" style="width:100%;height:100%"></div>');
    return measurers.join('');
  }

  /**
   *
   */
  function buildReplacementPattern() {
    var units = unknownUnits.concat(Object.keys(knownUnits)).join('|');
    return new RegExp('(\\d+(\\.\\d+)?)(' + units + '|%|px)', 'g');
  }
})();