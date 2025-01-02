import QueryBuilder from './QueryBuilder.js';

class Updater extends QueryBuilder {
  async run() {
    const { table, columns } = this;
    const { whereClause, whereArgs, valuesArgs } = this;
    const fields = columns.map((column) => `${column} = ?`).join(' ,');
    let sql = `UPDATE ${table} SET ${fields}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    sql += ';';
    return this.executor(sql, [...valuesArgs, ...whereArgs]);
  }
}

export default Updater;
