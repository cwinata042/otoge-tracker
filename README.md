# Overview

This website is a tool for managing your otoge game collection, including tracking your library and adding reviews to games.

## https://otoge-tracker.vercel.app/

## Features

- Game Collection
  - Manually add games
  - Search VNDB for games to automatically import
  - Keep track of play status
- Game/Character Route Reviews
  - Add scores and notes to character routes
  - See total scores for each character

### Game Collection

![A screenshot of the game collection page showing a list of games](/docs/images/game-collection.png)
You can keep track of your game collection by adding new games or editing existing games. The following information can be tracked per game:

- Play Status
- Started and Completed Dates
- Owned Copies: Language, Platform, Original Price, and Purchased Price
- Character Routes: Includes Play Status and individual reviwes

#### Import from VNDB

![A screenshot of the VNDB import module](/docs/images/vndb-import.png)
Games can be imported from VNDB by searching for game name. Importing from VNDB allows you to automatically fetch game information, such as title, description, cover image, character routes, and voice actor information.

## Future Features

- Game Analytics: A page where you can see breakdowns of scores per game and character, total play time, and other metrics
- Customizable score categories and weights

## Build

1. To build and run the project locally, you will need to have `npm` installed and a MongoDB database set up.

2. Clone this repo and create an `.env` file in the root folder with the following:

```
MONGODB_URI=<Insert your MongoDB URI>
NEXTAUTH_SECRET=<Run npx auth secret to generate a random secret value>
NEXTAUTH_URL=http://localhost:3000
```

3. Install all dependencies using `npm install`.

4. Use `npm run dev` to run the app.

5. Open [http://localhost:3000](http://localhost:3000) with your browser.
