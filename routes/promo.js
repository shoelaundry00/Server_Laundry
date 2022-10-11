const express = require('express')
const router = express.Router()
const db = require('../db')
const { inputChecks, generateUserID, privilegeChecks } = require('../helper')

const insertPromoSQL = `INSERT INTO promo
  (promo_id, promo_name, promo_description,
    promo_value, promo_is_percentage, promo_min_total,
    promo_max_discount,
    promo_create_id, promo_create_ip, promo_update_id,
    promo_update_ip, promo_note, promo_status)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?)
`

const insertHPromoSQL = `INSERT INTO h_promo
  (h_promo_id, h_promo_name, h_promo_description,
    h_promo_value, h_promo_is_percentage, h_promo_min_total,
    h_promo_max_discount,
    h_promo_create_id, h_promo_create_ip, h_promo_update_id,
    h_promo_update_ip, h_promo_note, h_promo_status, FK_promo_id)
    VALUES
    (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`

const updatePromoSQL = `UPDATE promo SET
  promo_name=?, promo_description=?, promo_value=?,
  promo_is_percentage=?, promo_min_total=?, promo_max_discount=?,
  promo_update_id=?,
  promo_update_date=?, promo_update_ip=?, promo_note=?, promo_status=?
  WHERE
  promo_id=?
`

const updateHPromoSQL = `UPDATE h_promo SET
  h_promo_name=?, h_promo_description=?, h_promo_value=?,
  h_promo_is_percentage=?, h_promo_min_total=?, h_promo_max_discount=?,
  h_promo_update_id=?,
  h_promo_update_date=?, h_promo_update_ip=?, h_promo_note=?, h_promo_status=?
  WHERE
  h_promo_status = 1 AND FK_promo_id=?
`

router.get('/get/:id?', async (req, res, next) => {
  const retVal = {
    status: 200,
  }

  const connection = await db.getConnection()
  try {
    const query = `SELECT p.*, h_promo_id as promo_history_id FROM promo p join h_promo h on FK_promo_id = promo_id WHERE promo_status = 1 AND h_promo_status = 1 ${
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
  const requiredPrivileges = ['buat promo']

  const connection = await db.getConnection()
  try {
    privilegeChecks(req.loggedPrivileges, requiredPrivileges, req.loggedIsAdmin)
    inputChecks(requiredInputs, req.body)

    const {
      name,
      description,
      value,
      is_percentage,
      min_total,
      max_discount,
      note,
    } = req.body

    const ip = req.ip

    const id = await generateUserID(connection, 'promo', 'PR')

    await connection.query(insertPromoSQL, [
      id,
      name,
      description,
      value,
      is_percentage ? is_percentage : null,
      min_total ? min_total : null,
      max_discount ? max_discount : null,
      req.loggedEmployee.employee_id,
      ip,
      req.loggedEmployee.employee_id,
      ip,
      note ? note : null,
      true,
    ])

    const h_id = await generateUserID(connection, 'h_promo', 'HPR')

    await connection.query(insertHPromoSQL, [
      h_id,
      name,
      description,
      value,
      is_percentage ? is_percentage : null,
      min_total ? min_total : null,
      max_discount ? max_discount : null,
      req.loggedEmployee.employee_id,
      ip,
      req.loggedEmployee.employee_id,
      ip,
      note ? note : null,
      true,
      id,
    ])

    const [createdPromo] = await connection.query(
      `SELECT p.*, h_promo_id as promo_history_id FROM promo p join h_promo h on FK_promo_id = promo_id WHERE promo_id = '${id}' and h_promo_status = 1`
    )

    retVal.data = createdPromo[0]

    connection.destroy()
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    connection.destroy()
    return next(error)
  }
})

router.put('/update/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }
  const requiredPrivileges = ['perbarui promo']

  const connection = await db.getConnection()
  try {
    privilegeChecks(req.loggedPrivileges, requiredPrivileges, req.loggedIsAdmin)
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

    const [oldPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id=?`,
      req.params.id
    )

    await connection.query(updatePromoSQL, [
      name ? name : oldPromo[0].promo_name,
      description ? description : oldPromo[0].promo_description,
      value ? value : oldPromo[0].promo_value,
      is_percentage ? is_percentage : oldPromo[0].promo_is_percentage,
      min_total ? min_total : oldPromo[0].promo_min_total,
      max_discount ? max_discount : oldPromo[0].promo_max_discount,
      req.loggedEmployee.employee_id,
      new Date(),
      ip,
      note ? note : oldPromo[0].promo_note,
      status ? status : oldPromo[0].promo_status,
      req.params.id,
    ])

    const [history] = await connection.query(
      `SELECT * FROM h_promo where FK_promo_id = '${req.params.id}' AND h_promo_status = 1`
    )

    const hPromo = history[0]

    if (hPromo.h_promo_used === 1) {
      await connection.query(
        `UPDATE h_promo SET h_promo_status = 0 WHERE FK_promo_id = '${req.params.id}'`
      )

      await connection.query(updateHPromoSQL, [
        name ? name : oldPromo[0].promo_name,
        description ? description : oldPromo[0].promo_description,
        value ? value : oldPromo[0].promo_value,
        is_percentage ? is_percentage : oldPromo[0].promo_is_percentage,
        min_total ? min_total : oldPromo[0].promo_min_total,
        max_discount ? max_discount : oldPromo[0].promo_max_discount,
        req.loggedEmployee.employee_id,
        new Date(),
        ip,
        note ? note : oldPromo[0].promo_note,
        status ? status : oldPromo[0].promo_status,
        req.params.id,
      ])
    } else {
      const h_id = await generateUserID(connection, 'h_promo', 'HPR')
      await connection.query(insertHPromoSQL, [
        h_id,
        name ? name : oldPromo[0].promo_name,
        description ? description : oldPromo[0].promo_description,
        value ? value : oldPromo[0].promo_value,
        is_percentage ? is_percentage : oldPromo[0].promo_is_percentage,
        min_total ? min_total : oldPromo[0].promo_min_total,
        max_discount ? max_discount : oldPromo[0].promo_max_discount,
        req.loggedEmployee.employee_id,
        ip,
        req.loggedEmployee.employee_id,
        ip,
        note ? note : null,
        true,
        req.params.id,
      ])
    }

    const [updatedPromo] = await connection.query(
      `SELECT p.*, h_promo_id as promo_history_id FROM promo p join h_promo h on FK_promo_id = promo_id WHERE promo_id = '${req.params.id}' and h_promo_status=1`
    )

    retVal.data = updatedPromo[0]

    connection.destroy()
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    connection.destroy()
    return next(error)
  }
})

router.delete('/delete/:id', async (req, res, next) => {
  const retVal = {
    status: 200,
  }
  const requiredPrivileges = ['hapus promo']

  const connection = await db.getConnection()
  try {
    privilegeChecks(req.loggedPrivileges, requiredPrivileges, req.loggedIsAdmin)

    await connection.query(
      `UPDATE promo SET promo_status = 0 WHERE promo_id = '${req.params.id}'`
    )

    await connection.query(
      `UPDATE h_promo SET h_promo_status = 0 WHERE FK_promo_id = '${req.params.id}'`
    )

    const [deletedPromo] = await connection.query(
      `SELECT * FROM promo WHERE promo_id = '${req.params.id}'`
    )

    const [history] = await connection.query(
      `SELECT h_promo_id FROM h_promo WHERE FK_promo_id = '${req.params.id}' order by h_promo_update_date desc limit 1`
    )

    deletedPromo[0].promo_history_id = history[0].h_promo_id

    retVal.data = deletedPromo[0]

    connection.destroy()
    return res.status(retVal.status).json(retVal)
  } catch (error) {
    connection.destroy()
    return next(error)
  }
})

module.exports = router
