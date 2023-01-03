const express = require("express");
const app = express();
const Game = require("./games/Game");
const User = require("./users/User");
const connection = require("./database/connection");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const jwtSecret = "jdknskjn";

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connection
  .authenticate()
  .then(() => {
    console.log("BAnco de dados conectado");
  })
  .catch((err) => {
    console.log("OCorreu um erro na conexão com o banco de dados", err);
  });
function auth(req, res, next) {
  const authToken = req.headers["authorization"];
  console.log(authToken);
  if (authToken != undefined) {
    const bearer = authToken.split(" ");
    var token = bearer[1];

    jwt.verify(token, jwtSecret, (err, data) => {
      if (err) {
        res.status(401);
        res.json({ err: err });
      } else {
        req.token = token;
        req.loggedUser = { id: data.id, email: data.email };
        next();
        // res.json({data:data})
      }
    });
  }
}
app.get("/games", auth, (req, res) => {
  Game.findAll().then((games) => {
    if (games != undefined) {
      res.statusCode = 200;
      res.json(games);
    } else {
      res.statusCode = 404;
      res.send("Nenhum jogo cadastrado");
    }
  });
});

app.get("/game/:id", (req, res) => {
  if (!isNaN(req.params.id)) {
    var id = parseInt(req.params.id);
    Game.findByPk(id).then((game) => {
      if (game != undefined) {
        res.status.Code = 200;
        res.json(game);
      } else {
        res.statusCode = 404;
        res.send("Nenhum jogo encontrado");
      }
    });
  } else {
    res.status.Code = 400;
  }
});

app.post("/game", (req, res) => {
  var { title, price, year } = req.body;
  Game.create({
    title: title,
    price: price,
    year: year,
  })
    .then(() => {
      res.status.Code = 200;
      res.send("Dados criados com sucesso");
    })
    .catch(() => {
      res.sendStatus(404);
    });
});

app.delete("/game/:id", (req, res) => {
  if (!isNaN(req.params.id)) {
    var id = parseInt(req.params.id);
    Game.findByPk(id).then((game) => {
      if (game != undefined) {
        Game.destroy({
          where: {
            id: id,
          },
        })
          .then(() => {
            res.statusCode = 200;
            res.send("Dados deletado com sucesso");
          })
          .catch(() => {
            res.sendStatus(404);
            res.send("Erro ao deletar dados");
          });
      } else {
        res.statusCode = 404;
        res.send("Nenhum jogo encontrado");
      }
    });
  }
});

app.put("/game/:id", (req, res) => {
  if (!isNaN(req.params.id)) {
    var id = parseInt(req.params.id);
    Game.findByPk(id).then((game) => {
      if (game != undefined) {
        var { title, price, year } = req.body;
        if (title != undefined) {
          Game.update(
            {
              title: title,
            },
            {
              where: {
                id: id,
              },
            }
          );
        }
        if (price != undefined) {
          Game.update(
            {
              price: price,
            },
            {
              where: {
                id: id,
              },
            }
          );
        }
        if (year != undefined) {
          Game.update(
            {
              year: year,
            },
            {
              where: {
                id: id,
              },
            }
          );
        }
        res.sendStatus(200);
      } else {
        res.statusCode = 404;
        res.send("Nenhum jogo encontrado");
      }
    });
  }
});

app.post("/user", (req, res) => {
  var { name, email, password } = req.body;
  User.create({
    email: email,
    name: name,
    password: password,
  })
    .then(() => {
      res.status.Code = 200;
      res.send("Dados criados com sucesso");
    })
    .catch(() => {
      res.sendStatus(404);
    });
});

app.post("/auth", (req, res) => {
  var { email, password } = req.body;
  if (email != undefined) {
    User.findOne({
      where: {
        email: email,
        password: password,
      },
    }).then((user) => {
      if (user != undefined) {
        jwt.sign(
          { id: user.id, email: user.email },
          jwtSecret,
          {
            expiresIn: "48h",
          },
          (err, token) => {
            if (err) {
              res.status(400);
            } else {
              res.status(200);
              res.json({ token: token });
            }
          }
        );
      } else {
        res.status(404);
        res.json({ err: "As informações enviadas não pertencem a base dados" });
      }
    });
  } else {
    res.status(400);
  }
});

app.listen(3000, () => {
  console.log("API rodando no servidor 3000");
});
