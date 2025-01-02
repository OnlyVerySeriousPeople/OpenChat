import QueryBuilder from './QueryBuilder.js';

const MODE_ROWS = 0;
const MODE_VALUE = 1;
const MODE_ROW = 2;
const MODE_COL = 3;
const MODE_COUNT = 4;

class Selector extends QueryBuilder {
  constructor(database, table) {
    super(database, table);
    this.mode = MODE_ROWS;
    this.orderBy = undefined;
  }

  async run() {
    const { table, columns, whereArgs } = this;
    const { whereClause, orderBy } = this;
    const fields = columns.join(', ');
    let sql = `SELECT ${fields} FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (orderBy) sql += ` ORDER BY ${orderBy}`;
    sql += ';';
    const res = await this.executor(sql, whereArgs);
    const modeHandlers = new Map([
      [
        MODE_VALUE,
        (result) => {
          const [row] = result;
          return row[this.valueName];
        },
      ],
      [MODE_ROW, (result) => result[0]],
      [MODE_COL, (result) => result.map((row) => row[this.columnName])],
      [MODE_COUNT, (result) => result.length],
    ]);
    const handler = modeHandlers.get(this.mode);
    if (handler) {
      return handler(res);
    }
    return res;
  }
}

export default Selector;
