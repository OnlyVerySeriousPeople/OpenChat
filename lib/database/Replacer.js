import QueryBuilder from './QueryBuilder.js';

class Replacer extends QueryBuilder {
  async run() {
    const { table, columns, valuesArgs } = this;
    const fields = columns.join(', ');
    const placeholders = valuesArgs.map(() => '?').join(', ');
    const sql = `REPLACE INTO ${table}(${fields}) VALUES(${placeholders});`;
    return this.executor(sql, valuesArgs);
  }
}

export default Replacer;
