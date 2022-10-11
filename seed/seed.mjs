import { createTables, dropTables, initialRecords } from './sql.mjs'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
dotenv.config()

const connection = await mysql.createConnection(process.env.DATABASE_URL)

const loadAndSaveData = async () => {
  try {
    //drop all Tables
    console.log('Querying:')
    for (const [key, value] of Object.entries(dropTables)) {
      await connection.query(value)
      console.log(key)
    }
    console.log('ALL TABLES HAS BEEN DROPPED')

    // Create all Tables
    for (const [key, value] of Object.entries(createTables)) {
      await connection.query(value)
      console.log(key)
    }
    console.log('ALL TABLES HAS BEEN CREATED')

    // Seed all Tables
    for (const [key, value] of Object.entries(initialRecords)) {
      await connection.query(value)
      console.log(key)
    }
    // Seed Users
    await seedUsers()
    console.log('ALL TABLES HAS BEEN SEEDED')
  } catch (err) {
    console.error(err)
  }
}

const seedUsers = async () => {
  let initialEmployeeSQL = `INSERT INTO employee (employee_id, employee_name, employee_username, employee_password, employee_create_id, employee_create_date, employee_create_ip, employee_update_id, employee_update_date, employee_update_ip, employee_note, employee_status) VALUES `
  let initialHEmployeeSQL = `INSERT INTO h_employee (h_employee_id, h_employee_name, h_employee_username, h_employee_create_id, h_employee_create_date, h_employee_create_ip, h_employee_update_id, h_employee_update_date, h_employee_update_ip, h_employee_note, h_employee_status, FK_employee_id) VALUES `

  const users = [
    { name: 'Admin', username: 'admin', password: 'admin' },
    { name: 'Yosua', username: 'yos', password: 'yos' },
    { name: 'Zamorano', username: 'zam', password: 'zam' },
    { name: 'Kasir 1', username: 'kasir1', password: 'kasir1' },
    { name: 'Kasir 2', username: 'kasir2', password: 'kasir2' },
    { name: 'Pegawai 1', username: 'pegawai1', password: 'pegawai1' },
    { name: 'Pegawai 2', username: 'pegawai2', password: 'pegawai2' },
  ]

  //For Admin only
  let adminSQL = initialEmployeeSQL
  let hAdminSQL = initialHEmployeeSQL
  try {
    const hash = await bcrypt.hash(users[0].password, 10)

    adminSQL += `('E0000000001', 'Admin','admin', '${hash}', 'E0000000001', '2022-09-12', '::1', 'E0000000001', '2022-09-12', '::1', 'admin', 1)`
    hAdminSQL += `('HE0000000001', 'Admin','admin', 'E0000000001', '2022-09-12', '::1', 'E0000000001', '2022-09-12', '::1', 'dummy data', 1, 'E0000000001')`
    await connection.query(adminSQL)
    await connection.query(hAdminSQL)
  } catch (err) {
    console.log('ERROR', err)
  }

  //Employees
  for (let i = 1; i < users.length; i++) {
    const user = users[i]
    try {
      const hash = await bcrypt.hash(user.password, 10)
      const userNumber = `E120922${i.toString().padStart(4, '0')}`

      initialEmployeeSQL += `('${userNumber}', '${user.name}','${user.username}', '${hash}', 'E0000000001', '2022-09-12', '::1', 'E0000000001', '2022-09-12', '::1', 'dummy data', 1),`
      initialHEmployeeSQL += `('H${userNumber}', '${user.name}','${user.username}', 'E0000000001', '2022-09-12', '::1', 'E0000000001', '2022-09-12', '::1', 'dummy data', 1, '${userNumber}'),`
    } catch (err) {
      console.log('ERROR', err)
    }
  }
  initialEmployeeSQL = initialEmployeeSQL.slice(0, -1)
  initialHEmployeeSQL = initialHEmployeeSQL.slice(0, -1)
  await connection.query(initialEmployeeSQL)
  await connection.query(initialHEmployeeSQL)
  console.log('initialEmployeeSQL')
}

await loadAndSaveData()
process.exit(0)
