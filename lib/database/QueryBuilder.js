const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class QueryBuilder {
  constructor(database, table) {
    this.database = database;
    this.table = table;
    this.columns = ['*'];
    this.whereClause = undefined;
    this.whereArgs = [];
    this.valuesArgs = [];
    this.executor = database.execute.bind(database);
  }

  where(conditions) {
    let clause = '';
    const args = [];
    Object.entries(conditions).forEach(([key, value]) => {
      let processedValue = value;
      let condition;
      if (typeof value === 'number') {
        condition = `${key} = ?`;
      } else if (typeof value === 'string') {
        if (value.includes('*') || value.includes('?')) {
          processedValue = value.replace(/\*/g, '%').replace(/\?/g, '_');
          condition = `${key} LIKE ?`;
        } else {
          condition = `${key} = ?`;
        }
      }
      args.push(processedValue);
      clause = clause ? `${clause} AND ${condition}` : condition;
    });
    this.whereClause = clause;
    this.whereArgs = args;
    return this;
  }

  fields(list) {
    this.columns = list;
    return this;
  }

  setValues(list) {
    this.valuesArgs = list;
    return this;
  }

  value(name) {
    this.mode = MODE_VALUE;
    this.valueName = name;
    return this;
  }

  row() {
    this.mode = MODE_ROW;
    return this;
  }

  col(name) {
    this.mode = MODE_COL;
    this.columnName = name;
    return this;
  }

  count() {
    this.mode = MODE_COUNT;
    return this;
  }

  order(name) {
    this.orderBy = name;
    return this;
  }

  commit() {
    this.executor = this.database.safeExecute.bind(this.database);
    return this;
  }
}

export default QueryBuilder;
