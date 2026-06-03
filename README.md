# GameRatings

A GameRatings egy játékértékelő webalkalmazás, ahol különböző játékokat lehet megtekinteni, műfaj szerint szűrni, keresni és rendezni. A játékokra kattintva megjelenik a részletes oldal, ahol láthatók a hozzá tartozó kommentek és értékelések. A felhasználó új kommentet írhat, majd a saját kommentjét később módosíthatja vagy törölheti.

Használt technológiák
HTML
CSS
TypeScript
Vite
JSON Server
Git / GitHub

Az adatok a db.json fájlban vannak tárolva.

Két fő erőforrás van:

A játékok adatai:

id
title
releaseDate
genre
description
imageUrl

A kommentek adatai:

id
gameId
username
rating
content
createdAt

A gameId kapcsolja össze a kommentet a megfelelő játékkal.

Fő funkciók
játékok listázása
játék részletes oldalának megjelenítése
kommentek megjelenítése játékok alatt
új komment hozzáadása
saját komment módosítása
saját komment törlése
játékok keresése cím vagy műfaj alapján
rendezés cím, megjelenési dátum és értékelés alapján
átlagértékelés számítása a kommentekből

Backend

A backend szerepét a JSON Server látja el.
A db.json fájl tartalmazza a játékokat és a kommenteket.

Használt végpontok:

GET /games
GET /comments
POST /comments
PATCH /comments/:id
DELETE /comments/:id

Frontend

A frontend Vite + TypeScript alapon készült.

Fontosabb részek:

main.ts – az oldal működésének fő logikája
Gameservice.ts – játékok lekérése a backendből
Commentservice.ts – kommentek lekérése, hozzáadása, módosítása és törlése
game.ts – Game interface
comment.ts – Comment interface
style.css – megjelenés és reszponzív dizájn
index.html – alap HTML szerkezet