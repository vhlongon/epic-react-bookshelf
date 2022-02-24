import {formatDate} from '../misc'

test('formatDate formats the date to look nice', () => {
  expect(formatDate(new Date(2019, 0, 1))).toBe('Jan 19')
})
