/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "r9czifbr30souwa",
    "created": "2024-08-31 14:12:24.407Z",
    "updated": "2024-08-31 14:12:24.407Z",
    "name": "log",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "fpup01z4",
        "name": "logs",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("r9czifbr30souwa");

  return dao.deleteCollection(collection);
})
