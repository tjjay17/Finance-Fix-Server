const bcrypt = require('bcrypt');
const db = require('../DBconfig');
const jwt = require('jsonwebtoken');
const constants = require('../Constants');

exports.register = (req,res) =>{
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    let password = req.body.password;

    // res.send(first,last,email,password);
    //****Note to self ****
    //This is where I shall setup a database and setup a way to hash passwords

    bcrypt.hash(password,15)
        .then(hash =>{
            db.pool.connect()
                .then(client =>{
                    let query = 'SELECT * FROM Users WHERE Email = $1';
                    client.query(query,[email])
                        .then(result =>{
                            if(result.rows.length > 0){
                                console.log('It is touching');
                                res.sendStatus(409);
                            }else{
                                query = 'INSERT INTO Users (fName, lName, Email,Password) Values($1,$2,$3,$4)';
                                client.query(query,[first,last,email,hash])
                                    .then(result => {
                                        client.release();
                                        res.send(result);
                                    })
                                    .catch(e =>{
                                        client.release();
                                        res.send(e);
                                    });
                            }
                        });
                });
        })
        .catch(e => {
            console.log(e);
            res.send(e);
        });
}

exports.login = (req,res) =>{
    let email = req.body.email;
    let password = req.body.password;
    let query = 'SELECT * FROM Users WHERE Email = $1';
    console.log(email,password);

    db.pool.query(query,[email])
        .then(result =>{
            if(result.rows.length > 0){
                if(email === result.rows[0].email){
                    let hash = result.rows[0].password;
                    bcrypt.compare(password,hash)
                        .then(isMatch =>{
                            if(isMatch){
                                //expiresin hour and a half
                                let jwToken = jwt.sign({email:email},constants.JWT_KEY,{expiresIn:5400});
                                //console.log(jwToken);
                                res.send({token:jwToken,email:email,name:result.rows[0].fname,id:result.rows[0].id});
                            }else{
                                res.send(409);
                            }
                        })
                        .catch(e => res.send(e));
                }
            }
        })
    //database work goes in here.
}

exports.verifyToken = (req,res) =>{
    let token = req.body.token;
    let decoded = jwt.verify(token,constants.JWT_KEY);
    //console.log(decoded);
    if(decoded){
        let query = 'Select * From users where email = $1';
        db.pool.query(query,[decoded.email])
            .then(result =>{
                if(result.rows.length === 1){
                    res.send({status:true,email:decoded.email,name : result.rows[0].name, id:result.rows[0].id});
                }
            })
            .catch(e => console.log(e));
    }else{
        res.send({status:false,email:''});
    }     
}