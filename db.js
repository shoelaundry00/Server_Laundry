const mysql = require('mysql2/promise')

async function getConnection() {
  console.log('CREATING')
  return mysql.createConnection(process.env.DATABASE_URL)
}

// const connection = mysql.createConnection(process.env.DATABASE_URL)
// const db = async () => {
//   // import mysql from 'mysql2/promise'

//   return connection
// }

module.exports = { getConnection }
