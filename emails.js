var request   = require('request')
  , Q         = require('q')
  , titlecase = require('titlecase')
  ;

var guid = '8f343728085a483ab505432a2ea8c5a9';

function current() {
  var deferred = Q.defer();
  request.get('https://retailerservices.diamondcomics.com/Widgets/NewReleasesComics/' + guid, function(err, response, body) {
    if(err || response && response.statusCode !== 200) {
      deferred.reject(err || body);
    } else {
      try {
        var document = { write: function() { }, getElementById: function() { return { innerHTML: null }; } }
          , result
          , settings
          , weeks
          ;

        /* jshint es5:false */
        /* jshint evil:true */
        result = eval(body);
        settings = eval('DmdNTWSettings_' + guid);
        /* jshint evil:false */

        weeks = settings.dates.map(function(date, idx) {
          return {
            release: new Date(date),
            guid: guid,
            items: settings.pageItems[idx]
          };
        });
        deferred.resolve(weeks);
      }
      catch(e) {
        deferred.reject(e);
      }
    }
  });
  return deferred.promise;
};

function make() {
  current()
    .then(function(weeks) {
      return Q.Promise(function(resolve, reject) {

        var items = weeks[0].items;
        var pubs  = {};

        items.forEach(function(item) {
          var publisher = item.Publisher;
          var title     = item.Title;

          if(!pubs[publisher]) {
            pubs[publisher] = [];
          }

          pubs[publisher].push(title);
        });

        var keys = Object.keys(pubs);
        keys.forEach(function(key) {
          var betterpub = titlecase(key.toLowerCase());
          console.log(betterpub);

          var titles = pubs[key].sort(function(a, b) {
            return a.localeCompare(b);
          });
          titles.forEach(function(title) {
            var bettertitle = titlecase(title.toLowerCase());
            console.log(bettertitle);
          });

          console.log('\n');

        });

      });
    })
    .catch(function(err) {
      console.log(err);
    });
}

make();
