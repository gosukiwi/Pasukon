// Taken from: https://github.com/elidoran/flatten-array/blob/master/lib/index.js
// flatten arrays into a single array.
// NOTE:
//   this mutates the specified array.
//   if you want to avoid that, then wrap your array:
//     flatten([myArray])
module.exports = function flatten (array) {

  // usual loop, but, don't put `i++` in third clause
  // because it won't increment it when the element is an array.
  for (let i = 0; i < array.length; ) {

    const value = array[i]

    // if the element is an array then we'll put its contents
    // into `array` replacing the current element.
    if (Array.isArray(value)) {

      // only process `value` if it has some elements.
      if (value.length > 0) {

        // to provide the `value` array to splice() we need to add the
        // splice() args to its front.
        // these args tell it to splice at `i` and delete what's at `i`.
        value.unshift(i, 1)

        // NOTE:
        // This is an in-place change; it mutates `array`.
        // To avoid this, wrap your array like: flatten([myarray])
        array.splice.apply(array, value)

        // take (i, 1) back off the `value` front
        // so it remains "unchanged".
        value.splice(0, 2)
      } else {
        // remove an empty array from `array`
        array.splice(i, 1)
      }

      // NOTE: we don't do `i++` because we want it to re-evaluate
      // the new element at `i` in case it is an array,
      // or we deleted an empty array at `i`.

    } else {
      // it's not an array so move on to the next element.
      i++
    }
  }

  // return the array so `flatten` can be used inline.
  return array
}
