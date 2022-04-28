/**
* A few handy functions
**/



/**
 * median - Computes the median of a typed array.  This will not work for a
 * standard array as js will sort it alphabetically.
 *
 * @param  {TypedArray} array Array of numbers
 * @return {Number}           The median of the array
 */
function median (array) {
  array.sort();
  var mid = array.length / 2;
  return mid % 1 ? array[mid - 0.5] : (array[mid - 1] + array[mid]) / 2;
}



/**
 * average - Computes the average of an array. Works on TypedArray!
 *
 * @param  {Array} array Array of numbers
 * @return {Number}      Average of the array
 */
function average(array) {
  return array.reduce((a, b) => a + b) / array.length
}



/**
 * sum - Computes the sum of an array. Works on TypedArray!
 *
 * @param  {Array} array Array of numbers
 * @return {Number}      Sum of the array
 */
function sum(array) {
  return array.reduce((a,b)=>a+b);
}



function bitWiseDifference(array1, array2) {
  diff = [];
  if (array1.length == array2.length){
    for (var i = 0; i < array1.length; i++) {
      diff.push(array1[i] - array2[i]);
    }
  }
  return diff
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};



// Sleep for a certain ms time.
// Handy because it does not require computation.
// However, we can't get below a ms
async function sleep(ms) {
  await new Promise(r => setTimeout(r, ms));
}



/**
 * getRandomInt - Creates a random int comprised in [0,max[
 *
 * @param  {Number} max Maximum value
 * @return {Number}     Random integer
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}



/**
 * getRandomFloat - Creates a random float comprised in [0,max[
 *
 * @param  {Number} max Maximum value
 * @return {Number}     Random Float
 */
function getRandomFloat(max) {
  return Math.floor(Math.random() * max);
}

function copy_results() {
  /* Get the text field */
  var copyText = document.getElementById("results_div");

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

   /* Copy the text inside the text field */
  navigator.clipboard.writeText(copyText.value);

  /* Alert the copied text */
}
