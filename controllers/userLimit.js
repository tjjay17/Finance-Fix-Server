const db = require('../DBconfig');
const redis = require('../redis');

//the purpose is to take user input on dashboard page and then see if we can 
//keep track of their budget.
exports.createBudget = (req,res) =>{
    let email = req.body.email;
    let limit = req.body.budget;
    db.pool.connect()
        .then(client =>{
            let query = "INSERT INTO userbudgets VALUES($1,$2)";
            client.query(query,[email],[limit])
                .then(result =>{
                    client.release();
                    res.send(result);
                })
                .catch(e =>{
                    client.release();
                    res.send(e);
                })
        })
    //db.pool.query()
}