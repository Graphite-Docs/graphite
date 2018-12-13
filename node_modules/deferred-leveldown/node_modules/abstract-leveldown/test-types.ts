import { AbstractLevelDOWN } from '.'

const buf = Buffer.from('foo')

// Key and value generics
new AbstractLevelDOWN<string, string>('loc').put('key', 'value', (err: Error) => {})
new AbstractLevelDOWN<Buffer, Buffer>('loc').put(buf, buf, (err: Error) => {})
new AbstractLevelDOWN<number, object>('loc').put(1, {}, (err: Error) => {})

new AbstractLevelDOWN<string, string>('loc').get('key', (err: Error, value: string) => {})
new AbstractLevelDOWN<Buffer, Buffer>('loc').get(buf, (err: Error, value: Buffer) => {})
new AbstractLevelDOWN<number, object>('loc').get(1, (err: Error, value: object) => {})

// The generics default to "any"
new AbstractLevelDOWN('loc').put(1, {}, (err: Error) => {})
new AbstractLevelDOWN('loc').put('key', 'value', (err: Error) => {})
new AbstractLevelDOWN('loc').put(buf, false, (err: Error) => {})

new AbstractLevelDOWN('loc').get(1, (err: Error, value: any) => {})
new AbstractLevelDOWN('loc').get('key', (err: Error, value: any) => {})
new AbstractLevelDOWN('loc').get(buf, (err: Error, value: any) => {})

// Test that iterator.next() returns this
const db = new AbstractLevelDOWN('loc')
const iterator = db.iterator().next(function (err: Error, key: any, value: any) {})
iterator.end(function (err: Error) {})
