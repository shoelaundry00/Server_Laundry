const express = require('express')
const serverless = require("serverless-http")
const router = express.Router()
const db = require('../db')
const { inputChecks, userNumberGenerator } = require('../helper')

const insertProductSQL = `INSERT INTO product
(product_id, product_name, product_type, product_price, product_brand,
 product_stock, product_category, product_create_id, product_create_ip,
 product_update_id, product_update_ip, product_note, product_status)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
`

const insertHProductSQL = `INSERT INTO h_product
(h_product_id, h_product_price, h_product_create_id, h_product_create_ip,
 h_product_update_id, h_product_update_ip, h_product_note, h_product_status,
 FK_product_id)
VALUES (?,?,?,?,?,?,?,?,?)
`

const updateProductSQL = `UPDATE product SET product_name=?, product_type=?, product_price=?,
product_brand=?, product_stock=?, product_category=?, product_update_id=?, product_update_ip=?,
product_update_date=?, product_note=?, product_status=?
WHERE product_id=?
`

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db
    const query = `SELECT * FROM product WHERE product_status=1 ${
      req.params.id ? ` AND product_id = '${req.params.id}'` : ''
    }`

    const [rows] = await connection.query(query)

    retVal.data = rows
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.get('/history/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db
    const query = `SELECT * FROM h_product WHERE h_product_status = 1 ${
      req.params.id ? ` AND FK_product_id = '${req.params.id}'` : ''
    }`

    const [rows] = await connection.query(query)

    retVal.data = rows
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.post('/create', async (req, res, next) => {
  const retVal = {
    status: 201,
  }

  const requiredInputs = ['name','type','price','stock','category','status']

  try {
    inputChecks(requiredInputs, req.body)

    const {
      name,
      type,
      price,
      brand,
      stock,
      category,
      note,
      status
    } = req.body
    const create_ip = req.ip

    const connection = await db

    // Creating ID String
    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'product',
      'P'
    )

    const { h_id, h_createId, h_updateId } = await userNumberGenerator(
      connection,
      'h_product',
      'HP'
    )

    // Inserting data to Product Table
    await connection.query(insertProductSQL, [
      id,
      name,
      type,
      price,
      brand?brand:null,
      stock,
      category,
      createId,
      create_ip,
      updateId,
      create_ip,
      note?note:null,
      status,
    ])

    // Inserting data to h_Product Table
    await connection.query(insertHProductSQL, [
      h_id,
      price,
      h_createId,
      create_ip,
      h_updateId,
      create_ip,
      note?note:null,
      status,
      id,
    ])

    //Select created Product for return Value
    const [createdProduct] = await connection.query(
      `SELECT * FROM product WHERE product_id = '${id}'`
    )

    retVal.data = createdProduct[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.put('/update/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const {
      name,
      type,
      price,
      brand,
      stock,
      category,
      note,
      status
    } = req.body

    const update_ip = req.ip

    const connection = await db

    const [oldProduct] = await connection.query(
      `SELECT * FROM product WHERE product_id=?`,
      req.params.id
    )

    // Creating ID String
    const { id,createId, updateId } = await userNumberGenerator(
      connection,
      'product',
      'P'
    )

    const {
      id: h_id,
      createId: h_createId,
      updateId: h_updateId,
    } = await userNumberGenerator(connection, 'h_product', 'HP')

    //updating data
    await connection.query(updateProductSQL, [
      name ? name : oldProduct[0].product_name,
      type ? type : oldProduct[0].product_type,
      price ? price : oldProduct[0].product_price,
      brand ? brand : oldProduct[0].product_brand,
      stock ? stock : oldProduct[0].product_stock,
      category ? category : oldProduct[0].product_category,
      updateId,
      update_ip,
      new Date(),
      note ? note : oldProduct[0].product_note,
      status ? status : oldProduct[0].product_status,
      req.params.id,
    ])

    const [updatedProduct] = await connection.query(
      `SELECT * FROM product WHERE prduct_id=?`,
      req.params.id
    )

    retVal.data = updatedProduct[0]

    //inserting newData to h_product
    await connection.query(insertHProductSQL, [
      h_id,
      price,
      h_createId,
      update_ip,
      h_updateId,
      update_ip,
      note,
      status,
      id,
    ])

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

router.delete('/delete/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db

    await connection.query(
      `UPDATE product SET product_status = 0 WHERE product_id = '${req.params.id}'`
    )

    const [deletedProduct] = await connection.query(
      `SELECT * FROM product WHERE product_id = '${req.params.id}'`
    )

    retVal.data = deletedProduct[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
module.exports.handler=serverless(router)
