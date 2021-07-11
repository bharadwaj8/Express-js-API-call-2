const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertCricketToResponse = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyName: obj.jerseyName,
    role: obj.role,
  };
};

//GET players API
app.get("/players/", async (request, response) => {
  const teamPlayersQuery = `
    SELECT * FROM cricket_team;`;

  const playerDetails = await db.all(teamPlayersQuery);
  response.send(playerDetails.map((each) => convertCricketToResponse(each)));
});

//Add player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
        );`;

  const dbResponse = await db.run(addPlayerQuery);

  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team 
    WHERE player_id=${playerId};`;

  const dbResponse = await db.get(getPlayerQuery);
  response.send(convertCricketToResponse(dbResponse));
});

//Update player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    WHERE player_id=${playerId};
    `;
  try {
    await db.run(updatePlayerQuery);
  } catch (e) {
    console.log(e.message);
  }

  response.send("Player Details Updated");
});

//Delete player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team 
    WHERE player_id=${playerId}`;

  await db.run(deletePlayerQuery);

  response.send("Player Removed");
});

module.exports = express;
