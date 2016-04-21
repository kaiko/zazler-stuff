contentType("application/json", "utf-8");

var refMatch = /\(([^\)]+)\) REFERENCES ([^(]+)\(([^)]+)\)/;
var log = []

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

/*
 * Make list of references to given table.
 */
function fkeysTo(table) {
  return query("_meta",
    { where: "like(value,REF)", REF: "%) REFERENCES " + table + "(%"
    , select: "tablename,value"
    , opts: "map"}).
  data.
  map(function (r) { r['fkey'] = r.value.match(refMatch); return r; }).
  filter(function (r) { return r.fkey !== null }).
  map(function (r) {
    return {
        fromTable:  r.tablename
      , fromFields: r.fkey[1].split(', ')
      , toFields:   r.fkey[3].split(', ') } });
}

// Filters variables with given namespace
function filterNS(vars, ns) {
  var r = {};
  Object.keys(vars).forEach(function(key) {
    if (key.substr(0, ns.length + 1) == ns + ":") 
      r[key] = vars[key];
  });
  return r;
}

// Variable that must be defined
// if (!vars.sub) throw "tree.json expect variable 'sub' to be described. Use json if tree is not needed.";

// ref[table] = [ references-to-this-table ]
// ref[] = { from: table, to: table, fields: [ { a: id, b: foo } ] // key is from 
// easiest ref: 
// ref.push( { from: "company", to: "user", fields: { id: "company" } } )
var ref = [];
var sub = (vars.sub || '').split(',')
sub.concat([req.table]).forEach(function (t) {
  fkeysTo(t).forEach(function (r) {
    ref.push( { from: r.fromTable, to: t, fields: r.fromFields.reduce(function (fs, f, i) { fs[f] = r.toFields[i]; return fs; }, {}) } )
  });
})

/*
 * subWhere           -- describes subqueries that have to be made
 *  [table]           -- for what table it describes
 *   [toTable]        -- from what table queries have to be made
 *    = { varId:    _ -- variable identificator (`"V" + num` is used to set variables)
 *      , refField: _ -- remote field with table
 *      , valField: _ -- where value is taken from here
 *      }
 */
var varC = 0       // identification variable counter
var subWhere = {} 
ref.forEach(function (R) { 
  if (!subWhere[R.from]) subWhere[R.from] = {};
  if (!subWhere[R.from][R.to]) subWhere[R.from][R.to] = [];
  Object.keys(R.fields).forEach(function (f, i) {
    subWhere[R.from][R.to].push( { varId: ++varC, valField: f, refField: R.fields[f] } )
  })
})

function fillSub(res) {
  
  // if no subqueries found, return
  var wheres = subWhere[res.tableName]; // clone
  if (!wheres) return;
  var whereTables = Object.keys(wheres);

  // for each row, for each where table for every field
  res.data.forEach(function (row) {
    whereTables.forEach(function (table) {
      var allOk = true;
      var wVar = {}
      wheres[table].forEach(function (w) {
        if (!allOk) return;
        if (!row[w.valField]) return allOk = false;
        wVar['where.' + w.varId] = w.refField + '=V' + w.varId;
        wVar['V' + w.varId] = row[ w.valField ];
      });
      if (!allOk)  {
        row[ '@' + wheres[table][0].valField ] = null;
      } else {
        var subResult = query(table, Object.assign(wVar, filterNS(vars, table)));
        // log.push(table);
        // log.push(Object.assign(wVar, filterNS(vars, table)))
        fillSub(subResult);
        row[ wheres[table][0].valField ] = subResult.data;
      }
    })
  })
}
fillSub(result);

print(JSON.stringify(result.data));
// print(JSON.stringify({log: log, sub: sub, ref: ref, subWhere: subWhere, result: result}));

