export function arrayIndexOf(src: Uint8Array, needle: Uint8Array): number {
    const needleLen = needle.length
    if (src.length < needleLen) return -1
    for (let i = 0; i < src.length - needleLen + 1; i++) {
        let found = true
        for (let k = 0; k < needle.length; k++) {
            if (src[i + k] !== needle[k]) {
                found = false
                break
            }
        }
        if (found) {
            return i
        }
    }
    return -1
}

export function arrayConcat(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
    const result = new Uint8Array(arr1.length + arr2.length)
    result.set(arr1)
    result.set(arr2, arr1.length)
    return result
}
