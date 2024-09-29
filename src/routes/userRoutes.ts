import { Router, Request, Response } from "express";
import pool from "../utils/db";
const bcrypt = require('bcrypt')

const router = Router();

interface User {
	id: number,
	username: string,
	email: string,
	password: string
}

router.get("/users", async (req: Request, res: Response) => {
	try {
		const result = await pool.query("SELECT * FROM users")
		const users: User[] = result.rows
		res.json(users)
	} catch (error) {
		console.error("Error fetching users", error)
		res.status(500).json({ error: "Error fetching todos" })
	}
})

router.post("/signup", async ( req: Request, res: Response ) => {
	const { username, email, password } = req.body

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)

	try {
		const result = await pool.query(
			"INSERT INTO users(username, email, passwordHash) VALUES($1, $2, $3) RETURNING *", [username, email, passwordHash]
		)
		const createdUser: User = result.rows[0]
		res.status(201).json(createdUser)
	} catch (error) {
		console.error("Error signing up", error);
		res.status(500).json({ error: "Error signing up" });
	}
})

export default router