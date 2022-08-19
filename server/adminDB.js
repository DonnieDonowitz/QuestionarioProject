'use strict';

const bcrypt = require('bcrypt');
const sqlite = require('sqlite3');

const db = new sqlite.Database('surveys.db', (err) => {
    if(err) throw err;
});

exports.getAdminByID = (id) => {
    return new Promise((res, rej) => {
        const sql = "SELECT * FROM Administrators WHERE ID = ?;";
        db.get(sql, [id], (err, row) => {
            if(err){
                rej(err);
                return;
            } else if(row === undefined){
                res({ error: "There isn't an Admin with the selected AdminID" });
                return;
            }

            const admin = { id: row.ID, username: row.Username };
            res(admin);
        });
    });
};

exports.getAdmin = (username, password) => {
    return new Promise((res, rej) => {
        const sql = "SELECT * FROM Administrators WHERE Username = ?;";
        db.get(sql, [username], (err, row) => {
            if(err){
                rej(err);
            } else if (row === undefined){
                res(false);
            } else {
                const admin = { id: row.ID, username: row.Username };

                bcrypt.compare(password, row.Password).then(result => {
                    if(result){
                        res(admin);
                    } else {
                        res(false);
                    }
                });
            }            
        });
    });
};