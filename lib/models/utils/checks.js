export function exists(data) {
  if (!data.length) throw new Error('data does not exist');
  return data;
}

export function unique(data) {
  if (!data.length) return null;
  const [entity, duplicate] = data;
  if (duplicate) throw new Error('entity is not unique');
  return entity;
}
