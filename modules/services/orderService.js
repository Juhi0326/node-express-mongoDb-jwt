const loadash = require('lodash');

/*ez a függvény ellenőrzi, hogy valóban van-e olyan product, ami a rendelésben érkezett
és ki is számolja a rendelés végösszegét. Hiba esetén visszatér a hibával.
*/
const checkProducts = (requestObject, products) => {
    const error = []
    let errorIds = ''
    let fullCharge = null
    let isProduct = false
    requestObject.map(obj => {
        loadash.forEach(obj, function (value, key) {
            if (key == '_id') {
                isProduct = true
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
    if (isProduct === false) {
        throw new Error('missing products!')
    }
    requestObject.push({ fullCharge })
    return requestObject
}
const compileOrderUpdateObject = (tempOrderObject, updateObject, orderObject) => {
    /*ez a függvény ellenőrzi, hogy valóban van-e olyan product, ami a rendelés módosításában érkezett, 
és újra számolja a rendelés végösszegét. Hiba esetén visszatér a hibával.
*/
    const error = []
    let errorIds = ''
    let fullCharge = null
    let tempFullCharge = null;

    loadash.forEach(orderObject, function (value, key) {
        if (key === 'products' && loadash.isEmpty(value) === false) {
            loadash.forEach(value, function (value2, key2) {
                if (key2 === 'change' && value2.length !== 0) {
                    for (let index = 0; index < value2.length; index++) {
                        const element = value2[index];
                        let index2 = tempOrderObject.products.findIndex(element => {
                            if (JSON.stringify(element._id) == JSON.stringify(value2[index].productId._id)) {
                                return true;
                            }
                        });
                        if (index2 > -1) {
                            updateObject = {
                                ...updateObject, ...{
                                    ['products.' + index2 + '.quantity']: value2[index].quantity,
                                    ['products.' + index2 + '.storno']: value2[index].storno
                                }
                            }
                            tempOrderObject.products[index2].storno = value2[index].storno
                            tempOrderObject.products[index2].quantity = value2[index].quantity
                        } else {
                            error.push(`There is no product with this id (${JSON.stringify(value2[index].productId._id)}) in this order`)
                        }
                    }
                }
            })
        }
        if (key === 'userId' && loadash.isEmpty(value) === false) {
            updateObject = { ...updateObject, ...{ user: orderObject.userId } }
        }
        if (key === 'accountAddress' && loadash.isEmpty(value) === false) {
            updateObject = { ...updateObject, ...{ accountAddress: orderObject.accountAddress } }
        }
        if (key === 'deliveryAddress' && loadash.isEmpty(value) === false) {
            updateObject = { ...updateObject, ...{ deliveryAddress: orderObject.deliveryAddress } }
        }
    })
    if (loadash.isEmpty(error) === false) {
        throw new Error(error)
    }
    loadash.forEach(tempOrderObject, function (value, key) {
        if (key === 'products') {
            loadash.forEach(value, function (value2, key2) {
                if (value2.storno === true) {
                    tempFullCharge += 0
                } else {
                    tempFullCharge += value2.price * value2.quantity
                }
            });
        }
    });
    updateObject = {
        ...updateObject, ...{
            fullCharge: tempFullCharge
        }
    }
    console.log(updateObject)
    return updateObject;

}

module.exports = { checkProducts, compileOrderUpdateObject }