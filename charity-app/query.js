
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sachinsaligram",
  database: "mydb"
});

// con.connect(function(err) {
//   if (err) throw err;
//   con.query("SELECT * FROM charity", function (err, result, fields) {
//     if (err) throw err;
//     console.log(result);
//   });
// });

con.connect(function(err) {
  if (err) throw err;

  var sql = "UPDATE charity SET Balance = 1000 WHERE Charity = 'United'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });

  var sql = "DELETE FROM charity WHERE Balance = 0";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
  });

  con.query("SELECT * FROM charity", function (err, result, fields) {
    if (err) throw err;
    Object.keys(result).forEach(function(key) {
      var row = result[key];
      console.log(row.Balance)
    });
  });

});