const loadash = require('lodash');

/*ez a függvény ellenőrzi, hogy valóban van-e olyan product, ami a rendelésben érkezett
és ki is számolja a rendelés végösszegét. Hiba esetén visszatér a hibával.
*/
const checkProducts = (requestObject, products) => {
    const error = []
    let errorIds = ''
    let fullProductPrice = null
    let isProduct = false
    requestObject.map(obj => {
        loadash.forEach(obj, function (value, key) {
            if (key == '_id') {
                isProduct = true
                let talalat = products.filter(product => JSON.stringify(product._id) === JSON.stringify(value._id));
                if (talalat.length === 0) {
                    error.push(value)
                } else {
                    console.log(talalat[0].discountedPrice)
                    obj = Object.assign(obj, { price: talalat[0].discountedPrice }, { productName: talalat[0].name }, { storno: false })
                    console.log(obj)
                    console.log(obj.quantity)
                    if (obj.quantity < 1) {
                        errorIds = obj._id._id
                        throw new Error(`Products with this ids: ( ${errorIds} ) can not be 0!`)
                    }
                    fullProductPrice += talalat[0].discountedPrice * obj.quantity
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
    requestObject.push({ fullProductPrice })
    return requestObject
}
const compileOrderUpdateObject = (tempOrderObject, orderObject) => {
    /*ez a függvény ellenőrzi, hogy valóban van-e olyan product, ami a rendelés módosításában érkezett, 
és újra számolja a rendelés végösszegét. Hiba esetén visszatér a hibával.
tempOrderObject = az eredeti megrendelés
orderObject = request body
*/
    const error = []
    let errorIds = ''
    let fullProductPrice = null
    let tempfullProductPrice = null;
    let orderStorno = false;
    let stornoCount = 0;
    //ebben az objectben lesz összeállítva a változás a megrendelésben
    let updateObject = {}

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
    /* ez a függvény átszámolja a rendelés végösszegét, ha valamelyik product-nál a storno értéke true, akkor 
    0-át ad hozzá.
    */
    loadash.forEach(tempOrderObject, function (value, key) {
        if (key === 'products') {
            loadash.forEach(value, function (value2, key2) {
                if (value2.storno === true) {
                    tempfullProductPrice += 0
                    stornoCount++;
                } else {
                    tempfullProductPrice += value2.price * value2.quantity
                }
            });
        }
    });
    const deliveryPrice = tempfullProductPrice > 10000 ? 0 : 1500
    const fullCharge = getFullCharge(tempfullProductPrice, deliveryPrice)
    console.log(fullCharge);
    console.log(tempOrderObject.products.length);
    if (stornoCount === tempOrderObject.products.length) {
        console.log('a rendelés minden terméke stórnózva lett, így maga a rendelés is.');
        updateObject = {
            ...updateObject, ...{
                status: 'orderStorno'
            }
        }
    }
    updateObject = {
        ...updateObject, ...{
            fullProductPrice: tempfullProductPrice
        }
    }

    updateObject = {
        ...updateObject, ...{ fullCharge: fullCharge }
    }

    updateObject = {
        ...updateObject, ...{ deliveryPrice: deliveryPrice }
    }


    return updateObject;

}

const getFullCharge = (deliveryPrice, fullProductPrice) => {

    return deliveryPrice + fullProductPrice;
}

module.exports = { checkProducts, compileOrderUpdateObject, getFullCharge }