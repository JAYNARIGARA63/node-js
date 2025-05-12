const express = require("express");
let users = require("./MockData.json");
const fs = require("fs");
const app = express();
const PORT = 8000;

// middleware Plugin
app.use(express.urlencoded({ extended: false }));
app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.get("/users", (req, res) => {
  const html = `
  <ul>
  ${users.map((item) => `<li>${item.first_name}</li>`).join("")}
  </ul>
  `;
  res.send(html);
});

app
  .route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const particularIdData = users.find((item) => item.id === id);
    return res.json(particularIdData);
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "User fot found" });
    }

    users[index] = { ...users[index], ...req.body };

    fs.writeFile("./MockData.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      return res.json({ status: "Success", data: users[index] });
    });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const newUsers = users.filter((item) => item.id !== id);

    if (newUsers.length === users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    users = newUsers;

    fs.writeFile("./MockData.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to delete user" });
      }
      res.json({ status: "deleted", id });
    });
  });

app.post("/api/users", (req, res) => {
  const body = req.body;
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MockData.json", JSON.stringify(users), (err, data) => {
    return res.json({ status: "success", id: users.length });
  });
});

app.listen(PORT, () => console.log(`server start at ${PORT}`));
