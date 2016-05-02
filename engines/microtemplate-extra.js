// this is similar to microtemplate but adds a lot of functions


Date.prototype.removeTime = function () {
  var d = new Date(this.valueOf());
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

Date.prototype.add = function (years, months, days, hours, min, sec) {
  var
  y = this.getFullYear(),
  m = this.getMonth(),
  d = this.getDate(),
  h = this.getHours(),
  i = this.getMinutes(),
  s = this.getSeconds();
  return new Date(
     !years  ? y: y + years
    ,!months ? m: m + months
    ,!days   ? d: d + days
    ,!hours  ? h: h + hours
    ,!min    ? i: i + min
    ,!sec    ? s: s + sec
  );
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

Array.prototype.findIndex = function (fn) { for (var i = 0; i < this.length; i++) if (fn(this[i])) return       i; return undefined; }
Array.prototype.find      = function (fn) { for (var i = 0; i < this.length; i++) if (fn(this[i])) return this[i]; return undefined; }

// For convenience...
Date.prototype.format = function (mask, utc) { return dateFormat(this, mask, utc); };

String.prototype.toDate = function () {
  var m = this.match(/^(\d\d\d\d)-(\d\d)-(\d\d)( (\d\d):(\d\d):(\d\d))?$/);
  if (m) return new Date(
    parseInt(m[1]), parseInt(m[2], 10) - 1, parseInt(m[3], 10),
    parseInt(m[5]||0, 10), parseInt(m[6]||0, 10), parseInt(m[7]||0, 10)
 );
  m = this.match(/^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\.000Z$/);
  if (m) return new Date(
    parseInt(m[1]), parseInt(m[2], 10) - 1, parseInt(m[3], 10),
    parseInt(m[4]||0, 10), parseInt(m[5]||0, 10), parseInt(m[6]||0, 10)
  );
  return null;
};
function escHtml(str) { return !str ? '' : String(str) .replace(/&/g, "&amp;") .replace(/"/g, "&quot;") .replace(/'/g, "&#39;") .replace(/</g, "&lt;") .replace(/>/g, "&gt;"); };
encUrl = encodeURIComponent;

if (query('_schema', {where: "tablename=tr", select: "count(*)>0@exists"}).data[0].exists) {
    tr = query('tr').data;
} else {
    tr = [];
}

var translations = {};
for (var t in tr) {
    if (!translations[tr[t].lang]) {
        translations[tr[t].lang] = {};
    }

    translations[tr[t].lang][tr[t].label] = tr[t].content;
}

var activeTranslation = vars.lang;
var toDb = [];
var debug = null;
var transl;

function _translate ( body ) { 
  transl = body.match(/(?=<!(?!DOCTYPE|--))([\s\S]*?<!>)/igm);
      if (transl && transl.length > 0) {
          for ( t = 0; t < transl.length; t++) {
              
              //finding all block to be translated is working
              block = transl[t];
              var blockAttributes;
              var res = block.match(/<!([^: ]+:[^<>]+)>/);

              if ( res && res[1] ) {
                  blockAttributes = res[1].split(" ");
              }
              
              attributeName = block.match(/<!(.*?)>/)[1];

              if (blockAttributes) { 
                  re = new RegExp("<!" + attributeName + "(.*?)>(.*?)<!>","");
                  blockToBeTranslated = block.match(re)[2];

                  for (i = 0; i < blockAttributes.length; i++) {
                      attrName = blockAttributes[i].split(':')[0];
                      attrValue = blockAttributes[i].split(':')[1];

                          rep = new RegExp(attrName + '="([^"]*)"',"");
                          val = blockToBeTranslated.match(rep);

                          debug=reg = new RegExp(attrName + '="(.+?)"', "g"); 
                          blockToBeTranslated = (translations[activeTranslation] && translations[activeTranslation][attrValue] ? 
                              blockToBeTranslated.replace(reg, attrName + '="' + translations[activeTranslation][attrValue] + '"') :
                              blockToBeTranslated);

                          toDb.push({
                              label: attrName,
                              content: (val ? val[1] : '')
                          });
                      //block = block.replace(block, blockToBeTranslated);
                  }
                  body = body.replace(block, blockToBeTranslated);
                  
              } else {
                  
                  //replacing single translations is working
                  var re = new RegExp("<!" + attributeName + "(.*?)>(?:\\s*?)(.*?)(\\s*?)<!>","");
                      attributeText = block.match(re)[2];
                  var replace = ( translations[activeTranslation] && translations[activeTranslation][attributeName] ? translations[activeTranslation][attributeName]  : attributeText );

                  toDb.push({
                      label: attributeName,
                      content: attributeText
                  });

                  body = body.replace(block, replace);
              }
          }
      }
  return body;
}

if (!vars.debugjs) { template = _translate(template); }

fnBody =
    template.split("%>").map(function (p) {
        return p.split("<%").map(function (pp, i) {
          if (!pp) return ""; else
          if (i && pp.charAt(0) == "=") return "print( (" + pp.substr(1) + ").toString() );"; else // TODO: zazler should take any value
          if (i && pp.charAt(0) == "~") return "print( escHtml(" + pp.substr(1) + ") );"; else
          if (!i) return "print( " + JSON.stringify(pp) + " );"; else
          return pp;
        }).join("\n");
      }).join("\n");

if (vars.showTranslations == 1) { contentType('application/json', 'utf-8'); print(JSON.stringify(toDb)); }
else if (vars.debugjs)          { contentType('text/plain', 'utf-8'); print(fnBody); }
else                            { contentType("text/html",  "utf-8"); eval(fnBody);  }


