import { afterEach, describe, expect, it, jest } from '@jest/globals';

import Database from '../../../lib/database/Database.js';

describe('Database', () => {
  it('select: where', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.select('user').where({ id: 1 }).run();
    expect(db.execute).toHaveBeenCalledWith(
      'SELECT * FROM user WHERE id = ?;',
      [1],
    );
  });

  it('select: fields', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.select('user').fields(['id', 'nickname']).run();
    expect(db.execute).toHaveBeenCalledWith(
      'SELECT id, nickname FROM user;',
      [],
    );
  });

  it('select: fields', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.select('user').fields(['id', 'nickname']).run();
    expect(db.execute).toHaveBeenCalledWith(
      'SELECT id, nickname FROM user;',
      [],
    );
  });

  it('add: fields, setValues', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.add('user')
      .fields(['nickname', 'password'])
      .setValues(['sigma777', 'kolya@sigma777'])
      .run();
    expect(db.execute).toHaveBeenCalledWith(
      'INSERT INTO user(nickname, password) VALUES(?, ?);',
      ['sigma777', 'kolya@sigma777'],
    );
  });

  it('replace: fields, setValues', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.replace('user')
      .fields(['nickname', 'password'])
      .setValues(['sigma777', 'kolya@sigma777'])
      .run();
    expect(db.execute).toHaveBeenCalledWith(
      'REPLACE INTO user(nickname, password) VALUES(?, ?);',
      ['sigma777', 'kolya@sigma777'],
    );
  });

  it('value', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    const instance = db.select('user').value('nickname').where({ id: 3 });
    expect(instance.mode).toBe(1);
    expect(instance.valueName).toBe('nickname');
  });

  it('row', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    const instance = db.select('user').row().where({ id: 3 });
    expect(instance.mode).toBe(2);
  });

  it('col', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    const instance = db.select('user').col('nickname');
    expect(instance.mode).toBe(3);
    expect(instance.columnName).toBe('nickname');
  });

  it('count', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    const instance = db.select('user').count();
    expect(instance.mode).toBe(4);
  });

  it('select: order', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.select('user').order('nickname').run();
    expect(db.execute).toHaveBeenCalledWith(
      'SELECT * FROM user ORDER BY nickname;',
      [],
    );
  });

  it('update: fields, setValues, where', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.update('user')
      .fields(['nickname'])
      .setValues(['myNewNickname'])
      .where({ id: 2 })
      .run();
    expect(db.execute).toHaveBeenCalledWith(
      'UPDATE user SET nickname = ? WHERE id = ?;',
      ['myNewNickname', 2],
    );
  });

  it('delete: where', () => {
    const db = new Database({}, console);
    db.execute = jest.fn();
    db.delete('user').where({ id: 1 }).run();
    expect(db.execute).toHaveBeenCalledWith('DELETE FROM user WHERE id = ?;', [
      1,
    ]);
  });

  it('add: fields, setValues, commit', () => {
    const db = new Database({}, console);
    db.safeExecute = jest.fn();
    db.add('user')
      .fields(['nickname', 'password'])
      .setValues(['rico14', 'qwerty321@'])
      .commit()
      .run();
    expect(db.safeExecute).toHaveBeenCalledWith(
      'INSERT INTO user(nickname, password) VALUES(?, ?);',
      ['rico14', 'qwerty321@'],
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
