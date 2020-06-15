# 🎮 Play online at [mindmeld.link](https://mindmeld.link/)

## What is this?
A networked implementation of the popular party game [Wavelength](https://www.wavelength.zone/) to play online together with family and friends over Zoom.

## How to play
1. Head to [the website](https://playmindmeld.herokuapp.com) to generate a game
2. Have all participants open the game link in a browser
3. The "psychic" (clue giver) for the blue team will click *peek* to see the target on the spectrum and provide a clue to their team
4. The blue teammates will decide on a percentage on the slider and click guess. The game automatically allocates points for correct guesses
5. Click "next game" to end the turn and generate the word pair for the red team
6. Enjoy!

## Development
* Clone the repo
* `npm install`
* `npm run dev` to view the frontend at localhost:3000
* `npm start` or `nodemon server.js` to run the backend server
* `npm run build` to generate static files before you deploy to prod

## Thanks
Thanks to the creators of Wavelength for creating a fantastic game and [@gjeuken](https://github.com/gjeuken/telewave) for the first static implementation. Thanks also to [@jbowens](https://github.com/jbowens/codenames) for the inspiration of implementing a networked version of the Codenames game.

☕️ [Buy the developer a chai](https://buymeacoff.ee/krithix)
