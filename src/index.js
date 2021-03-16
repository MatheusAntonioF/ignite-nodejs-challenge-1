const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username)
    return response.status(404).json({ error: "Mensagem do erro" });

  request.username = username;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameExisting = users.some((user) => user.username === username);

  if (usernameExisting)
    return response.status(400).json({ error: "Username already exists" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { todos: foundTodos } = users.find(
    (user) => user.username === username
  );

  return response.json(foundTodos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request;

  const foundUser = users.find((user) => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  foundUser.todos = [...foundUser.todos, newTodo];

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { username } = request;

  const { title, deadline } = request.body;

  const foundUser = users.find((user) => user.username === username);

  let updatedTodo = null;

  foundUser.todos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = Object.assign(todo, { title, deadline });

      return updatedTodo;
    }
    return todo;
  });

  if (!updatedTodo)
    return response.status(404).json({ error: "Todo non existing" });

  return response.json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { username } = request;

  const { todos: foundTodos } = users.find(
    (user) => user.username === username
  );

  let updatedTodo = null;

  foundTodos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = Object.assign(todo, { done: true });
      return updatedTodo;
    }
    return todo;
  });

  if (!updatedTodo)
    return response.status(404).json({ error: "Todo non existing" });

  return response.json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { username } = request;

  const { todos: foundTodos } = users.find(
    (user) => user.username === username
  );

  const indexTodoWillBeDelete = foundTodos.findIndex((todo) => todo.id === id);

  if (indexTodoWillBeDelete < 0)
    return response.status(404).json({ error: "Todo non existing" });

  foundTodos.splice(indexTodoWillBeDelete, 1);

  return response.status(204).send();
});

module.exports = app;
