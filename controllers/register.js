const handleRegister = (req, res, db, bcrypt, saltRounds) => {
	const { email, name, password } = req.body;
	if (!email || !name || !password) {
		return res.status(400).json('incorrect form submission');
	}
	const hash = bcrypt.hashSync(password, saltRounds);
		db.transaction(trx => { //create a transaction when you have to do more than 2 things at once, use trx to do db operations
			trx.insert({
				hash: hash,
				email: email
			})
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
						email: loginEmail[0],
						name: name,
						joined: new Date()
					})
					.then(user => {
						res.json(user[0]);
					})
			})
			.then(trx.commit)
			.catch(trx.rollback)
		})	
		.catch(err => res.status(400).json('unable to register'))
}

module.exports = {
	handleRegister: handleRegister
};