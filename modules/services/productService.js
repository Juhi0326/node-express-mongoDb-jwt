const countDiscountedPrice = (discount, basePrice) => {

    let percentAsDecimal = (discount / 100);
    let countedPrice = basePrice - (percentAsDecimal * basePrice);

    return countedPrice;
}
module.exports = { countDiscountedPrice }