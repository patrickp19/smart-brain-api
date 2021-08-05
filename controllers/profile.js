const handleProfileGet = (req, res, db) => {
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
}

module.exports = {
    handleProfileGet: handleProfileGet
}