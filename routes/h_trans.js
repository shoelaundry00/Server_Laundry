const express = require('express')
const cloudinary = require('cloudinary')
const router = express.Router()
const db = require('../db')
const { inputChecks, userNumberGenerator } = require('../helper')

const insertHTransactionSQL = `INSERT INTO h_trans
(h_trans_id, h_trans_main_photo, h_trans_main_note,
  h_trans_top_photo, h_trans_top_note, h_trans_left_photo,
  h_trans_left_note, h_trans_right_photo, h_trans_right_note,
  h_trans_below_photo, h_trans_below_note, h_trans_total,
  h_trans_create_id, h_trans_create_date, h_trans_create_ip,
  h_trans_update_id, h_trans_update_date, h_trans_update_ip,
  h_trans_note, h_trans_status, FK_customer_id, FK_promo_id)
  VALUES
  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`

const updateHTransactionSQL = `UPDATE h_trans SET
 h_trans_update_id=?, h_trans_update_date=?, h_trans_update_ip=?,
 h_trans_total=?, h_trans_note=?, h_trans_progress=?, h_trans_status=?, FK_promo_id=?
 WHERE
 h_trans_id=?
 `

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  try {
    const connection = await db

    const query = `SELECT * FROM h_trans WHERE h_trans_status = 1 ${
      req.params.id ? ` AND h_trans_id = '${req.params.id}'` : ''
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
  const requiredInputs = ['total','status','customer_id','images','imageNotes']

  try {
    inputChecks(requiredInputs, req.body)

    const {
      total,
      note,
      status,
      customer_id,
      promo_id
    } = req.body

    const create_ip = req.ip

    const uploadedImages = []

    for (var i = 0; i < 5; i++) {
      const fileStr = req.body.images[i]

      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'dummy_value',
      })

      uploadedImages.push(uploadResponse.url)
    }

    const connection = await db

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'h_trans',
      'HT'
    )

    await connection.query(insertHTransactionSQL, [
      id,
      uploadedImages[0],
      imageNotes[0],
      uploadedImages[1],
      imageNotes[1],
      uploadedImages[2],
      imageNotes[2],
      uploadedImages[3],
      imageNotes[3],
      uploadedImages[4],
      imageNotes[4],
      total,
      createId,
      create_ip,
      updateId,
      create_ip,
      note,
      status,
      customer_id,
      promo_id
    ])

    const [createdHTrans] = await connection.query(
      `SELECT * FROM h_trans WHERE h_trans_id = '${id}'`
    )

    retVal.data = createdHTrans[0]

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
      total,
      note,
      rogress,
      status,
      promo_id
    } = req.body

    const ip = req.ip

    const connection = await db

    const { id, createId, updateId } = await userNumberGenerator(
      connection,
      'h_trans',
      'HT'
    )

    const [oldHTrans] = await connection.query(
      `SELECT * FROM h_trans WHERE h_trans_id=?`,
      req.params.id
    )

    await connection.query(updateHTransactionSQL, [
      updateId,
      new Date(),
      ip,
      total ? total : oldHTrans[0].h_trans_total,
      note ? note : oldHTrans[0].h_trans_note,
      progress ? progress : oldHTrans[0].h_trans_progress,
      status ? status : oldHTrans[0].h_trans_status,
      promo_id? promo_id: oldHTrans[0].FK_promo_id,
      req.params.id,
    ])

    const [updatedHTrans] = await connection.query(
      `SELECT * FROM h_trans WHERE h_trans_id=?`,
      req.params.id
    )

    retVal.data = updatedHTrans[0]

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
      `UPDATE h_trans SET h_trans_status = 0 WHERE h_trans_id = '${req.params.id}'`
    )

    const [deletedh_trans] = await connection.query(
      `SELECT * FROM h_trans WHERE h_trans_id = '${req.params.id}'`
    )

    retVal.data = deletedh_trans[0]

    return res.status(retVal.status).json(retVal)
  } catch (error) {
    return next(error)
  }
})

module.exports = router
