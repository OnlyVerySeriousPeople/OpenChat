import QueryBuilder from './QueryBuilder.js';

class Remover extends QueryBuilder {
  async run() {
    const { table } = this;
    const { whereClause, whereArgs } = this;
    let sql = `DELETE FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    sql += ';';
    return this.executor(sql, whereArgs);
  }
}

export default Remover;
