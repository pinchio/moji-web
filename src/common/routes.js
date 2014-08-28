var routes = [
    {
        route: '/'
      , handler: 'home'
    }
  , {
        route: '/:username/packs/:pack_id'
      , handler: 'emoji_collection_edit'
    }
]

module.exports = routes