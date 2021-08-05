const express = require('express');
const bcrypt = require('bcrypt-nodejs')
const cors = require ('cors');
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'smart-brain'
    }
  });

// db.select('*').from('users').then(data => {
//     console.log(data);
// });
const app = express();

app.use(express.json());

app.use(cors())

app.get('/', (req, res) =>{
    // res.send(database.users);
    res.send('success');
})

app.post('/signin', (req, res) =>{
    // bcrypt.compare("apples", "$2a$10$Rp7Pf7O3O.HCb3TKDA7CLeTwEPKF2gOrCcwswqjpe1SvpbyFLEdsm", function(err,res){
    //     console.log('first guesss', res)
    // });

    // if(req.body.email === database.users[0].email &&
    //     req.body.password === database.users[0].password) {
    //         res.json(database.users[0]);
    //     } else {
    //         res.status(400).json('error logging in');
    //     }
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
        if (isValid) {
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user =>{
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else{
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    // bcrypt.hash(password, null, null, function(err, hash){
    // console.log(hash);
    // });

    const hash = bcrypt.hashSync(password);
    db.transaction(trx =>{
        //method 1
        trx.insert({
            hash: hash,
            email: email
        // based on method 2 below (both work)
        // return trx('login')
        // .returning('email')
        // .insert({
        //     hash: hash,
        //     email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            //method 2
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                }).then(user => {
                    res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    }
    )

    
        .catch(err=>res.status(400).json("unable to register"))


    // database.users.push({
    //     id: '125',
    //     name: name,
    //     email: email,
    //     entries: 0,
    //     joined: new Date()
    // })
    // res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    // let found = false;
    db.select('*').from('users').where({
        id: id
    })
        .then(user =>{
            if (user.length){
                res.json(user[0])
            } else {
                res.status(400).json('Not found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))
    // database.users.forEach(users => {
    //     if (users.id === id){
    //         found = true;
    //         return res.json(users);
    //     } 
    // })
    // if (!found) {
    //     res.status(404).json('no such user');
    // }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.status(400).json('unable to get entries'))
    // let found = false;
    // database.users.forEach(users => {
    //     if (users.id === id){
    //         found = true;
    //         users.entries++
    //         return res.json(users.entries);
    //     } 
    // })
    // if (!found) {
    //     res.status(400).json('no such user');
    // }
})


app.listen(3000, ()=> {
    console.log('app is running on port 3000');
})

/*
/ --> res = this is working
/sign --> POST success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT
*/