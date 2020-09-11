import { SECRET } from "./secret";
import express from "express";
import jwt from "jsonwebtoken";
import { connect } from '../db';
import { userSchema } from '../schemas/userSchema';
import { compare, hash } from 'bcrypt';
import { loginSchema } from "../schemas/loginSchema";

const router = express.Router();

router.post('/checkId', async (req, res) => {
    console.log('you in checkId')
    const { id } = req.body;
    console.log({id})
    const db = await connect();
    const isIdExist = await db.collection('users').find({ id }).toArray();
    console.log(isIdExist.length)
    if (isIdExist.length) {
        res.status(400).send({ success: false, msg: 'id exists already in DB' });
        return;
    }

    res.send({ success: true, msg: 'id not exists in DB' });
});

router.post('/register', async (req, res) => {
    const { name, lastName, userName, id, password, city, street } = req.body;
    console.log({ name, lastName, userName, id, password, city, street });
    const { error } = userSchema.validate({ name, lastName, userName, id, password, city, street });

    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const db = await connect();
    const users = await db.collection('users').find({ id }).toArray();
    
    if (users.length) {
        res.status(400).send('User already exists');
        return;
    }

    const hashedPassword = await hash(password, 10);
    const { insertedId } = await db.collection('users').insertOne({ name, lastName, userName, id, password: hashedPassword, city, street, cart: [] })
    console.log('when register inserted id-', insertedId);
    const token = generateToken(insertedId);
    console.log({ token });

    res.send({ success: true, msg: 'welcome!', token, userId: insertedId });
});

router.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    console.log(userName, password)

    const { error } = loginSchema.validate({ userName, password });
    console.log({error})
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const db = await connect();
    const user = await db.collection('users').find({ userName }, { fields: { _id: 1, password: 1, role:1 } }).toArray();
    console.log({user})
    let isAdmin = user[0].role;
    
    if(isAdmin === undefined){
        isAdmin = false
    }else{
        isAdmin= true
    }
    const { _id, password: hashedPasswordInDb } = user[0];

    const isPasswordCorrect = await compare(password, hashedPasswordInDb);

    if (!isPasswordCorrect) {
        return res.status(400).send({ success: false, msg: 'User name or password dont match.' });

    }
    const token = generateToken(_id);
    res.send({ success: true, token, userId: _id, isAdmin, msg:'Welcom back!' });

});


function generateToken(userId: number | null) {
    return jwt.sign({ id: userId }, SECRET);
}

export { router as users };