const loadash = require('lodash');

/*ez a függvény ellenőrzi, hogy valóban van-e olyan product, ami a rendelésben érkezett
és ki is számolja a rendelés végösszegét. Hiba esetén visszatér a hibával.
*/
const checkProducts = (requestObject, products) => {
    const error = []
    let errorIds = ''
    let fullCharge = null
    requestObject.map(obj => {
        loadash.forEach(obj, function (value, key) {
            if (key == '_id') {
                let talalat = products.filter(product => JSON.stringify(product._id) === JSON.stringify(value._id));
                if (talalat.length === 0) {
                    error.push(value)
                } else {
                    console.log(talalat[0].price)
                    obj = Object.assign(obj, { price: talalat[0].price }, { productName: talalat[0].name }, { storno: false })
                    console.log(obj)
                    console.log(obj.quantity)
                    if (obj.quantity < 1) {
                        errorIds = obj._id._id
                        throw new Error(`Products with this ids: ( ${errorIds} ) can not be 0!`)
                    }
                    fullCharge += talalat[0].price * obj.quantity
                }
            }
        })

    })
    if (error.length > 0) {
        error.forEach(err => {
            console.log(err._id)
            errorIds += err._id + ','
        })
        errorIds = errorIds.substring(0, errorIds.length - 1)
        throw new Error(`Products with this ids: ( ${errorIds} ) not found`)
    }

    requestObject.push({ fullCharge })
    return requestObject
}


module.exports = { checkProducts }