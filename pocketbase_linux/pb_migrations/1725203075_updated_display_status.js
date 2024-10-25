/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // remove
  collection.schema.removeField("wproy6sw")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ewwjvfta",
    "name": "current_silde",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("q4s846hvm00rq4p")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wproy6sw",
    "name": "current_slide",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  // remove
  collection.schema.removeField("ewwjvfta")

  return dao.saveCollection(collection)
})
