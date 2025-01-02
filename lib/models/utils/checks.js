export default function exists(data) {
  if (!data.length) throw new Error('data does not exist');
  return data;
}
