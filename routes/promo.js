const express = require('express')
const serverless = require("serverless-http")
const router = express.Router()
const db = require('../db')
const { inputChecks, userNumberGenerator } = require('../helper')

const insertPromoSQL = `INSERT INTO promo
  (promo_id, promo_name, promo_description,
    promo_value, promo_is_percentage, promo_min_total,
    promo_max_discount,
    promo_create_id, promo_create_ip, promo_update_id,
    promo_update_ip, promo_note, promo_status)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?)
`

const updatePromoSQL = `UPDATE promo SET
  promo_name=?, promo_description=?, promo_value=?,
  promo_is_percentage=?, promo_min_total=?, promo_max_discount=?,
  promo_update_id=?,
  promo_update_date=?, promo_update_ip=?, promo_note=?, promo_status=?
  WHERE
  promo_id=?
`

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db
    const query = `SELECT * FROM promo WHERE promo_status = 1 ${
      req.params.id ? `AND promo_id = '${req.params.id}'` : ''
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

  const requiredInputs = ['name', 'description', 'value', 'status']

  try {
    inputChecks(requiredInputs, req.body)

    const {
      name,
      description,
      value,
      is_percentage,
      min_total,
      max_discount,
      note,
      status,
    } = req.body

    const ip = req.ip

    const connection = await db

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'promo',
      'PR'
    )

    await connection.query(insertPromoSQL, [
      id,
      name,
      description,
      value,
      is_percentage ? is_percentage : null,
      min_total ? min_total : null,
      max_discount ? max_discount : null,
      createId,
      ip,
      updateId,
      ip,
      note ? note : null,
      status,
    ])

    const [createdPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id = '${id}'`
    )

    retVal.data = createdPromo[0]

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
      description,
      value,
      is_percentage,
      min_total,
      max_discount,
      note,
      status,
    } = req.body
    const ip = req.ip

    const connection = await db

    const [oldPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id=?`,
      req.params.id
    )

    const { updateId } = await userNumberGenerator(connection, 'promo', 'PR')

    await connection.query(updatePromoSQL, [
      name ? name : oldPromo[0].promo_name,
      description ? description : oldPromo[0].promo_description,
      value ? value : oldPromo[0].promo_value,
      is_percentage ? is_percentage : oldPromo[0].promo_is_percentage,
      min_total ? min_total : oldPromo[0].promo_min_total,
      max_discount ? max_discount : oldPromo[0].promo_max_discount,
      updateId,
      new Date(),
      ip,
      note ? note : oldPromo[0].promo_note,
      status ? status : oldPromo[0].promo_status,
      req.params.id,
    ])

    const [updatedPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id = '${req.params.id}'`
    )

    retVal.data = updatedPromo[0]

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
      `UPDATE promo SET promo_status = 0 WHERE promo_id = '${req.params.id}'`
    )

    const [deletedPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id = '${req.params.id}'`
    )

    retVal.data = deletedPromo[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
module.exports.handler=serverless(router)
