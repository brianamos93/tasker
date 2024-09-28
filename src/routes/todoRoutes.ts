import { Router, Request, Response } from "express";
import pool from "../utils/db";

const router = Router();

interface Todo {
  id: number;
  task: string;
  completed: boolean;
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

   // TypeScript type-based input validation
   if (typeof task !== "string" || task.trim() === "") {
     return res.status(400).json({ error: "Invalid task data" });
   }

   try {
     const result = await pool.query(
       "INSERT INTO todos (task) VALUES ($1) RETURNING *",
       [task]
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

   // TypeScript type-based input validation
   if (isNaN(todoID)) {
     return res.status(400).json({ error: "Invalid todo ID" });
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

   // TypeScript type-based input validation
   if (typeof task !== "string" || task.trim() === "") {
     return res.status(400).json({ error: "Invalid task data" });
   }

   try {
     await pool.query("UPDATE todos SET task = $1 WHERE id = $2", [
       task,
       todoID,
     ]);
     res.sendStatus(200);
   } catch (error) {
     console.error("Error updating todo", error);
     res.sendStatus(500).json({ error: "Error updating todo" });
   }
});

router.put("/todos/completed/:id", async (req: Request, res: Response) => {
  const todoID = parseInt(req.params.id, 10);

  try {
    await pool.query("UPDATE todos SET completed = TRUE WHERE id = $1", [
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

  try {
    await pool.query("UPDATE todos SET completed = FALSE WHERE id = $1", [
      todoID,
    ]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error updating todo", error);
    res.sendStatus(500).json({ error: "Error updating todo" });
  }
});
export default router;