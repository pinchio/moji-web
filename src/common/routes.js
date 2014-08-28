var routes = [
    {
        route: '/'
      , handler: 'home'
    }
  , {
        route: '/:username/packs/:pack_id/edit'
      , handler: 'emoji_collection_edit'
    }
]

module.exports = routes