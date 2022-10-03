const express = require('express')
const serverless = require("serverless-http")
const router = express.Router()
const db = require('../db')
const { inputChecks, userNumberGenerator } = require('../helper')

const insertDTransactionSQL = `INSERT INTO d_trans
(d_trans_id, d_trans_create_id, d_trans_create_ip,
  d_trans_update_id, d_trans_update_ip, d_trans_note,
  d_trans_done, d_trans_quantity, d_trans_subtotal,
  d_trans_status, FK_h_product_id, FK_h_trans_id)
  VALUES
  (?,?,?,?,?,?,?,?,?,?,?,?)
`

const updateDTransactionSQL = `UPDATE d_trans SET
  d_trans_update_id=?, d_trans_update_date=?, d_trans_update_ip=?,
  d_trans_note = ?, d_trans_done=?, d_trans_quantity=?,
  d_trans_subtotal=?, d_trans_status=?, FK_employee_id=?
  WHERE
  d_trans_id=?
`

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db

    const query = `SELECT * FROM d_trans WHERE d_trans_status = 1 ${
      req.params.id ? ` AND FK_h_trans_id = '${req.params.id}'` : ''
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
  const requiredInputs = ['done','quantity','subtotal','status','FK_h_product_id','FK_h_trans_id']

  try {
    inputChecks(requiredInputs, req.body)

    const {
      note,
      done,
      quantity,
      subtotal,
      status,
      h_product_id,
      h_trans_id
    } = req.body

    const create_ip = req.ip

    const connection = await db

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'd_trans',
      'DT'
    )

    await connection.query(insertDTransactionSQL, [
      id,
      createId,
      create_ip,
      updateId,
      note,
      done,
      quantity,
      subtotal,
      status,
      h_product_id,
      h_trans_id,
    ])

    const [createdDtrans] = await connection.query(
      `SELECT * FROM d_trans WHERE d_trans_id = '${id}'`
    )

    retVal.data = createdDtrans[0]

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
      note,
      done,
      quantity,
      subtotal,
      status,
      employee_id
    } = req.body

    const ip = req.ip

    const connection = await db

    const [oldDTrans] = await connection.query(
      `SELECT * FROM d_trans WHERE d_trans_id=?`,
      req.params.id
    )

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'd_trans',
      'DT'
    )

    await connection.query(updateDTransactionSQL, [
      updateId,
      new Date(),
      ip,
      note ? note : oldDTrans[0].d_trans_note,
      done ? done : oldDTrans[0].d_trans_done,
      quantity ? quantity : oldDTrans[0].d_trans_quantity,
      subtotal ? subtotal : oldDTrans[0].d_trans_subtotal,
      status ? status : oldDTrans[0].d_trans_status,
      employee_id ? employee_id : oldDTrans[0].FK_employee_id,
      req.params.id,
    ])

    const [updatedDTrans] = await connection.query(
      `SELECT * FROM d_trans WHERE d_trans_id=?`,
      req.params.id
    )

    retVal.data = updatedDTrans[0]

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
      `UPDATE d_trans SET d_trans_status = 0 WHERE d_trans_id = '${req.params.id}'`
    )

    const [deletedd_trans] = await connection.query(
      `SELECT * FROM d_trans WHERE d_trans_id = '${req.params.id}'`
    )

    retVal.data = deletedd_trans[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
module.exports.handler=serverless(router)
