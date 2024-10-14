import { Router, Request, Response } from "express";
const jwt = require('jsonwebtoken')
import pool from "../utils/db";

const router = Router();

interface Todo {
  id: number;
  task: string;
  completed: boolean;
  userId: number;
}

const getTokenFrom = (req: Request) => {
  const authorization = req.get('Authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

async function tasklookup(todoID: Number) {
  return await pool.query("SELECT id from todos WHERE id = $1", [todoID]);
}

async function taskUser(todoID: number) {
  return await pool.query("SELECT userid FROM todos WHERE id = $1", [todoID]);
}

async function tokenUser(decodedToken: any) {
  return await pool.query(
 "SELECT id FROM users WHERE id = $1",[decodedToken.id]
  );
}

function decodeToken(req: Request) {
  return jwt.verify(getTokenFrom(req), process.env.SECRET);
}



router.get("/", (req: Request, res: Response) => {
	res.send("Welcome to the To-Do List App!");
  });

router.get("/todos", async (req: Request, res: Response) => {
   try {
     const result = await pool.query("SELECT * FROM todos");
     const todos: Todo[] = result.rows;
     res.json(todos);
   } catch (error) {
     console.error("Error fetching todos", error);
     res.status(500).json({ error: "Error fetching todos" });
   }
 });

router.post("/todos", async (req: Request, res: Response) => {
   const { task } = req.body;
   const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
   if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid'})
   }
   const user = await pool.query(
    "SELECT * FROM users WHERE id = $1", [decodedToken.id]
   )

   // TypeScript type-based input validation
   if (typeof task !== "string" || task.trim() === "") {
     return res.status(400).json({ error: "Invalid task data" });
   }

   try {
     const result = await pool.query(
       "INSERT INTO todos (task, userid) VALUES ($1, $2) RETURNING *",
       [task, user.rows[0].id]
     );
     const createdTodo: Todo = result.rows[0];
     res.status(201).json(createdTodo);
   } catch (error) {
     console.error("Error adding todo", error);
     res.status(500).json({ error: "Error adding todo" });
   }
 });

router.delete("/todos/:id", async (req: Request, res: Response) => {
   const todoID = parseInt(req.params.id, 10);
   const taskcheck = await tasklookup(todoID)
   if (taskcheck.rowCount == 0) {
    return res.status(401).json({ error: 'task does not exist'})
   }
   const decodedToken = decodeToken(req)
   if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid'})
   }
   // TypeScript type-based input validation
   if (isNaN(todoID)) {
     return res.status(400).json({ error: "Invalid todo ID" });
   }

   const user = await tokenUser(decodedToken)
   const taskuser = await taskUser(todoID)
   if (user.rows[0].id !== taskuser.rows[3].userid) {
    return res.status(400).json({ error: "User not authorized" })
   }
   try {
     await pool.query("DELETE FROM todos WHERE id = $1", [todoID]);
     res.sendStatus(200);
   } catch (error) {
     console.error("Error deleting todo", error);
     res.status(500).json({ error: "Error deleting todo" });
   }
 });

router.put("/todos/:id", async (req: Request, res: Response) => {
   const todoID = parseInt(req.params.id, 10);
   const { task } = req.body;
   const taskcheck = await tasklookup(todoID)

   if (taskcheck.rowCount == 0) {
    return res.status(401).json({ error: 'task does not exist'})
   }

   const decodedToken = decodeToken(req)
   if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid'})
   }

   // TypeScript type-based input validation
   if (isNaN(todoID)) {
     return res.status(400).json({ error: "Invalid todo ID" });
   }
 
   const user = await tokenUser(decodedToken)
   const taskuser = await taskUser(todoID)

   if (user.rows[0].id !== taskuser.rows[0].userid) {
    return res.status(400).json({ error: "User not authorized" })
   }

   // TypeScript type-based input validation
   if (typeof task !== "string" || task.trim() === "") {
     return res.status(400).json({ error: "Invalid task data" });
   }

   try {
     await pool.query("UPDATE todos SET task = $1 ,date_updated = CURRENT_TIMESTAMP WHERE id = $2", [
       task,
       todoID,
     ]);
     res.sendStatus(200);
   } catch (error) {
     res.sendStatus(500).json({ error: "Error updating todo" });
   }


});

router.put("/todos/completed/:id", async (req: Request, res: Response) => {
  const todoID = parseInt(req.params.id, 10);
  const taskcheck = await tasklookup(todoID)
  if (taskcheck.rowCount == 0) {
   return res.status(401).json({ error: 'task does not exist'})
  }
  const decodedToken = decodeToken(req)
  if (!decodedToken.id) {
   return res.status(401).json({ error: 'token invalid'})
  }
  // TypeScript type-based input validation
  if (isNaN(todoID)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  const user = await tokenUser(decodedToken)
  const taskuser = await taskUser(todoID)
  if (user.rows[0].id !== taskuser.rows[0].userid) {
   return res.status(400).json({ error: "User not authorized" })
  }
  try {
    await pool.query("UPDATE todos SET completed = TRUE ,date_updated=CURRENT_TIMESTAMP WHERE id = $1", [
      todoID,
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating todo", error);
    res.sendStatus(500).json({ error: "Error updating todo" });
  }
});

router.put("/todos/incomplete/:id", async (req: Request, res: Response) => {
  const todoID = parseInt(req.params.id, 10);
  const taskcheck = await tasklookup(todoID)
  if (taskcheck.rowCount == 0) {
   return res.status(401).json({ error: 'task does not exist'})
  }
  const decodedToken = decodeToken(req)
  if (!decodedToken.id) {
   return res.status(401).json({ error: 'token invalid'})
  }
  // TypeScript type-based input validation
  if (isNaN(todoID)) {
    return res.status(400).json({ error: "Invalid todo ID" });
  }

  const user = await tokenUser(decodedToken)
  const taskuser = await taskUser(todoID)
  if (user.rows[0].id !== taskuser.rows[0].userid) {
   return res.status(400).json({ error: "User not authorized" })
  }
  try {
    await pool.query("UPDATE todos SET completed = FALSE ,date_updated=CURRENT_TIMESTAMP WHERE id = $1", [
      todoID,
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating todo", error);
    res.sendStatus(500).json({ error: "Error updating todo" });
  }
});
export default router;

