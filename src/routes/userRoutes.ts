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
		const result = await pool.query("SELECT users.id, users.username, todos.task, todos.completed, todos. FROM users INNER JOIN todos ON users.id = todos.userid")
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
			"INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *", [username, email, passwordHash]
		)
		const createdUser: User = result.rows[0]
		res.status(201).json(createdUser)
	} catch (error) {
		console.error("Error signing up", error);
		res.status(500).json({ error: "Error signing up" });
	}
})

router.get("/users/:id", async (req: Request, res: Response ) => {
	const userID = parseInt(req.params.id, 10);
	// TypeScript type-based input validation
	if (isNaN(userID)) {
		return res.status(400).json({ error: "Invalid todo ID" });
	  }
	  try {
		const result = await pool.query("SELECT todos.task FROM users JOIN todos ON users.id = todos.userid WHERE users.id = $1 ", [userID]);
		const user: User[] = result.rows;
		res.json(user);
	  } catch (error) {
		console.error("Error fetching todos", error);
		res.status(500).json({ error: "Error fetching todos" });
	  }
})

export default router