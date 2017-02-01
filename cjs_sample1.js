function ctrl(data) {
  var groups = [];

  if (data.groupBy) {
    groups = data.rows.reduce(function (acc, row) {
      var key = row[data.groupBy];

      if (!acc[key])
        acc[key] = [];

      acc[key].push(row);

      return acc;
    }, {});

    groups = Object.values(groups);
  } else {
    groups = data.rows.map(function (row) { return [row]; });
  }

  var aggregated = null;

  if (data.aggregate) {
    aggregated = groups.map(data.aggregate);
  }

  return {
    groups: groups,
    aggregated: aggregated,
    columns: data.columns,
    groupBy: data.groupBy
  };
}

function view(ctrl) {
  return c("table", [
      c("thead", [
        c("tr", [
          ctrl.columns.map(function (col) { return c("th", col.title); }) 
        ])
      ]),
      c("tbody", [
        ctrl.groups.map(function (group, groupIndex) {
          return group.map(function (row, rowIndex) {
            return c("tr", [
              ctrl.columns.map(function (col) {
                if (rowIndex == 0 && col.field == ctrl.groupBy && ctrl.aggregated) {
                  return c("td", { rowspan: group.length + 1 }, [ row[col.field] ]);
                } else if (rowIndex == 0 && col.field == ctrl.groupBy && !ctrl.aggregated) {
                  return c("td", { rowspan: group.length }, [ row[col.field] ]);
                } else if (rowIndex > 0 && col.field == ctrl.groupBy) {
                  return null;
                } else {
                  return c("td", [ row[col.field] ]);
                }
              })
            ])
          }).concat(ctrl.aggregated ? [
            c("tr", [
              c("td", { colspan: ctrl.columns.length - 1 }, ctrl.aggregated[groupIndex])
            ])
          ] : [])
        })
      ])
    ]);
}