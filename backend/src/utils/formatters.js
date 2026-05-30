function formatProduct(product) {
  const data = product.toJSON ? product.toJSON() : product;
  return {
    ...data,
    price: parseFloat(data.price),
  };
}

function formatProducts(products) {
  return products.map(formatProduct);
}

module.exports = { formatProduct, formatProducts };
