const handleImage = (req, res, db) => {
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
}

module.exports = {
    handleImage
}