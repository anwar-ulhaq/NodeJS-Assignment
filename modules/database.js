/*
 
 @Author Anwar on 22/11/2018.
 @Project Assignment-05
 
 */


'use strict';
require('dotenv').config();
const mysql   = require('mysql2');

//Create connection to DB
const connect = () => {
  return mysql.createConnection({
    host      : process.env.DB_HOST,
    user      : process.env.DB_USER,
    database  : process.env.DB_NAME,
    password  : process.env.DB_PASS
  });
};

//DB query for every thing.

const select = (connection, callback, res) => {
  connection.query(
      'SELECT * FROM media', (err, result, field) =>{
        console.log('Error, if any : '+ err);
        callback(result, res);
      }
  )
};

const getcolumns = (connection, callback, res) => {
  connection.query(
      'DESCRIBE media', (err,result, field) =>{
        console.log('Error, if any : '+ err);
        callback(result, res);
      }
  )
};


const insert = (data, connection, callback) => {
  //console.log("insert query activated" + data);
  //console.log("Connection => " + connection);


  // simple query
  connection.execute(
      'INSERT INTO media (category, title, details, thumbnail, image,  original, coordinates) VALUES (?, ?, ?, ?, ?, ?, ?);', data,
      (err, results, fields) => {
        //   console.log(results); // results contains rows returned by server
        //   // console.log(fields); // fields contains extra meta data about results, if available
        //   console.log(err);
        callback();
      }
  )
};


//Update Query
const update = (data, connection) => {
  connection.execute(
      `UPDATE LOW_PRIORITY media SET ${data[0]} = "${data[1]}" where mID = ${data[2]};`,
      (err, results, field) => {
        console.log('Error, if any : '+ err);
      }
  )
};
//Delete Query
const delet = (data, connection) => {
  connection.execute(
    'DELETE FROM media WHERE mID = ?;', [data.mid],
        (err, results, field) => {
          console.log('Error, if any : '+ err);
        }
  )
};


module.exports = {
  connect     : connect,
  select      : select,
  insert      : insert,
  getcolumn   : getcolumns,
  update      : update,
  delet       : delet
};