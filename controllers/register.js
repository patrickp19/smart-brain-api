const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    // bcrypt.hash(password, null, null, function(err, hash){
    // console.log(hash);
    // });

    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }

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
}

module.exports = {
    handleRegister: handleRegister
};