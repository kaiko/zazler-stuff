contentType("application/json", "utf-8");
// TODO: put it into Zazler default
// TODO: add rawType "json" also here
result.cols.map(function (colName, colId) {
  var meta = result.colsMeta[colName];
  if (meta && meta.json) 
    result.data.forEach(function (row) { row[ result.cols[colId] ] = JSON.parse( row[ result.cols[colId] ] ) })
});

print(JSON.stringify({ count: result.rowsTotal(), rows: result.data} ));
