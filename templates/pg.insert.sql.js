/*
  Result is PostgreSql bulk INSERT syntax
*/
into = req.table;
if(vars.into) into = vars.into; // allow defining your own target table name

dec = vars.dec ? true : false ; // when set to true string values are decoded with Html. NB! You need to create decodeHtml fn your own or install decodeHtml package and add it as new export fn for db's
dollars = vars.dollars || "$$"; // defaults to $$ to avoid single quotes syntax errors

function addDblQuotes(o) { return '"' + o + '"'; }
function strEsc(s) { return dollars + (dec ? decodeHtml(s) : s) + dollars; }
function bool(v)   { if (v) return 'TRUE'; else return 'FALSE'; }
function rDate(d)  { return (d=="0-01-01" || d == "0000-00-00") ? "'0001-01-01'" : "'"+d+"'"; }
function rDateTime(d)  { return (d=="0-01-01 00:00:00" || d == "0000-00-00 00:00:00") ? "0001-01-01 00:00:00" : d; }

types = result.types;
rows  = result.data;
cols = result.cols;

br = vars.plain ? "\n" : "<br>";

cols = "INSERT INTO " + addDblQuotes(into) + " (" + cols.map(function(col){ return addDblQuotes(col) }).join() + ") VALUES" + br;

if(!vars.plain) print('<html><head><title>'+into+'</title><meta charset="UTF-8"></head><body>');

rows.forEach(function(row,i){
  var ret = [], rowKeys = Object.keys(row), sep = (i === rows.length - 1) ? ';' : ',' + br;

  rowKeys.forEach(function(key,ci) {
    col = row[key];
    if(!col && typeof(col)==='object') col = 'NULL';
    else if (types[ci] === "str") col = strEsc(col);
    else if (types[ci] === 'timestamp' || types[ci] === 'datetime') col = strEsc(rDateTime(col));
    else if (types[ci] === 'bool') col = bool(col);
    else if (types[ci] === 'date') col = rDate(col);

    ret.push(col);
  });
  
  if(!i) print(cols);
  print('(' + ret.join(', ') + ')' + sep);
});

if(!vars.plain) print('</body></html>');