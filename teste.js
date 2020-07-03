
let locations = [1,2,2,3,45];

let test = 'teste'

const len = (locations) => {
  if(!Array.isArray(locations)) return 0;

  return locations.length
}

console.log(len(test))
