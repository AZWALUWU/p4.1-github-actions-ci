const tambah = require('./index');

test('menambahkan 1 + 2 untuk menghasilkan 3', () => {
  expect(tambah(1, 2)).toBe(3);
});
