import QueryBuilder from './QueryBuilder.js';

class Creator extends QueryBuilder {
  async run() {
    const { table, columns, valuesArgs } = this;
    const fields = columns.join(', ');
    const placeholders = valuesArgs.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table}(${fields}) VALUES(${placeholders});`;
    return this.executor(sql, valuesArgs);
  }
}

export default Creator;
