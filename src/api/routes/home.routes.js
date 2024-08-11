import express from 'express';

const home = express.Router();


home.get('/', (req, res) => {
  return res.status(200).json("Spotify Backend cicd");
});

export default home;
