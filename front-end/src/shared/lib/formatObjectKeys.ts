import * as _ from 'lodash-es'

export default function formatObjectKeys<T extends { [key: string]: any }, U>(target: T, f: Function): U {
  const result: { [key: string]: any } = {}
  
  for (const key in target) {
    const value = target[key]

    if (value !== null && !Array.isArray(value) && typeof value === 'object') {
      result[f(key)] = formatObjectKeys(value, f)
    } else {
      result[f(key)] = value
    }
  }

  return result as U
}
