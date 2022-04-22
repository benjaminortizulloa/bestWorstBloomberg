function parseRankData(text) {
  var rankData = {options: {}, columns: [], data: []};
  var reading = "options"
  d3.csv.parseRows(text).forEach(function(row) {
    var length = row.length;
    if (length > 0) {
      if (reading == "options") {
        if (row[0] == "###") {
          reading = "columns";
        } else {
          var key = row[0].trim();
          var value = (length > 1) ? row[1] : null;
          if (value) {
            value = value.trim();
            if (value.length == 0) {
              value = null;
            }
          }
          rankData.options[key] = value;
        }
      } else if (reading == "columns") {
        var field = row[0];
        if (field == null || field.trim() == '') {
          reading = "data";
        } else {
          field = field.trim();
          for (var index = 1; index < length; index++) {
            if (rankData.columns.length < index) {
              rankData.columns.push({});
            }
            rankData.columns[index-1][field] = row[index];
          }
        }
      }
      if (reading == "data") {
        var dataRow = [];
        for (var index = 1; index < length; index++) {
          dataRow.push(row[index]); 
        }
        rankData.data.push(dataRow);
      }          
    }        
  });
  return rankData;
}