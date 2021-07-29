const plaid = require('plaid');
const constants = require('../Constants');
const db = require('../DBconfig');
const redis = require('../redis');

const client = new plaid.Client({
    clientID: constants.PLAID_CLIENT,
    secret:constants.PLAID_SANDBOX,
    env:plaid.environments.sandbox
});

exports.create_link_token = async (req,res) =>{
    let id = req.body.id;
    console.log(id);
    try{
        const tokenResponse = await client.createLinkToken({
            user:{
                client_user_id:id.toString()
            },
            client_name:'Finance Fix',
            products:['transactions'],
            country_codes:['US','CA'],
            language:'en'
        });
        res.send({link_token:tokenResponse.link_token});
    }catch(e){
        res.send({error:e});
    }
}

exports.verifystatus = (req,res) =>{
    //this will check if the user already has an access token.
    //if they do, then we won't need to issue a plaid link as they are already connected.
    //otherwise, you issue plaid token => get access => so forth.
    //let id = req.body.id;
    let email = req.body.email;
    let query = 'SELECT * FROM plaid_tokens WHERE email = $1';
    db.pool.query(query,[email])
        .then(result =>{
            if(result.rows.length > 0){
                res.send({hasAccess:true})
            }else{
                res.send({hasAccess:false});
            }
        })
        .catch(e => res.send(e));
}

exports.get_access_token = async (req,res) =>{
    const LINK_TOKEN = req.body.link_token;
    const id = req.body.id;
    const email = req.body.email;
    //console.log(LINK_TOKEN, id);
    let query;
    try{
        const tokenResponse = await client.exchangePublicToken(LINK_TOKEN);
        console.log('tresponse',tokenResponse);
        query = 'INSERT INTO plaid_tokens (id,email,access_token) VALUES($1,$2,$3)';
        db.pool.query(query, [id,email,tokenResponse.access_token])
            .then(res => res.send('Inserted'))
            .catch(e => res.send(e + ':('));
    }catch(e){
        res.send({error:e});
    }
}

exports.fetch_transactions = (req,res) =>{
    let email = req.body.email;
    let acc_token;
    let current_date = new Date().toISOString().split('T')[0];
    let first_date = new Date();
    first_date.setDate(1);
    first_date = first_date.toISOString().split('T')[0];

    redis.get('access_token',async (err,token) =>{
        if(token){
            console.log('here',token);
            acc_token = token;
        }else{
            let query = 'SELECT * FROM plaid_tokens WHERE email = $1';
            db.pool.query(query,[email])
                .then(results => {
                    redis.setex('access_token', 5400, results.rows[0].access_token);
                    acc_token = results.rows[0].access_token;
                })
                .catch(e => res.send(e));
        }
        
        const response = await client.getTransactions(acc_token,first_date,current_date)
            .catch((e) =>{
                res.send(e);
            });   
        res.send(response.transactions);  
    });
}

exports.plaidtoexpenses = (req,res) =>{
    let transactions = req.body.transactions;
    let query = 'INSERT INTO expenses (Name,Amount,id,date) VALUES($1,$2,$3,$4)';
    for(let i = 0; i<transactions.length; i++){
        if(transactions[i].amount >= 0){
            db.pool.query(query,[transactions[i].name, transactions[i].amount, transactions[i].transaction_id, transactions[i].date])
            .then(res => res.send('success'))
            .catch(e => res.send(e));
        }
    }
}